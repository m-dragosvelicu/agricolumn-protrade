/**
 * Excel utilities for data import/export in admin panel
 */

import * as XLSX from 'xlsx';

export interface ExcelColumn {
  key: string;
  label: string;
  example?: string;
  required?: boolean;
}

/**
 * Convert array of objects to Excel workbook
 */
export function arrayToExcel(data: any[], columns: ExcelColumn[], sheetName: string = 'Sheet1'): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  
  // Create header row
  const headers = columns.map(col => col.label);
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      return value === null || value === undefined ? '' : String(value);
    });
  });
  
  // Combine headers and rows
  const worksheetData = [headers, ...rows];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  return workbook;
}

/**
 * Generate template Excel file with example data
 */
export function generateTemplate(columns: ExcelColumn[], sheetName: string = 'Sheet1'): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  
  // Create header row
  const headers = columns.map(col => col.label);
  
  // Create example row
  const exampleRow = columns.map(col => col.example || '');
  
  // Combine headers and example row
  const worksheetData = [headers, exampleRow];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  return workbook;
}


/**
 * Download Excel file
 */
export function downloadExcel(workbook: XLSX.WorkBook, filename: string): void {
  // Write workbook to binary string
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create blob
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Get detected headers from Excel file (for debugging)
 */
export function getExcelHeaders(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const fileBuffer = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(fileBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          resolve([]);
          return;
        }
        
        const headers = jsonData[0].map((h: any) => String(h || '').trim());
        resolve(headers);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read Excel file.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse Excel file to array of objects
 */
export function parseExcel(file: File, columns: ExcelColumn[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const fileBuffer = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(fileBuffer, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length < 2) {
          resolve([]);
          return;
        }
        
        // Detect if first row contains group headers (like "VESSEL DETAILS", "VESSEL DEPARTURE PLACE")
        // Group headers are typically all caps or contain words like "DETAILS", "PLACE", "DESTINATION"
        const firstRow = jsonData[0].map((h: any) => String(h || '').trim());
        const secondRow = jsonData.length > 1 ? jsonData[1].map((h: any) => String(h || '').trim()) : [];
        
        const isGroupHeaderRow = firstRow.some(h => 
          h && (
            h.toUpperCase() === h && h.length > 3 && /[A-Z]/.test(h) || // All caps
            /DETAILS|PLACE|DESTINATION|DEPARTURE|VESSEL|OPERATION/i.test(h) // Contains group keywords
          )
        );
        
        // Check if second row is also part of group headers (merged cells)
        const isSecondRowGroupHeader = secondRow.some(h => 
          h && (
            h.toUpperCase() === h && h.length > 3 && /[A-Z]/.test(h) ||
            /DETAILS|PLACE|DESTINATION|DEPARTURE|VESSEL|OPERATION/i.test(h)
          )
        ) || (isGroupHeaderRow && secondRow.filter(h => h).length === 0); // Empty or sparse row after group header
        
        // Determine header row index:
        // - If row 1 is group header and row 2 is also group header (merged), use row 3 (index 2)
        // - If row 1 is group header but row 2 has actual headers, use row 2 (index 1)
        // - Otherwise use row 1 (index 0)
        let headerRowIndex = 0;
        if (isGroupHeaderRow && isSecondRowGroupHeader) {
          headerRowIndex = 2; // Skip rows 1-2 (merged group headers), use row 3
        } else if (isGroupHeaderRow) {
          headerRowIndex = 1; // Skip row 1 (group header), use row 2
        } else {
          headerRowIndex = 0; // Use row 1 as headers
        }
        
        // Data starts after header row
        // But we need to skip any metadata rows (like row with just "1209")
        let dataStartIndex = headerRowIndex + 1;
        
        // Skip rows that look like metadata (single number, mostly empty, etc.)
        while (dataStartIndex < jsonData.length) {
          const row = jsonData[dataStartIndex];
          const nonEmptyCells = row.filter((cell: any) => cell !== null && cell !== undefined && String(cell).trim() !== '').length;
          
          // If row has very few non-empty cells (like just "1209" in one cell), skip it
          // Or if it's a single number/string that doesn't look like data
          if (nonEmptyCells === 0) {
            dataStartIndex++;
            continue;
          }
          
          // If row has at least 3 non-empty cells, it's likely data (not metadata)
          if (nonEmptyCells >= 3) {
            break;
          }
          
          // Check if it's just a number (like "1209") - skip it
          const firstValue = String(row.find((cell: any) => cell !== null && cell !== undefined && String(cell).trim() !== '') || '').trim();
          if (/^\d+$/.test(firstValue) && nonEmptyCells <= 2) {
            dataStartIndex++;
            continue;
          }
          
          break; // Otherwise, assume it's data
        }
        
        if (jsonData.length <= dataStartIndex) {
          resolve([]);
          return;
        }
        
        // Get actual column headers - normalize them (trim, remove extra spaces, handle line breaks)
        const headers = jsonData[headerRowIndex].map((h: any) => {
          // Handle line breaks (\r\n, \n) within cells and normalize
          return String(h || '')
            .replace(/\r\n/g, ' ')  // Replace line breaks with spaces
            .replace(/\n/g, ' ')    // Replace single line breaks
            .replace(/\r/g, ' ')    // Replace carriage returns
            .trim()
            .replace(/\s+/g, ' ');  // Normalize multiple spaces
        });
        
        // Check for missing required columns and provide helpful error
        // Normalize header: remove "(Mandatory)", "(mandatory)", "(Mandatory for exports)", etc.
        const normalizeHeader = (h: string) => {
          return h.toLowerCase()
            // Remove variations of "(Mandatory)" - case insensitive, handles parentheses
            .replace(/\s*\(mandatory[^)]*\)\s*/gi, '') // "(Mandatory)", "(Mandatory for exports)", etc.
            .replace(/\s*mandatory\s*/gi, '') // Just "mandatory" without parentheses
            .replace(/\s*\(mandatory\s*/gi, '') // Opening parenthesis but no closing
            .replace(/mandatory\)\s*/gi, '') // Closing parenthesis but no opening
            // Clean up special characters but keep spaces
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        };
        
        const expectedLabels = columns.map(col => col.label);
        const missingColumns: string[] = [];
        columns.forEach(col => {
          const normalizedLabel = normalizeHeader(col.label);
          const found = headers.some(h => {
            const normalizedHeader = normalizeHeader(h);
            return h.toLowerCase() === col.label.toLowerCase() ||
                   normalizedHeader === normalizedLabel ||
                   normalizedHeader.includes(normalizedLabel) ||
                   normalizedLabel.includes(normalizedHeader);
          });
          if (!found && col.required) {
            missingColumns.push(col.label);
          }
        });
        
        if (missingColumns.length > 0) {
          reject(new Error(
            `Missing required columns: ${missingColumns.join(', ')}. ` +
            `Found columns: ${headers.filter(h => h).join(', ')}. ` +
            `Expected columns: ${expectedLabels.join(', ')}`
          ));
          return;
        }
        
        // Process data rows
        const parsedData: any[] = [];
        
        for (let i = dataStartIndex; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowObj: any = {};
          
          columns.forEach((col) => {
            // Normalize label (remove "(Mandatory)", extra spaces, special chars)
            const normalizeHeader = (h: string) => {
              return h.toLowerCase()
                // Remove variations of "(Mandatory)" - case insensitive, handles parentheses
                .replace(/\s*\(mandatory[^)]*\)\s*/gi, '') // "(Mandatory)", "(Mandatory for exports)", etc.
                .replace(/\s*mandatory\s*/gi, '') // Just "mandatory" without parentheses
                .replace(/\s*\(mandatory\s*/gi, '') // Opening parenthesis but no closing
                .replace(/mandatory\)\s*/gi, '') // Closing parenthesis but no opening
                // Clean up special characters but keep spaces
                .replace(/[^\w\s]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            };
            
            const normalizedLabel = normalizeHeader(col.label);
            
            // Try exact match first, then normalized match
            let headerIndex = headers.findIndex(h =>
              h.toLowerCase() === col.label.toLowerCase() ||
              normalizeHeader(h) === normalizedLabel
            );
            
            // If not found, try partial matching
            if (headerIndex === -1) {
              headerIndex = headers.findIndex(h => {
                const normalizedHeader = normalizeHeader(h);
                return normalizedHeader === normalizedLabel || 
                       normalizedHeader.includes(normalizedLabel) ||
                       normalizedLabel.includes(normalizedHeader);
              });
            }
            
            if (headerIndex !== -1 && headerIndex < row.length) {
              const value = row[headerIndex];
              // Handle different data types - preserve numbers, dates, etc.
              if (value === null || value === undefined) {
                rowObj[col.key] = '';
              } else if (typeof value === 'number') {
                // Check if this is a date column and value looks like Excel serial date (typically > 1 and < 1000000)
                const isDateColumn = ['eta', 'operation_commenced', 'operation_completed'].includes(col.key);
                if (isDateColumn && value > 1 && value < 1000000) {
                  // Excel serial date: days since 1900-01-01 (Excel incorrectly treats 1900 as leap year)
                  const excelEpoch = new Date(1900, 0, 1);
                  const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
                  rowObj[col.key] = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                } else {
                  rowObj[col.key] = String(value);
                }
              } else if (value instanceof Date) {
                rowObj[col.key] = value.toISOString().split('T')[0]; // Format as YYYY-MM-DD
              } else {
                // Handle string values - remove line breaks and normalize
                const stringValue = String(value)
                  .replace(/\r\n/g, ' ')
                  .replace(/\n/g, ' ')
                  .replace(/\r/g, ' ')
                  .trim();
                rowObj[col.key] = stringValue;
              }
            } else {
              rowObj[col.key] = '';
            }
          });
          
          // Only add row if it has at least one non-empty value
          if (Object.values(rowObj).some(v => v !== '')) {
            parsedData.push(rowObj);
          }
        }
        
        resolve(parsedData);
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to parse Excel file. Please check the format.';
        reject(new Error(errorMessage));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file.'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validate Excel data against column definitions
 */
export function validateExcelData(data: any[], columns: ExcelColumn[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  data.forEach((row, index) => {
    columns.forEach(col => {
      if (col.required && (!row[col.key] || row[col.key].trim() === '')) {
        errors.push(`Row ${index + 1}: Missing required field "${col.label}"`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

