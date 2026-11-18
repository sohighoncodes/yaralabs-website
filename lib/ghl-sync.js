const API_ROOT = 'https://services.leadconnectorhq.com';
const FAILURE_CODE = 'GHL_SYNC_FAILED';

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseConfig(env) {
  if (!nonEmpty(env?.GHL_SYNC_CONFIG)) return null;
  try {
    const value = JSON.parse(env.GHL_SYNC_CONFIG);
    const contact = value?.fields?.contact;
    const opportunity = value?.fields?.opportunity;
    const required = [
      value?.locationId, value?.pipelineId, value?.stages?.new_enquiry, value?.stages?.discovery_booked,
      contact?.serviceInterest, contact?.currentTools, contact?.projectBrief, contact?.leadSource,
      contact?.budgetRange, contact?.projectTimeline, contact?.websiteInquiryId,
      opportunity?.projectType, opportunity?.contractStatus,
    ];
    if (!nonEmpty(value?.token) || !value.token.startsWith('pit-') || value.token.length < 12 || !required.every(nonEmpty)) return null;
    return value;
  } catch {
    return null;
  }
}

function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return { firstName: parts.shift() || 'Website', lastName: parts.join(' ') };
}

function projectType(lead) {
  if (lead?.intent === 'audit') return 'Automation';
  const text = [lead?.intent, lead?.tools, lead?.message].filter(Boolean).join(' ').toLowerCase();
  if (/\b(ai|agent|llm|chatbot)\b/.test(text)) return 'AI Agents';
  if (/\b(crm|pipeline|salesforce|hubspot)\b/.test(text)) return 'CRM Setup';
  if (/\b(app|application|portal|dashboard)\b/.test(text)) return 'Custom Apps';
  if (/\b(automation|automate|workflow|integration|integrate)\b/.test(text)) return 'Automation';
  return 'Other';
}

async function apiRequest(path, config, body, fetchImpl) {
  for (let attempt = 0; attempt < 2; attempt++) {
    let response;
    try {
      response = await fetchImpl(`${API_ROOT}${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.token}`,
          Version: 'v3',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      if (attempt === 0) continue;
      throw new Error(FAILURE_CODE);
    }
    if (response.ok) return response;
    if (attempt === 0 && (response.status === 429 || response.status >= 500)) continue;
    throw new Error(FAILURE_CODE);
  }
  throw new Error(FAILURE_CODE);
}

export async function syncLeadToGhl(env, lead, stage, fetchImpl = fetch) {
  const config = parseConfig(env);
  if (!config) return { skipped: true };
  if (!['new_enquiry', 'discovery_booked'].includes(stage)) throw new Error(FAILURE_CODE);

  try {
    const type = projectType(lead);
    const { firstName, lastName } = splitName(lead?.name);
    const contactFields = config.fields.contact;
    const contactResponse = await apiRequest('/contacts/upsert', config, {
      locationId: config.locationId,
      firstName,
      lastName,
      name: String(lead?.name || '').trim(),
      email: String(lead?.email || '').trim().toLowerCase(),
      ...(lead?.phone ? { phone: String(lead.phone).trim() } : {}),
      source: 'Yara Labs Website',
      customFields: [
        { id: contactFields.serviceInterest, fieldValue: type },
        { id: contactFields.currentTools, fieldValue: String(lead?.tools || '') },
        { id: contactFields.projectBrief, fieldValue: String(lead?.message || '') },
        { id: contactFields.leadSource, fieldValue: String(lead?.source || 'Website') },
        { id: contactFields.budgetRange, fieldValue: 'Not specified' },
        { id: contactFields.projectTimeline, fieldValue: 'Not specified' },
        { id: contactFields.websiteInquiryId, fieldValue: String(lead?.id || '') },
      ],
    }, fetchImpl);
    const contact = await contactResponse.json();
    const contactId = contact?.contact?.id;
    if (!nonEmpty(contactId)) throw new Error(FAILURE_CODE);

    await apiRequest(`/contacts/${encodeURIComponent(contactId)}/tags`, config, { tags: ['website-lead'] }, fetchImpl);

    const opportunityFields = config.fields.opportunity;
    await apiRequest('/opportunities/upsert', config, {
      locationId: config.locationId,
      pipelineId: config.pipelineId,
      pipelineStageId: config.stages[stage],
      contactId,
      name: `${String(lead?.name || '').trim()} - ${type}`,
      status: 'open',
      customFields: [
        { id: opportunityFields.projectType, fieldValue: type },
        { id: opportunityFields.contractStatus, fieldValue: 'Not sent' },
      ],
    }, fetchImpl);
    return { synced: true };
  } catch {
    throw new Error(FAILURE_CODE);
  }
}

export function queueGhlLeadSync(ctx, env, lead, stage, fetchImpl = fetch) {
  if (!parseConfig(env)) return false;
  const pending = syncLeadToGhl(env, lead, stage, fetchImpl).catch(() => console.warn(FAILURE_CODE));
  if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(pending);
  return true;
}
