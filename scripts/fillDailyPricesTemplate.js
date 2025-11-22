// Fill daily-prices-template-2.xlsx with data from the CSV in manual_upload/daily_prices.
// Uses the existing "xlsx" dependency.

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const projectRoot = __dirname ? path.join(__dirname, '..') : process.cwd();
const csvPath = path.join(projectRoot, 'manual_upload', 'daily_prices', 'daily-prices-template copy.csv');
const xlsxPath = path.join(projectRoot, 'daily-prices-template-2.xlsx');

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  const lines = raw.split(/\r?\n/);
  if (lines.length <= 1) {
    throw new Error('CSV appears to have no data rows');
  }
  const header = lines[0].split(';').map((v) => v.trim());
  const rows = lines.slice(1).map((line) =>
    line
      .split(';')
      .map((v) => v.trim())
  );
  return { header, rows };
}

function fillTemplate() {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found at ${csvPath}`);
  }
  if (!fs.existsSync(xlsxPath)) {
    throw new Error(`Template XLSX not found at ${xlsxPath}`);
  }

  const { header, rows } = readCsv(csvPath);

  // Build a new worksheet: header + all data rows.
  const data = [header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Load existing workbook and replace the first sheet with our data.
  const wb = XLSX.readFile(xlsxPath);
  const firstSheetName = wb.SheetNames[0];
  wb.Sheets[firstSheetName] = ws;

  XLSX.writeFile(wb, xlsxPath);

  console.log(
    `Filled ${xlsxPath} with ${rows.length} daily price rows (columns: ${header.join(
      ', '
    )})`
  );
}

try {
  fillTemplate();
} catch (err) {
  console.error('Error filling template:', err.message || err);
  process.exit(1);
}

