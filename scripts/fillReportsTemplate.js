// Fill commodity-reports-template.xlsx with a few mock reports
// so the admin Excel upload can be tested locally.

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const projectRoot = __dirname ? path.join(__dirname, '..') : process.cwd();
const templatePath = path.join(projectRoot, 'commodity-reports-template.xlsx');

function ensureFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template XLSX not found at ${filePath}`);
  }
}

function fillReportsTemplate() {
  ensureFileExists(templatePath);

  const workbook = XLSX.readFile(templatePath);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Read existing data as array of arrays
  const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  if (sheetData.length === 0) {
    throw new Error('Template appears to be empty – expected header row.');
  }

  const header = sheetData[0];

  // Helper to build row by header index so it matches the template
  const makeRow = (valuesByLabel) =>
    header.map((label) => {
      const key = String(label || '').trim();
      return valuesByLabel[key] ?? '';
    });

  const mockRows = [
    makeRow({
      'Title': 'Wheat Futures Rise on EU Weather Concerns',
      'Summary': 'European wheat futures climbed as dry weather raises yield risks across key EU origins.',
      'Body':
        'European wheat futures posted moderate gains today as fresh weather models confirmed a drier‑than‑normal outlook in France and Germany.\n\n' +
        'Export demand from North Africa remains active, with Algeria and Egypt continuing to tender for nearby positions. Basis levels at Port Constanța are steady to slightly firmer for high‑protein milling wheat.',
      'Date (ISO)': new Date().toISOString(),
      'Tags (comma-separated)': 'WHEAT, EU, Weather',
      'Slug': 'wheat-futures-rise-eu-weather-test',
      'Is Recommended': 'true',
    }),
    makeRow({
      'Title': 'Constanța Corn Exports Accelerate on Competitive FOB',
      'Summary': 'Romanian corn remains highly competitive on FOB Constanța basis versus Black Sea peers.',
      'Body':
        'Corn export flows through Port Constanța accelerated this week as buyers in the Mediterranean locked in coverage ahead of winter.\n\n' +
        'Freight has softened 3–4 USD/mt on select routes, helping nearby Romanian corn undercut Ukrainian and Russian offers.',
      'Date (ISO)': new Date().toISOString(),
      'Tags (comma-separated)': 'CORN, Constanta, Export',
      'Slug': 'constanta-corn-exports-accelerate-test',
      'Is Recommended': 'false',
    }),
    makeRow({
      'Title': 'Sunflower Seeds: Black Sea Premium Narrows',
      'Summary': 'Black Sea sunflower seed premiums eased as crushers reassessed nearby coverage.',
      'Body':
        'Sunflower seed premiums in the Black Sea narrowed this week as crushers scaled back nearby buying, focusing instead on meal and oil spreads.\n\n' +
        'Ukrainian FOB offers remain well‑bid from EU destinations, but nearby Russian volumes are more limited on logistics constraints.',
      'Date (ISO)': new Date().toISOString(),
      'Tags (comma-separated)': 'SUNFLOWER SEEDS, Black Sea, Premium',
      'Slug': 'sunflower-seeds-black-sea-premium-narrows-test',
      'Is Recommended': 'false',
    }),
  ];

  const newData = [header, ...sheetData.slice(1), ...mockRows];
  const newSheet = XLSX.utils.aoa_to_sheet(newData);

  workbook.Sheets[firstSheetName] = newSheet;
  XLSX.writeFile(workbook, templatePath);

  console.log(
    `Filled ${templatePath} with ${mockRows.length} mock reports (total rows now: ${newData.length - 1})`,
  );
}

try {
  fillReportsTemplate();
} catch (err) {
  console.error('Error filling reports template:', err.message || err);
  process.exit(1);
}

