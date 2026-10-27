// SVGs from ln-dev7/logos-apps, pinned and served locally. See docs/APP_LOGOS.md.
const logos = {
  Zapier: 'zapier', 'Zapier AI': 'zapier', HubSpot: 'hubspot', Make: 'make',
  OpenAI: 'openai', Claude: 'claude', Airtable: 'airtable', Slack: 'slack',
  Stripe: 'stripe-s', 'Google Workspace': 'google-workspace', Supabase: 'supabase',
  Cursor: 'cursor', 'Google Sheets': 'google-sheets', QuickBooks: 'quickbooks',
  Gmail: 'google-gmail', Notion: 'notion', Asana: 'asana', n8n: 'n8n', Gemini: 'google-gemini',
  SignNow: 'signnow', 'monday.com': 'monday', ActiveCampaign: 'active-campaign', Wix: 'wix',
  Lovable: 'lovable', Bolt: 'boltnew', Outlook: 'microsoft-outlook', Twilio: 'twilio',
  'Google Ads': 'google-ads', 'Facebook Lead Ads': 'facebook', Figma: 'figma',
  GitHub: 'github', Vercel: 'vercel', 'Next.js': 'nextjs', Drive: 'google-drive',
  'Google Drive': 'google-drive', Xero: 'xero',
  Shopify: 'shopify', Dropbox: 'dropbox', 'Meta Ads': 'meta',
  'Google Apps Script': 'google-apps-script',
};
const wordmarks = new Set(['hubspot', 'google-workspace', 'google-gemini', 'wix']);

export default function AppBrand({ name }) {
  const logo = logos[name];
  if (!logo) return <>{name}</>;
  const wordmark = wordmarks.has(logo);
  return <span className={`app-brand${wordmark ? ' app-brand--wordmark' : ''}`}>
    <img src={`/assets/apps/${logo}.svg`} alt={wordmark ? name : ''} aria-hidden={wordmark ? undefined : true} width={wordmark ? 80 : 24} height={24} decoding="async" />
    {!wordmark && <span>{name}</span>}
  </span>;
}
