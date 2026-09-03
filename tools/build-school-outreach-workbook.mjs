import fs from 'node:fs/promises';
import path from 'node:path';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const [inputPath, outputPath, previewDir] = process.argv.slice(2);
if (!inputPath || !outputPath || !previewDir) {
  throw new Error('Usage: node tools/build-school-outreach-workbook.mjs <uk-json> <output.xlsx> <preview-dir>');
}

const input = JSON.parse(await fs.readFile(inputPath, 'utf8'));
const workbook = Workbook.create();
const dashboard = workbook.worksheets.add('Launch Dashboard');
const gates = workbook.worksheets.add('Launch Gates');
const copy = workbook.worksheets.add('Campaign Copy');
const uk = workbook.worksheets.add('UK Schools');
const europe = workbook.worksheets.add('European Schools');
const sendLog = workbook.worksheets.add('Send Log');
const suppression = workbook.worksheets.add('Suppression');

const green = '#234A35';
const paleGreen = '#E8F1E9';
const yellow = '#F4D64A';
const paleYellow = '#FFF7D3';
const red = '#B7463D';
const paleRed = '#FBE8E5';
const ink = '#243129';
const grey = '#66736A';
const line = '#D7DED8';

function titleBand(sheet, range, title, subtitle) {
  const [top] = range.split(':');
  sheet.getRange(range).merge();
  sheet.getRange(top).values = [[title]];
  sheet.getRange(range).format = {
    fill: green,
    font: { bold: true, color: '#FFFFFF', size: 20 },
    verticalAlignment: 'center',
  };
  sheet.getRange(range).format.rowHeight = 36;
  const subtitleCell = `${top[0]}2`;
  sheet.getRange(`${subtitleCell}:${range.split(':')[1][0]}2`).merge();
  sheet.getRange(subtitleCell).values = [[subtitle]];
  sheet.getRange(`${subtitleCell}:${range.split(':')[1][0]}2`).format = {
    fill: paleGreen,
    font: { color: grey, italic: true },
    wrapText: true,
  };
  sheet.getRange(`${subtitleCell}:${range.split(':')[1][0]}2`).format.rowHeight = 32;
}

function styleHeader(range) {
  range.format = {
    fill: green,
    font: { bold: true, color: '#FFFFFF' },
    wrapText: true,
    verticalAlignment: 'center',
    borders: { preset: 'inside', style: 'thin', color: '#55715F' },
  };
  range.format.rowHeight = 34;
}

for (const sheet of [dashboard, gates, copy, uk, europe, sendLog, suppression]) {
  sheet.showGridLines = false;
}

// Dashboard
titleBand(dashboard, 'A1:F1', 'EcoWise Italy school outreach launch', 'Prepared 3 September 2026 • transparent market universe, approval gates and send audit');
dashboard.getRange('A4:B10').values = [
  ['Measure', 'Current'],
  ['UK independent schools in universe', null],
  ['UK records with public role inbox', null],
  ['UK records awaiting human verification', null],
  ['European schools in research register', null],
  ['Recipients approved to send', null],
  ['Launch gates complete', null],
];
dashboard.getRange('B5').formulas = [[`=ROWS('UK Schools'!$E$4:$E$${input.schools.length + 3})`]];
dashboard.getRange('B6').formulas = [[`=COUNTIF('UK Schools'!$R$4:$R$${input.schools.length + 3},"Generic public inbox found")`]];
dashboard.getRange('B7').formulas = [[`=COUNTIF('UK Schools'!$S$4:$S$${input.schools.length + 3},"Needs human verification")`]];
dashboard.getRange('B8').formulas = [[`=ROWS('European Schools'!$D$4:$D$42)`]];
dashboard.getRange('B9').formulas = [[`=COUNTIF('UK Schools'!$T$4:$T$${input.schools.length + 3},"Send")+COUNTIF('European Schools'!$N$4:$N$42,"Send")`]];
dashboard.getRange('B10').formulas = [[`=COUNTIF('Launch Gates'!$C$4:$C$11,"Complete")&" / "&COUNTA('Launch Gates'!$A$4:$A$11)`]];
styleHeader(dashboard.getRange('A4:B4'));
dashboard.getRange('A5:A10').format.font = { bold: true, color: ink };
dashboard.getRange('B5:B10').format = { fill: paleYellow, font: { bold: true, color: ink, size: 14 }, horizontalAlignment: 'center' };
dashboard.getRange('D4:F9').values = [
  ['Launch step', 'Timing', 'Rule'],
  ['Confirm mailbox and inbox placement', '3–7 Sep', 'DNS authentication is verified; test the chosen sender'],
  ['Approve first recipient pilot', 'By 7 Sep', '15–20 UK + up to 5 European role inboxes'],
  ['Pilot send', '8 Sep, 09:30 UK', 'One-to-one style; no tracking pixel'],
  ['48-hour review', '10 Sep', 'Stop on poor targeting, bounces or complaints'],
  ['Second reviewed wave', 'After review', 'Only verified role/general inboxes'],
];
styleHeader(dashboard.getRange('D4:F4'));
dashboard.getRange('D5:F9').format = { wrapText: true, borders: { insideHorizontal: { style: 'thin', color: line } } };
dashboard.getRange('A12:F16').merge();
dashboard.getRange('A12').values = [[
  'Important: this workbook is a research and approval register, not permission to blast every address. “Send” must be chosen by a human after checking the school, inbox, suppression status and launch gates. Every actual message must be copied into Send Log.'
]];
dashboard.getRange('A12:F16').format = { fill: paleRed, font: { color: '#6D2823', bold: true }, wrapText: true, verticalAlignment: 'center' };
dashboard.getRange('A:A').format.columnWidth = 35;
dashboard.getRange('B:B').format.columnWidth = 18;
dashboard.getRange('C:C').format.columnWidth = 4;
dashboard.getRange('D:D').format.columnWidth = 29;
dashboard.getRange('E:E').format.columnWidth = 20;
dashboard.getRange('F:F').format.columnWidth = 43;
dashboard.freezePanes.freezeRows(2);

// Gates
titleBand(gates, 'A1:E1', 'Launch gates', 'Yellow cells are owner inputs; no external message should leave until every required gate is complete.');
const gateRows = [
  ['Final copy approved by Adam', 'Adam', 'Complete', '2026-09-03', 'Voice-note corrections incorporated'],
  ['Year-round delivery wording approved', 'Adam', 'Complete', '2026-09-03', 'Includes spring/summer and multi-week programmes'],
  ['Sending mailbox confirmed', 'Zac / Adam', 'Blocked', '', 'Prefer authenticated @ecowiseitaly.com mailbox; then test Gmail and Microsoft 365 delivery'],
  ['SPF, DKIM and DMARC verified', 'Zac', 'Complete', '2026-09-03', 'Live DNS: SiteGround SPF present; default DKIM resolves; DMARC present at p=none'],
  ['Privacy notice and LIA approved', 'Zac / Adam', 'Blocked', '', 'Drafts prepared; confirm controller/providers/retention, sign the LIA and publish the notice'],
  ['Suppression register reviewed', 'Zac / Adam', 'Ready', '', 'Empty initial register; add every objection immediately'],
  ['First pilot recipient rows approved', 'Adam', 'Blocked', '', 'Set Send Decision to Send only after inbox verification'],
  ['Explicit send authorisation recorded', 'Adam / Yenka', 'Blocked', '', 'Approval must name batch and copy version'],
];
gates.getRange('A3:E3').values = [['Gate', 'Owner', 'Status', 'Completed', 'Evidence / next action']];
gates.getRange('A4:E11').values = gateRows;
styleHeader(gates.getRange('A3:E3'));
gates.getRange('C4:C11').dataValidation = { rule: { type: 'list', values: ['Blocked', 'Ready', 'Complete'] } };
gates.getRange('C4:C11').conditionalFormats.add('containsText', { text: 'Complete', format: { fill: paleGreen, font: { color: green, bold: true } } });
gates.getRange('C4:C11').conditionalFormats.add('containsText', { text: 'Blocked', format: { fill: paleRed, font: { color: red, bold: true } } });
gates.getRange('A4:E11').format.wrapText = true;
gates.getRange('A:A').format.columnWidth = 38;
gates.getRange('B:B').format.columnWidth = 18;
gates.getRange('C:C').format.columnWidth = 15;
gates.getRange('D:D').format.columnWidth = 16;
gates.getRange('E:E').format.columnWidth = 55;
gates.freezePanes.freezeRows(3);

// Campaign copy
titleBand(copy, 'A1:H1', 'Campaign copy — Adam-approved revision', 'Copy version: EWI-SCHOOLS-2026-09-03-A • actual sends must be recorded in Send Log');
copy.getRange('A4:A7').merge();
copy.getRange('A4').values = [['Subject options']];
copy.getRange('A4:A7').format = { fill: paleYellow, font: { bold: true, color: ink }, verticalAlignment: 'center' };
const subjects = [
  'A five-day outdoor learning journey in Piemonte',
  'School ecology, storytelling and adventure in Italy',
  'A tailored Italy residential for your pupils',
  'Nature awareness and forest schooling in Piemonte',
];
for (let index = 0; index < subjects.length; index += 1) {
  const row = 4 + index;
  copy.getRange(`B${row}:H${row}`).merge();
  copy.getRange(`B${row}`).values = [[subjects[index]]];
  copy.getRange(`B${row}:H${row}`).format = { wrapText: true, verticalAlignment: 'center' };
  copy.getRange(`B${row}:H${row}`).format.rowHeight = 28;
}
copy.getRange('A9:H9').merge();
copy.getRange('A9').values = [['INITIAL EMAIL']];
copy.getRange('A9:H9').format = { fill: yellow, font: { bold: true, color: ink } };
const initialBlocks = [
  ['A10:H10', 'Hello,', 24],
  ['A11:H12', 'I’m Adam Rose from EcoWise Italy. For more than 20 years we have designed and tailored outdoor education in Piemonte, combining environmental science and ecology with storytelling, environmental art, teamwork, nature awareness and forest schooling away from screens.', 62],
  ['A13:H14', 'For schools travelling internationally, we recommend five days and four nights: enough time for pupils to settle into the landscape, investigate habitats, solve practical challenges, create stories and develop as a group. Programmes can also be shorter or extend to a multi-week immersion.', 62],
  ['A15:H16', 'We work throughout the year, including spring and summer. November to March often offers greater flexibility, subject to me confirming the live calendar.', 48],
  ['A17:H19', 'EcoWise Italy designs and delivers the programme, selects the location, and books suitable accommodation and food on the school’s behalf. Your school arranges its main travel and pays the programme, accommodation/food and travel providers separately. We hold public liability insurance and can provide evidence privately during planning.', 72],
  ['A20:H21', 'Could you point me to the person responsible for overseas residentials, outdoor education or co-curricular trips? The planning page is here:', 48],
  ['A22:H22', 'https://ecowiseitaly.com/school-trips-italy/', 24],
  ['A23:H24', 'I reply personally within 24 hours and would be happy to explore whether the programme fits your pupils, dates and aims.', 48],
  ['A25:H27', 'Best wishes,\nAdam Rose\nEcoWise Italy\nadamecorose@gmail.com\n+39 342 136 3274', 90],
  ['A28:H29', 'If school-trip information is not relevant, reply “no thanks” and we will not contact this address again.', 42],
];
for (const [range, value, height] of initialBlocks) {
  copy.getRange(range).merge();
  copy.getRange(range.split(':')[0]).values = [[value]];
  copy.getRange(range).format = { wrapText: true, verticalAlignment: 'center', borders: { bottom: { style: 'thin', color: line } } };
  copy.getRange(range).format.rowHeight = height / (Number(range.split(':')[1].match(/\d+/)[0]) - Number(range.split(':')[0].match(/\d+/)[0]) + 1);
}
copy.getRange('A31:H31').merge();
copy.getRange('A31').values = [['FIRST FOLLOW-UP — send once after seven working days only']];
copy.getRange('A31:H31').format = { fill: yellow, font: { bold: true, color: ink } };
copy.getRange('A32:H38').merge();
copy.getRange('A32').values = [[
  'Hello,\n\nI’m following up in case EcoWise Italy’s tailored residential learning in Piemonte could fit a future overseas trip. A typical class is 20–30 pupils, programmes are quoted per person, and five days/four nights is our recommended international format. We work year-round, with historically quieter capacity from November to March, subject to me checking the calendar.\n\nIs there a colleague who leads educational visits, outdoor learning or co-curricular programmes?\n\nPlanning overview: https://ecowiseitaly.com/school-trips-italy/\n\nBest wishes,\nAdam'
]];
copy.getRange('A32:H38').format = { wrapText: true, verticalAlignment: 'top' };
copy.getRange('A32:H38').format.rowHeight = 34;
copy.getRange('A:A').format.columnWidth = 18;
copy.getRange('B:H').format.columnWidth = 14;
copy.freezePanes.freezeRows(2);

// UK market universe
titleBand(uk, 'A1:Z1', 'UK independent-school market universe', `${input.schools.length.toLocaleString()} open England independent schools serving pupils aged 11+ • GIAS public download ${input.source_date}`);
const ukHeaders = ['Market', 'URN', 'Priority score', 'Tier', 'School', 'Town', 'County', 'Postcode', 'Low age', 'High age', 'Boarding', 'Sixth form', 'Pupils', 'Website', 'Telephone', 'Public role email', 'Email source', 'Research status', 'Human review', 'Send decision', 'Suppressed', 'Sent date', 'Response', 'Next action', 'Notes', 'Source URL'];
uk.getRange('A3:Z3').values = [ukHeaders];
styleHeader(uk.getRange('A3:Z3'));
const ukValues = input.schools.map((row) => [
  'UK independent', row.urn, null, null, row.school, row.town, row.county, row.postcode,
  row.low_age, row.high_age, row.boarders, row.sixth_form, row.pupils, row.website, row.telephone,
  row.public_email, row.email_source, row.research_status,
  row.public_email ? 'Needs human verification' : 'Not reviewed', 'Hold', 'No', null, '', '', '', row.source_url,
]);
uk.getRange(`A4:Z${ukValues.length + 3}`).values = ukValues;
uk.getRange('C4').formulas = [['=IF(K4="Boarding school",30,0)+IF(J4>=18,20,0)+IF(I4<=11,10,0)+IF(L4="Has a sixth form",15,0)+IF(M4>=200,10,0)+IF(N4<>"",10,0)']];
uk.getRange(`C4:C${ukValues.length + 3}`).fillDown();
uk.getRange('D4').formulas = [['=IF(C4>=85,"A",IF(C4>=65,"B","C"))']];
uk.getRange(`D4:D${ukValues.length + 3}`).fillDown();
uk.getRange(`S4:S${ukValues.length + 3}`).dataValidation = { rule: { type: 'list', values: ['Not reviewed', 'Needs human verification', 'Verified'] } };
uk.getRange(`T4:T${ukValues.length + 3}`).dataValidation = { rule: { type: 'list', values: ['Hold', 'Send', 'Do not contact'] } };
uk.getRange(`U4:U${ukValues.length + 3}`).dataValidation = { rule: { type: 'list', values: ['No', 'Yes'] } };
uk.getRange(`T4:T${ukValues.length + 3}`).conditionalFormats.add('containsText', { text: 'Send', format: { fill: paleGreen, font: { color: green, bold: true } } });
uk.getRange(`U4:U${ukValues.length + 3}`).conditionalFormats.add('containsText', { text: 'Yes', format: { fill: paleRed, font: { color: red, bold: true } } });
uk.getRange(`A3:Z${ukValues.length + 3}`).format.wrapText = false;
uk.getRange(`V4:V${ukValues.length + 3}`).format.numberFormat = 'yyyy-mm-dd';
const ukTable = uk.tables.add(`A3:Z${ukValues.length + 3}`, true, 'UKSchoolUniverse');
ukTable.style = 'TableStyleMedium4';
uk.freezePanes.freezeRows(3);
uk.freezePanes.freezeColumns(5);
const ukWidths = [17, 11, 13, 8, 34, 18, 18, 12, 9, 9, 16, 18, 10, 34, 17, 35, 42, 30, 24, 15, 12, 14, 18, 24, 28, 43];
ukWidths.forEach((width, index) => { uk.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });

// European research register. Contacts shown here are role/general addresses from cited public pages.
const europeanRows = [
  ['Switzerland', 'Chesières', 'Aiglon College', 'Boarding, ages 6–18, strong expedition fit', 'https://www.aiglon.ch/', 'info@aiglon.ch', 'https://www.aiglon.ch/admissions/begin-the-journey', 'Official school page', 'Needs human verification'],
  ['Netherlands', 'Amsterdam', 'The British School of Amsterdam', 'Senior school ages 11–18', 'https://www.britams.nl/', 'info@britams.nl', 'https://www.britams.nl/', 'Official school page', 'Needs human verification'],
  ['Netherlands', 'The Hague / Voorschoten', 'The British School in the Netherlands', 'Four campuses; senior provision', 'https://www.britishschool.nl/', 'admissions@britishschool.nl', 'https://www.britishschool.nl/enquiry-form', 'Official school page', 'Needs human verification'],
  ['Belgium', 'Tervuren', 'The British School of Brussels', 'International secondary and IB provision', 'https://www.britishschool.be/', '', 'https://www.britishschool.be/contact/', 'Official contact form; manual routing needed', 'Not reviewed'],
  ['Belgium', 'Brussels', 'British International School of Brussels', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Belgium', 'Brussels', 'International School of Flanders', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Belgium', 'Antwerp', 'International School of Belgium', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Poland', 'Krakow', 'British International School of Krakow', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Poland', 'Warsaw', 'The British School, Warsaw', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Poland', 'Warsaw', 'Polish British Academy', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Poland', 'Łódź', 'British International School of the University of Łódź', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Slovenia', 'Ljubljana', 'British International School of Ljubljana', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Romania', 'Bucharest', 'Cambridge School of Bucharest', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Romania', 'Bucharest', 'International School of Bucharest', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Romania', 'Bucharest', 'King’s Oak British International School', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Romania', 'Bucharest', 'Acorns Nursery', 'Early years; low immediate fit', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Romania', 'Timișoara', 'British International School of Timișoara', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Romania', 'Cluj-Napoca', 'Researchers Schoolhouse', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Greece', 'Athens', 'Byron College', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Greece', 'Pallini', 'Campion School', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Greece', 'Athens', 'Verita International School', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Greece', 'Varkiza', 'St Lawrence College', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Serbia', 'Belgrade', 'Chartwell International School', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Serbia', 'Belgrade', 'PRIMA International School', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Hungary', 'Budapest', 'Budapest British International Academy', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Hungary', 'Budapest', 'Budapest British International School', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Czech Republic', 'Prague', 'Park Lane International School', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Czech Republic', 'Prague', 'Prague British International School', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Czech Republic', 'Prague', 'The English College in Prague', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Czech Republic', 'Olomouc', 'International School Olomouc', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Czech Republic', 'Ostrava', 'PORG International School', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Portugal', 'Porto', 'Oporto British School', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Portugal', 'Lisbon', 'St Julian’s School', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Portugal', 'Lisbon', 'British School of Lisbon', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Portugal', 'Cascais', 'IPS Cascais', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Italy', 'Rome', 'St George’s British International School', 'COBIS member; close-to-market prospect', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Italy', 'Milan', 'The British School of Milan', 'COBIS member; domestic international prospect', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Germany', 'Munich', 'St George’s British International School Munich', 'COBIS member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
  ['Luxembourg', 'Luxembourg', 'St George’s International School', 'COBIS accredited member', '', '', 'https://www.cobis.org.uk/our-network/search-for-cobis-members/cobis-school-search/', 'COBIS directory', 'Not reviewed'],
];
titleBand(europe, 'A1:Q1', 'European international-school research register', 'Initial continental-Europe COBIS-derived universe; official contact details must be verified before Send is selected.');
const euHeaders = ['Market', 'Country', 'City', 'School', 'Fit note', 'Website', 'Public role email', 'Contact/source URL', 'Source status', 'Research status', 'Human review', 'Suppressed', 'Copy version', 'Send decision', 'Sent date', 'Response', 'Next action'];
europe.getRange('A3:Q3').values = [euHeaders];
styleHeader(europe.getRange('A3:Q3'));
const euValues = europeanRows.map((row) => ['European international', ...row, row[5] ? 'Needs human verification' : 'Not reviewed', 'No', 'EWI-SCHOOLS-2026-09-03-A', 'Hold', null, '', '']);
europe.getRange(`A4:Q${euValues.length + 3}`).values = euValues;
europe.getRange(`K4:K${euValues.length + 3}`).dataValidation = { rule: { type: 'list', values: ['Not reviewed', 'Needs human verification', 'Verified'] } };
europe.getRange(`L4:L${euValues.length + 3}`).dataValidation = { rule: { type: 'list', values: ['No', 'Yes'] } };
europe.getRange(`N4:N${euValues.length + 3}`).dataValidation = { rule: { type: 'list', values: ['Hold', 'Send', 'Do not contact'] } };
const euTable = europe.tables.add(`A3:Q${euValues.length + 3}`, true, 'EuropeanSchoolResearch');
euTable.style = 'TableStyleMedium4';
europe.freezePanes.freezeRows(3);
europe.freezePanes.freezeColumns(4);
const euWidths = [22, 17, 20, 38, 36, 34, 34, 44, 30, 24, 24, 12, 28, 15, 14, 18, 24];
euWidths.forEach((width, index) => { europe.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });

// Send log and suppression registers
titleBand(sendLog, 'A1:N1', 'Send log', 'One row per actual message. Nothing is considered sent unless it appears here.');
sendLog.getRange('A3:N3').values = [['Send ID', 'Date/time', 'Market', 'School', 'Recipient email', 'Recipient role', 'Copy version', 'Subject', 'Sender mailbox', 'Delivery', 'Reply status', 'Owner', 'Next action', 'Notes']];
styleHeader(sendLog.getRange('A3:N3'));
sendLog.getRange('A4:N203').values = Array.from({ length: 200 }, () => Array(14).fill(null));
sendLog.getRange('J4:J203').dataValidation = { rule: { type: 'list', values: ['Pending', 'Delivered', 'Bounced', 'Blocked', 'Complaint'] } };
sendLog.getRange('K4:K203').dataValidation = { rule: { type: 'list', values: ['No reply', 'Referred', 'Interested', 'Not now', 'Opted out'] } };
sendLog.getRange('B4:B203').format.numberFormat = 'yyyy-mm-dd hh:mm';
const sendTable = sendLog.tables.add('A3:N203', true, 'OutreachSendLog');
sendTable.style = 'TableStyleMedium4';
sendLog.freezePanes.freezeRows(3);
const sendWidths = [13, 19, 20, 34, 34, 24, 28, 40, 30, 15, 16, 15, 28, 34];
sendWidths.forEach((width, index) => { sendLog.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });

titleBand(suppression, 'A1:H1', 'Suppression register', 'Check before every send. Add opt-outs, complaints, invalid addresses and do-not-contact decisions immediately.');
suppression.getRange('A3:H3').values = [['Email/domain', 'School/organisation', 'Reason', 'Source', 'Date added', 'Added by', 'Permanent', 'Notes']];
styleHeader(suppression.getRange('A3:H3'));
suppression.getRange('A4:H103').values = Array.from({ length: 100 }, () => Array(8).fill(null));
suppression.getRange('G4:G103').dataValidation = { rule: { type: 'list', values: ['Yes', 'No'] } };
suppression.getRange('E4:E103').format.numberFormat = 'yyyy-mm-dd';
const suppressionTable = suppression.tables.add('A3:H103', true, 'SuppressionRegister');
suppressionTable.style = 'TableStyleMedium4';
suppression.freezePanes.freezeRows(3);
[34, 34, 24, 24, 15, 18, 12, 40].forEach((width, index) => { suppression.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const previews = [
  ['Launch Dashboard', 'A1:F16', 'dashboard.png'],
  ['Launch Gates', 'A1:E11', 'gates.png'],
  ['Campaign Copy', 'A1:H38', 'copy.png'],
  ['UK Schools', 'A1:Z18', 'uk-schools.png'],
  ['European Schools', 'A1:Q18', 'europe-schools.png'],
  ['Send Log', 'A1:N12', 'send-log.png'],
  ['Suppression', 'A1:H12', 'suppression.png'],
];
for (const [sheetName, range, filename] of previews) {
  const image = await workbook.render({ sheetName, range, scale: 1, format: 'png' });
  await fs.writeFile(path.join(previewDir, filename), new Uint8Array(await image.arrayBuffer()));
}

const dashboardCheck = await workbook.inspect({
  kind: 'table',
  range: 'Launch Dashboard!A1:F16',
  include: 'values,formulas',
  tableMaxRows: 20,
  tableMaxCols: 8,
});
const errorCheck = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',
  options: { useRegex: true, maxResults: 300 },
  summary: 'final formula error scan',
});
console.log(dashboardCheck.ndjson);
console.log(errorCheck.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, previewDir, ukRows: input.schools.length, europeanRows: europeanRows.length }));
