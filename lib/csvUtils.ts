/**
 * CSV/Excel utilities for data import/export in admin panel
 */

export interface CSVColumn {
  key: string;
  label: string;
  example?: string;
  required?: boolean;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], columns: CSVColumn[]): string {
  // Create header row
  const headers = columns.map(col => col.label).join(',');

  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      // Handle values with commas, quotes, or newlines
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  }).join('\n');

  return `${headers}\n${rows}`;
}

/**
 * Generate template CSV with example data
 */
export function generateTemplate(columns: CSVColumn[]): string {
  const headers = columns.map(col => col.label).join(',');
  const exampleRow = columns.map(col => col.example || '').join(',');
  return `${headers}\n${exampleRow}`;
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV(csvText: string, columns: CSVColumn[]): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: any = {};

    columns.forEach((col, index) => {
      const headerIndex = headers.findIndex(h =>
        h.toLowerCase() === col.label.toLowerCase()
      );

      if (headerIndex !== -1 && headerIndex < values.length) {
        row[col.key] = values[headerIndex];
      }
    });

    data.push(row);
  }

  return data;
}

/**
 * Parse a single CSV line (handles quoted values)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Validate CSV data against column definitions
 */
export function validateCSVData(data: any[], columns: CSVColumn[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  data.forEach((row, index) => {
    columns.forEach(col => {
      if (col.required && !row[col.key]) {
        errors.push(`Row ${index + 1}: Missing required field "${col.label}"`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
