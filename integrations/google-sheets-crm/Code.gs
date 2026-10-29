// Private owner-run CRM. No public web app, email sending, or calendar permissions.
var CRM = {
  owner: 'cjgomba@yaralabs.io',
  endpoint: 'https://euahhliojookeumcvpem.supabase.co/functions/v1/crm-feed',
  stages: ['New','Contacted','Discovery scheduled','Qualified','Proposal sent','Negotiation','Won','Lost','On hold'],
  currencies: ['USD','PHP','AUD','GBP','EUR'],
  headers: {
    Contacts: ['Name','Email','Phone','Company','Lifecycle','Owner','Last contacted','Next follow-up','Notes','Current tools','First seen','Last website activity','Contact ID'],
    Deals: ['Deal','Contact','Stage','Value','Currency','Expected close','Next action','Follow-up due','Last contacted','Owner','Priority','Notes','Form status','Booking time','Created','Enquiry ID','Contact ID','Email','Closed date','Lost reason'],
    Activities: ['Date','Contact email','Enquiry ID','Type','Summary','Next action','Due date','Status','Owner'],
    Enquiries: ['Enquiry ID','Name','Email','Phone','Enquiry type','Form status','Current tools','Message','Source page','Created','Last activity','Details submitted','Booking confirmed','Booking start','Booking end','Abandoned at']
  }
};

function setupCRM() {
  assertOwner_();
  var properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('CRM_FEED_SECRET')) throw new Error('Set CRM_FEED_SECRET in Script Properties first.');
  var existing = properties.getProperty('CRM_SHEET_ID');
  if (existing) {
    var savedBook=SpreadsheetApp.openById(existing);
    if(properties.getProperty('CRM_INITIALIZED')!=='true')throw new Error('CRM setup was interrupted before formatting finished. Inspect the existing workbook before retrying.');
    finishSetup_(savedBook); return;
  }
  var book = SpreadsheetApp.create('Yara Labs CRM', 1000, 20);
  properties.setProperty('CRM_SHEET_ID', book.getId());
  book.setSpreadsheetTimeZone('Asia/Manila').setSpreadsheetLocale('en_US');
  book.getSheets()[0].setName('Pipeline');
  Object.keys(CRM.headers).forEach(function(name) {
    var sheet = book.insertSheet(name);
    sheet.getRange(1,1,1,CRM.headers[name].length).setValues([CRM.headers[name]]);
    sheet.setFrozenRows(1); sheet.setFrozenColumns(name === 'Contacts' ? 2 : 1);
    sheet.getRange(1,1,1000,CRM.headers[name].length).setFontFamily('Arial').setFontSize(10).setVerticalAlignment('middle');
    sheet.getRange(1,1,1,CRM.headers[name].length).setFontWeight('bold').setBackground('#f1f3f4').setWrap(true);
    sheet.setRowHeight(1,38); sheet.setColumnWidths(1,CRM.headers[name].length,150);
  });
  book.insertSheet('Guide');
  formatCRM_(book);
  properties.setProperty('CRM_INITIALIZED','true');
  finishSetup_(book);
}

function finishSetup_(book) {
  var properties=PropertiesService.getScriptProperties();
  syncCRM();
  if(!properties.getProperty('CRM_TABLES'))installTables_(book);
  var handlers = ScriptApp.getProjectTriggers().map(function(t) { return t.getHandlerFunction(); });
  if (handlers.indexOf('syncCRM') < 0) ScriptApp.newTrigger('syncCRM').timeBased().everyMinutes(5).create();
  if (handlers.indexOf('crmEdit') < 0) ScriptApp.newTrigger('crmEdit').forSpreadsheet(book).onEdit().create();
  properties.setProperty('CRM_ACTIVE','true');
  console.log('CRM ready: ' + book.getUrl());
}

function assertOwner_() {
  if (Session.getEffectiveUser().getEmail().toLowerCase() !== CRM.owner) throw new Error('Use the Yara Labs owner account.');
}

function crmEdit(event) {
  if (!event || event.source.getId() !== PropertiesService.getScriptProperties().getProperty('CRM_SHEET_ID') ||
      event.range.getSheet().getName() !== 'Pipeline' || event.range.getA1Notation() !== 'B6' || event.value !== 'TRUE') return;
  try { syncCRM(); } finally { event.range.setValue(false); }
}

function syncCRM() {
  assertOwner_();
  var lock = LockService.getScriptLock(); if (!lock.tryLock(1000)) return;
  var book, properties = PropertiesService.getScriptProperties();
  try {
    book = SpreadsheetApp.openById(properties.getProperty('CRM_SHEET_ID'));
    prepareManualRows_(book);
    var cursor = properties.getProperty('CRM_CURSOR') || null, started = Date.now(), processed = 0;
    do {
      var response = UrlFetchApp.fetch(CRM.endpoint, {
        method:'post',contentType:'application/json',headers:{'X-CRM-Secret':properties.getProperty('CRM_FEED_SECRET')},
        payload:JSON.stringify({after:cursor}),muteHttpExceptions:true
      });
      if (response.getResponseCode() !== 200) throw new Error('Website feed unavailable. Retry is automatic.');
      var result = JSON.parse(response.getContentText());
      if (!Array.isArray(result.rows)) throw new Error('Invalid feed response.');
      var index = indexes_(book);
      result.rows.forEach(function(lead) { upsertLead_(book,index,lead); });
      // Save the cursor only after all writes succeed; replaying a batch is idempotent.
      SpreadsheetApp.flush();
      processed += result.rows.length; cursor = result.nextCursor;
      properties.setProperty('CRM_CURSOR',cursor || '');
    } while(cursor && Date.now()-started < 210000);
    extendTables_(book);
    updatePipeline_(book);
    var pipeline = book.getSheetByName('Pipeline');
    pipeline.getRange('B3').setValue(cursor ? 'Syncing remaining enquiries' : 'Connected');
    if (!cursor) { pipeline.getRange('B4').setValue(new Date()).setNumberFormat('dd mmm yyyy, h:mm AM/PM'); properties.setProperty('CRM_LAST_SUCCESS',new Date().toISOString()); }
    pipeline.getRange('B5').setValue('Every 5 minutes. Times shown in Manila.');
    console.log('CRM sync processed ' + processed + ' enquiries.');
  } catch (error) {
    if (book) book.getSheetByName('Pipeline').getRange('B3').setValue('Sync failed. Last successful sync remains below.');
    // Never log visitor payloads or credentials.
    throw new Error('CRM sync failed. Check the feed configuration and retry syncCRM.');
  } finally { lock.releaseLock(); }
}

function indexes_(book) {
  var out = {};
  [['Contacts',12],['Deals',15],['Enquiries',0]].forEach(function(item) {
    var sheet=book.getSheetByName(item[0]), count=sheet.getLastRow()-1, rows=count>0 ? sheet.getRange(2,1,count,CRM.headers[item[0]].length).getValues() : [];
    out[item[0]]={rows:rows,byId:{},next:Math.max(2,sheet.getLastRow()+1)};
    rows.forEach(function(row,i) { if(row[item[1]]) { if(out[item[0]].byId[row[item[1]]]) throw new Error('Duplicate CRM ID'); out[item[0]].byId[row[item[1]]]={row:i+2,values:row}; } });
  });
  return out;
}

// Values received from a public form must remain literal text, never formulas.
function text_(value) { var s=String(value == null ? '' : value); return /^\s*[=+@-]|^[\t\r\n]/.test(s) ? "'"+s : s; }
function date_(value) { if(!value) return ''; var d=new Date(value); return isNaN(d.getTime()) ? '' : d; }
function contactId_(email) { return 'C-'+Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,email.trim().toLowerCase(),Utilities.Charset.UTF_8).map(function(b){return ('0'+((b+256)%256).toString(16)).slice(-2);}).join('').slice(0,24); }
function row_(sheet,index,id,values) {
  var item=index.byId[id]; if(item) return item;
  var row=index.next++;
  if(row>sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(),Math.max(500,row-sheet.getMaxRows()));
  sheet.getRange(row,1,1,values.length).setValues([values]);
  item={row:row,values:values};index.byId[id]=item;return item;
}

function upsertLead_(book,index,lead) {
  var email=String(lead.email).trim().toLowerCase(), contactId=contactId_(email), contactSheet=book.getSheetByName('Contacts');
  var contact=row_(contactSheet,index.Contacts,contactId,[text_(lead.name),text_(email),text_(lead.phone),'','Lead',CRM.owner,'','','',text_(lead.tools),date_(lead.created_at),date_(lead.last_activity_at),contactId]);
  if(!contact.values[11] || new Date(lead.last_activity_at).getTime() >= new Date(contact.values[11]).getTime()) {
    contactSheet.getRange(contact.row,1,1,3).setValues([[text_(lead.name),text_(email),text_(lead.phone)]]);
    contactSheet.getRange(contact.row,10).setValue(text_(lead.tools));
    contactSheet.getRange(contact.row,12).setValue(date_(lead.last_activity_at));
    contact.values[11]=date_(lead.last_activity_at);
  }
  if(new Date(lead.created_at).getTime()<new Date(contact.values[10]).getTime()) { contactSheet.getRange(contact.row,11).setValue(date_(lead.created_at));contact.values[10]=date_(lead.created_at); }
  var dealSheet=book.getSheetByName('Deals');
  var deal=row_(dealSheet,index.Deals,lead.id,[text_((lead.intent==='quote'?'Quote':'Discovery call')+' — '+lead.name),text_(lead.name),lead.lead_status==='completed'?'Discovery scheduled':'New','','USD','','','', '',CRM.owner,'Normal','',lead.lead_status,date_(lead.booking_start),date_(lead.created_at),lead.id,contactId,text_(email),'','']);
  // Never rewrite the editable sales stage, value, tasks, dates, owner or notes.
  dealSheet.getRange(deal.row,2).setValue(text_(lead.name));
  dealSheet.getRange(deal.row,13,1,6).setValues([[lead.lead_status,date_(lead.booking_start),date_(lead.created_at),lead.id,contactId,text_(email)]]);
  var source=book.getSheetByName('Enquiries'), record=[lead.id,text_(lead.name),text_(email),text_(lead.phone),lead.intent,lead.lead_status,text_(lead.tools),text_(lead.message),text_(lead.source),date_(lead.created_at),date_(lead.last_activity_at),date_(lead.details_submitted_at),date_(lead.completed_at),date_(lead.booking_start),date_(lead.booking_end),date_(lead.abandoned_at)];
  var enquiry=row_(source,index.Enquiries,lead.id,record);
  source.getRange(enquiry.row,1,1,record.length).setValues([record]);
}

function formatCRM_(book) {
  var contacts=book.getSheetByName('Contacts'),deals=book.getSheetByName('Deals'),activities=book.getSheetByName('Activities'),source=book.getSheetByName('Enquiries');
  contacts.setColumnWidths(1,2,210);contacts.setColumnWidth(9,320);contacts.setColumnWidth(10,240);contacts.setColumnWidths(11,2,180);
  deals.setColumnWidth(1,280);deals.setColumnWidth(2,190);deals.setColumnWidth(7,250);deals.setColumnWidth(12,320);deals.setColumnWidth(14,200);deals.setColumnWidth(18,240);deals.setColumnWidth(20,240);
  source.setColumnWidth(1,300);source.setColumnWidth(3,240);source.setColumnWidth(7,260);source.setColumnWidth(8,480);source.setColumnWidths(10,7,180);
  activities.setColumnWidth(2,240);activities.setColumnWidths(5,2,320);
  contacts.getRange('C2:C1000').setNumberFormat('@');source.getRange('D2:D1000').setNumberFormat('@');
  ['G2:H1000','K2:L1000'].forEach(function(r){contacts.getRange(r).setNumberFormat('dd mmm yyyy');});
  ['F2:F1000','H2:I1000','S2:S1000'].forEach(function(r){deals.getRange(r).setNumberFormat('dd mmm yyyy');});
  deals.getRange('N2:O1000').setNumberFormat('dd mmm yyyy, h:mm AM/PM');deals.getRange('D2:D1000').setNumberFormat('#,##0.00');
  activities.getRange('A2:A1000').setNumberFormat('dd mmm yyyy');activities.getRange('G2:G1000').setNumberFormat('dd mmm yyyy');source.getRange('J2:P1000').setNumberFormat('dd mmm yyyy, h:mm AM/PM');
  [['Contacts',['A:C','J:M']],['Deals',['B:B','M:R']],['Enquiries',['A:P']]].forEach(function(pair){pair[1].forEach(function(range){var protect=book.getSheetByName(pair[0]).getRange(range).protect();protect.setDescription('Website sync fields — edit sales fields instead').setWarningOnly(true);});});
  dropdown_(contacts,'E2:E1000',['Lead','Prospect','Client','Past client']);
  dropdown_(deals,'C2:C1000',CRM.stages);dropdown_(deals,'E2:E1000',CRM.currencies);dropdown_(deals,'K2:K1000',['Low','Normal','High']);
  dropdown_(activities,'D2:D1000',['Call','Email','Meeting','Task','Note']);dropdown_(activities,'H2:H1000',['Open','Done','Cancelled']);
  deals.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($H2<>"",$H2<TODAY(),$C2<>"Won",$C2<>"Lost")').setBackground('#fce8e6').setRanges([deals.getRange('G2:H1000')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Won').setBackground('#e6f4ea').setRanges([deals.getRange('C2:C1000')]).build()
  ]);
  contacts.setConditionalFormatRules([SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($H2<>"",$H2<TODAY())').setBackground('#fce8e6').setRanges([contacts.getRange('H2:H1000')]).build()]);
  activities.setConditionalFormatRules([SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($G2<>"",$G2<TODAY(),$H2="Open")').setBackground('#fce8e6').setRanges([activities.getRange('F2:H1000')]).build()]);
  var guide=book.getSheetByName('Guide');
  var guidance=[['Yara Labs CRM','How to use your workspace'],['Daily routine','Check Pipeline, filter Deals by Follow-up due, then log calls and tasks in Activities.'],['Contacts','One contact per normalized email. Edit Company, Lifecycle, Owner, Last contacted, Next follow-up and Notes.'],['Deals','One deal per website enquiry. Update Stage, Value, Currency, Expected close, Next action and Follow-up due.'],['Pipeline stages',CRM.stages.join(', ')],['Won clients','Set a deal to Won, enter Closed date, then set the contact Lifecycle to Client. Use the Contacts filter to view clients.'],['Activities','Add calls, emails, meetings, notes and tasks. Use the contact email and optional enquiry ID to link them. Set task Status to Open or Done.'],['Automatic fields','Contacts A:C and J:M, Deals B and M:R, and all Enquiries fields are refreshed from the website. Warning protections identify them.'],['Sales stage vs form status','Sales stage is yours to manage. Form status is automatic and does not overwrite it. A confirmed booking is not a won sale.'],['Form statuses','in_progress = valid contact saved; abandoned = 30 minutes inactive; completed = Google confirmed; booking_pending = check calendar; legacy_submitted = older enquiry.'],['Sync','Every 5 minutes, even when this sheet is closed. Pipeline shows connection health and last completed sync. Tick Sync website leads now on Pipeline to refresh.'],['Values and currency','Value is editable. USD is the initial default; choose the correct currency. Pipeline totals are separated by currency and never converted.'],['Manual contacts and deals','Add a contact row with Name and Email. For an offline deal, enter Deal, Contact and Email (column R). IDs are assigned on the next sync; edit sales fields normally.'],['Sorting and IDs','Use table filters or sort whole tables. Keep Contact ID and Enquiry ID unchanged. Do not sort one column by itself.'],['Privacy','Private to cjgomba@yaralabs.io unless you choose to share it. No automated marketing messages are sent.'],['Archive and deletion','Mark Lost, On hold or Past client to retain history. Deleting a synced row recreates it on the next sync. Source deletions do not remove CRM history automatically.'],['Repeat enquiries','The same email links to one contact; separate enquiries remain separate deals. Editing an email can create a separate contact.'],['Recovery','If a sync fails, saved leads remain in the website database. The next run retries with stable IDs. Never paste credentials into this sheet.']];
  guide.getRange(1,1,guidance.length,2).setValues(guidance).setFontFamily('Arial').setFontSize(10).setVerticalAlignment('top').setWrap(true);
  guide.setColumnWidth(1,190);guide.setColumnWidth(2,790);guide.getRange('A1:B1').setFontWeight('bold').setBackground('#f1f3f4');guide.autoResizeRows(1,guidance.length);guide.setFrozenRows(1);
  updatePipeline_(book);
  book.getSheetByName('Pipeline').getRange('A6').setValue('Sync website leads now');
  book.getSheetByName('Pipeline').getRange('B6').insertCheckboxes();
}

function dropdown_(sheet,range,values) { sheet.getRange(range).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(values,true).setAllowInvalid(false).build()); }

function prepareManualRows_(book) {
  var contacts=book.getSheetByName('Contacts'),deals=book.getSheetByName('Deals');
  if(contacts.getLastRow()>1)contacts.getRange(2,1,contacts.getLastRow()-1,13).getValues().forEach(function(r,i){
    if(r[1] && !r[12]){contacts.getRange(i+2,13).setValue(contactId_(String(r[1])));if(!r[4])contacts.getRange(i+2,5).setValue('Lead');if(!r[5])contacts.getRange(i+2,6).setValue(CRM.owner);}
  });
  if(deals.getLastRow()>1)deals.getRange(2,1,deals.getLastRow()-1,20).getValues().forEach(function(r,i){
    if(r[0] && !r[15]){deals.getRange(i+2,16).setValue('M-'+Utilities.getUuid());deals.getRange(i+2,13).setValue('manual');deals.getRange(i+2,15).setValue(new Date());if(!r[2])deals.getRange(i+2,3).setValue('New');if(!r[4])deals.getRange(i+2,5).setValue('USD');if(r[17])deals.getRange(i+2,17).setValue(contactId_(String(r[17])));}
  });
}

function updatePipeline_(book) {
  var s=book.getSheetByName('Pipeline'), limit=Math.max(1000,book.getSheetByName('Deals').getLastRow()+500,book.getSheetByName('Contacts').getLastRow()+500,book.getSheetByName('Activities').getLastRow()+500);
  Object.keys(CRM.headers).forEach(function(name){var sheet=book.getSheetByName(name);if(sheet.getMaxRows()<limit)sheet.insertRowsAfter(sheet.getMaxRows(),limit-sheet.getMaxRows());});
  s.getRange('A1').setValue('Yara Labs CRM').setFontSize(16).setFontWeight('bold');
  s.getRange('A3:A5').setValues([['Website sync'],['Last full sync'],['Schedule']]);
  s.getRange('A7:B7').setValues([['Pipeline stage','Deals']]);
  CRM.stages.forEach(function(stage,i){s.getRange(i+8,1,1,2).setValues([[stage,'']]);s.getRange(i+8,2).setFormula('=COUNTIFS(Deals!$C$2:$C$'+limit+',A'+(i+8)+',Deals!$P$2:$P$'+limit+',"<>")');});
  s.getRange('D7:G7').setValues([['Currency','Open value','Won value','Open deals']]);
  CRM.currencies.forEach(function(currency,i){var r=i+8;s.getRange(r,4).setValue(currency);s.getRange(r,5).setFormula('=SUMIFS(Deals!$D$2:$D$'+limit+',Deals!$E$2:$E$'+limit+',D'+r+',Deals!$C$2:$C$'+limit+',"<>Won",Deals!$C$2:$C$'+limit+',"<>Lost")');s.getRange(r,6).setFormula('=SUMIFS(Deals!$D$2:$D$'+limit+',Deals!$E$2:$E$'+limit+',D'+r+',Deals!$C$2:$C$'+limit+',"Won")');s.getRange(r,7).setFormula('=COUNTIFS(Deals!$E$2:$E$'+limit+',D'+r+',Deals!$C$2:$C$'+limit+',"<>Won",Deals!$C$2:$C$'+limit+',"<>Lost",Deals!$P$2:$P$'+limit+',"<>")');});
  s.getRange('E8:F12').setNumberFormat('#,##0.00');
  s.getRange('D15:E15').setValues([['Follow-up queue','Count']]);
  s.getRange('D16:D19').setValues([['Overdue deal follow-ups'],['Overdue contact follow-ups'],['Overdue open tasks'],['Clients']]);
  s.getRange('E16').setFormula('=COUNTIFS(Deals!$H$2:$H$'+limit+',"<"&TODAY(),Deals!$H$2:$H$'+limit+',">0",Deals!$C$2:$C$'+limit+',"<>Won",Deals!$C$2:$C$'+limit+',"<>Lost")');
  s.getRange('E17').setFormula('=COUNTIFS(Contacts!$H$2:$H$'+limit+',"<"&TODAY(),Contacts!$H$2:$H$'+limit+',">0")');
  s.getRange('E18').setFormula('=COUNTIFS(Activities!$G$2:$G$'+limit+',"<"&TODAY(),Activities!$G$2:$G$'+limit+',">0",Activities!$H$2:$H$'+limit+',"Open")');
  s.getRange('E19').setFormula('=COUNTIFS(Contacts!$E$2:$E$'+limit+',"Client")');
  s.getRange('A20:B20').setValues([['Website form status','Enquiries']]);
  ['in_progress','abandoned','completed','booking_pending','legacy_submitted'].forEach(function(status,i){var r=i+21;s.getRange(r,1).setValue(status);s.getRange(r,2).setFormula('=COUNTIFS(Enquiries!$F$2:$F$'+limit+',A'+r+')');});
  s.getRange('A28').setValue('Update Deals to move the pipeline. Use Contacts > Lifecycle to manage clients.');
  s.getRange('A29').setValue('Sales stages are manual. Website form statuses update automatically.');
  s.getRange('A3:G29').setFontFamily('Arial').setFontSize(10).setVerticalAlignment('middle');s.setColumnWidth(1,220);s.setColumnWidth(2,330);s.setColumnWidth(3,32);s.setColumnWidth(4,250);s.setColumnWidths(5,3,130);
  ['A7:B7','D7:G7','D15:E15','A20:B20'].forEach(function(range){s.getRange(range).setFontWeight('bold').setBackground('#f1f3f4');});
  s.getRange('B3').setWrap(true);s.setRowHeight(3,34);s.getRange('B4').setNumberFormat('dd mmm yyyy, h:mm AM/PM');s.setHiddenGridlines(true);
}

function sheetsApi_(book,requests) {
  var r=UrlFetchApp.fetch('https://sheets.googleapis.com/v4/spreadsheets/'+book.getId()+':batchUpdate',{method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},payload:JSON.stringify({requests:requests}),muteHttpExceptions:true});
  if(r.getResponseCode()!==200)throw new Error('Sheet table configuration failed ('+r.getResponseCode()+').');
  return JSON.parse(r.getContentText());
}

function installTables_(book) {
  var options={Contacts:{4:['Lead','Prospect','Client','Past client']},Deals:{2:CRM.stages,4:CRM.currencies,10:['Low','Normal','High']},Activities:{3:['Call','Email','Meeting','Task','Note'],7:['Open','Done','Cancelled']},Enquiries:{}};
  var requests=Object.keys(CRM.headers).map(function(name){var sheet=book.getSheetByName(name);return {addTable:{table:{name:'Yara'+name,range:{sheetId:sheet.getSheetId(),startRowIndex:0,endRowIndex:Math.max(2,sheet.getLastRow()),startColumnIndex:0,endColumnIndex:CRM.headers[name].length},columnProperties:CRM.headers[name].map(function(header,i){var property={columnIndex:i,columnName:header};if(options[name][i]){property.columnType='DROPDOWN';property.dataValidationRule={condition:{type:'ONE_OF_LIST',values:options[name][i].map(function(v){return {userEnteredValue:v};})}};}return property;})}}};});
  var result=sheetsApi_(book,requests), map={};
  result.replies.forEach(function(reply){if(reply.addTable){var table=reply.addTable.table;map[table.name]={id:table.tableId,sheetId:table.range.sheetId};}});
  PropertiesService.getScriptProperties().setProperty('CRM_TABLES',JSON.stringify(map));
}

function extendTables_(book) {
  var tables=JSON.parse(PropertiesService.getScriptProperties().getProperty('CRM_TABLES') || '{}');
  var requests=Object.keys(tables).map(function(name){var sheetName=name.replace(/^Yara/,''),s=book.getSheetByName(sheetName),t=tables[name];return {updateTable:{table:{tableId:t.id,range:{sheetId:t.sheetId,startRowIndex:0,endRowIndex:Math.max(2,s.getLastRow()),startColumnIndex:0,endColumnIndex:CRM.headers[sheetName].length}},fields:'range'}};});
  if(requests.length)sheetsApi_(book,requests);
}

function inspectCRM() {
  assertOwner_();var p=PropertiesService.getScriptProperties(),book=SpreadsheetApp.openById(p.getProperty('CRM_SHEET_ID'));
  console.log(JSON.stringify({url:book.getUrl(),owner:Session.getEffectiveUser().getEmail(),sheets:book.getSheets().map(function(s){return {name:s.getName(),rows:s.getLastRow()};}),pipeline:book.getSheetByName('Pipeline').getRange('A3:G25').getDisplayValues(),triggers:ScriptApp.getProjectTriggers().map(function(t){return t.getHandlerFunction();})}));
}
