'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/admin/FileUpload';
import { Download, Upload, Table as TableIcon, CheckCircle2 } from 'lucide-react';
import { downloadExcel, generateTemplate, parseExcel, validateExcelData, type ExcelColumn } from '@/lib/excelUtils';
import { getCountryCode, createDepartureLocation } from '@/lib/countryMappings';
import { format } from 'date-fns';
import { vesselsApi } from '@/lib/api/vessels';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define columns for Port Constanta data
// These match the exact Excel file structure - order matters!
// Labels match Excel headers (case-insensitive, ignores "(Mandatory)" text)
const portConstantaColumns: ExcelColumn[] = [
  { key: 'vessel_name', label: 'Vessel name', example: 'Tanzanite', required: true },
  { key: 'imo', label: 'IMO', example: '9456147', required: false },
  { key: 'status', label: 'status', example: 'Sailed', required: true },
  { key: 'departure_country', label: 'Departure country', example: 'Romania', required: true },
  { key: 'departure_port', label: 'Departure port', example: 'Constanta', required: false },
  { key: 'departure_terminal', label: 'Departure terminal', example: 'Cofco', required: false },
  { key: 'destination_country', label: 'Destination country', example: 'Egypt', required: false },
  { key: 'destination_port', label: 'Destination port', example: 'Alexandria', required: false },
  { key: 'destination_terminal', label: 'Destination terminal', example: 'Terminal 1', required: false },
  { key: 'operation_type', label: 'Operation type', example: 'Export', required: true },
  { key: 'eta', label: 'ETA', example: '2025-09-15', required: false },
  { key: 'operation_commenced', label: 'Operation Commenced', example: '2025-09-12', required: true },
  { key: 'operation_completed', label: 'Operation Completed', example: '2025-09-14', required: false },
  { key: 'commodity_group', label: 'Commodity group', example: 'Grains', required: true },
  { key: 'commodity_description', label: 'Commodity description', example: 'Wheat', required: true },
  { key: 'quantity', label: 'Quantity (MT)', example: '45000', required: true },
  { key: 'shipper', label: 'Shipper', example: 'AgriTrans', required: false },
  { key: 'cargo_origin_1', label: 'Cargo origin 1', example: 'Dolj', required: false },
  { key: 'cargo_origin_2', label: 'Cargo origin 2', example: 'Teleorman', required: false },
  { key: 'cargo_origin_3', label: 'Cargo origin 3', example: 'Ialomita', required: false },
];

export default function PortConstantaAdmin() {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<{ total: number; inserted: number; updated: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDownloadTemplate = () => {
    const template = generateTemplate(portConstantaColumns);
    downloadExcel(template, 'port-constanta-template.xlsx');
  };

  /**
   * Generate unique identifier for a vessel record
   * Uses: IMO + Operation Commenced
   * This uniquely identifies a vessel operation (one vessel can't start two operations at the same time)
   */
  const generateUniqueKey = (row: any): string => {
    const imo = (row.imo || '').toString().trim();
    const operationCommenced = (row.operation_commenced || '').toString().trim();
    const commodityDescription = (row.commodity_description || '').toString().trim();

    // Primary: IMO + Operation Commenced + Commodity Description
    if (imo && operationCommenced && commodityDescription) {
      return `${imo}_${operationCommenced}_${commodityDescription}`;
    }

    // Fallback: Vessel Name + Operation Commenced + Commodity Description (if IMO missing)
    const vesselName = (row.vessel_name || '').toString().trim();
    if (vesselName && operationCommenced && commodityDescription) {
      return `${vesselName}_${operationCommenced}_${commodityDescription}`;
    }

    // Last resort: Generate hash if critical fields missing
    console.warn('Missing IMO, Operation Commenced, or Commodity Description, generating fallback key');
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const data = await parseExcel(file, portConstantaColumns);

      // Transform data: combine departure_country and departure_port into departure_location
      // Format: {CTRY_CODE}-{Departure Port}
      const transformedData = data.map(row => {
        const departureCountry = (row.departure_country || '').toString().trim();
        const departurePort = (row.departure_port || '').toString().trim();
        
        // Create departure_location in format "CTRY_CODE-Departure Port"
        let departureLocation = '';
        if (departureCountry && departurePort) {
          // Get country code from country name
          const countryCode = getCountryCode(departureCountry);
          
          // Normalize port name (fix common typos)
          let normalizedPort = departurePort
            .replace(/constantza/gi, 'Constanta') // Fix typo
            .replace(/constanta/gi, 'Constanta') // Normalize case
            .trim();
          
          if (countryCode) {
            departureLocation = createDepartureLocation(countryCode, normalizedPort);
          } else {
            // Fallback: use first 2 letters of country name as code
            const fallbackCode = departureCountry.substring(0, 2).toUpperCase();
            departureLocation = createDepartureLocation(fallbackCode, normalizedPort);
          }
        } else if (departureCountry && !departurePort) {
          // Only country, no port - use country code only
          const countryCode = getCountryCode(departureCountry) || departureCountry.substring(0, 2).toUpperCase();
          departureLocation = countryCode;
        } else if (departurePort && !departureCountry) {
          // Only port, no country - use port as-is (will need manual fix)
          departureLocation = departurePort;
        }
        
        // Generate unique identifier for this record
        const uniqueKey = generateUniqueKey(row);
        
        return {
          ...row,
          departure_location: departureLocation || row.departure_location || '',
          _uniqueKey: uniqueKey, // Internal identifier for deduplication
        };
      });

      // Validate data (only required fields)
      const validation = validateExcelData(transformedData, portConstantaColumns);

      if (!validation.isValid) {
        setErrors(validation.errors);
        setUploadedData([]);
        setIsPreviewModalOpen(false);
      } else {
        setUploadedData(transformedData);
        setErrors([]);
        setIsPreviewModalOpen(true); // Open modal to show preview
        setCurrentPage(1); // Reset to first page
      }
    } catch (error: any) {
      setErrors([error.message || 'Failed to parse Excel file. Please check the format.']);
      setUploadedData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Normalize commodity descriptions to standard format
   * Examples:
   * - "SUNFLOWER SEEDS MEAL" -> "SFS MEAL"
   * - "Corn/Maize" -> "CORN"
   * - "Canola/Rapeseed" -> "RPS"
   * - "Canola/Rapeseed Meal" -> "RPS MEAL"
   */
  const normalizeCommodityDescription = (description: string): string => {
    if (!description) return description;
    
    const normalized = String(description).trim().toUpperCase();
    
    // Sunflower Seeds variants
    if (/SUNFLOWER\s*SEEDS?\s*MEAL/i.test(description)) {
      return 'SFS MEAL';
    }
    if (/SUNFLOWER\s*SEEDS?\s*OIL/i.test(description)) {
      return 'SFS OIL';
    }
    if (/SUNFLOWER\s*SEEDS?/i.test(description) && !/MEAL|OIL/i.test(description)) {
      return 'SFS';
    }
    
    // Rapeseed/Canola variants
    if (/(CANOLA|RAPESEED)\s*MEAL/i.test(description)) {
      return 'RPS MEAL';
    }
    if (/(CANOLA|RAPESEED)\s*OIL/i.test(description)) {
      return 'RPS OIL';
    }
    if (/(CANOLA|RAPESEED)/i.test(description) && !/MEAL|OIL/i.test(description)) {
      return 'RPS';
    }
    
    // Corn/Maize normalization
    if (/CORN|MAIZE/i.test(description)) {
      return 'CORN';
    }
    
    // Return original if no match (preserve other commodities like Wheat, Barley, etc.)
    return String(description).trim();
  };

  const handleImport = async () => {
    if (uploadedData.length === 0) return;
    
    // Helper function to convert empty strings to undefined
    const toOptionalString = (value: any): string | undefined => {
      if (value === null || value === undefined || value === '') return undefined;
      const str = String(value).trim();
      return str === '' ? undefined : str;
    };

    const toOptionalNumber = (value: any): number | undefined => {
      if (value === null || value === undefined || value === '') return undefined;
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      return isNaN(num) ? undefined : num;
    };

    // Helper function to format dates to ISO 8601 (YYYY-MM-DD)
    const formatDateForAPI = (value: any): string | undefined => {
      if (!value || value === '') return undefined;
      
      // If already in YYYY-MM-DD format
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.substring(0, 10); // Take only date part
      }
      
      // If it's an Excel serial date number
      if (typeof value === 'number' && value > 1 && value < 1000000) {
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
        return format(date, 'yyyy-MM-dd');
      }
      
      // Try to parse as date
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return format(date, 'yyyy-MM-dd');
        }
      } catch {
        // Ignore parse errors
      }
      
      return undefined;
    };

    // Prepare data for API (remove internal fields and transform to match backend DTO)
    let vesselsToImport: any[] = [];
    
    try {
      setIsProcessing(true);
      setErrors([]);
      
      vesselsToImport = uploadedData.map(row => {
        const { _uniqueKey, departure_country, departure_port, ...rest } = row;
        
        // Transform data to match backend DTO format
        // Convert empty strings to undefined for optional fields
        const vessel: any = {
          vessel_name: String(rest.vessel_name || '').trim(),
          status: String(rest.status || '').trim(),
          departure_location: String(rest.departure_location || '').trim(),
          operation_type: String(rest.operation_type || '').trim(),
          operation_commenced: formatDateForAPI(rest.operation_commenced) || String(rest.operation_commenced || '').trim(),
          commodity_group: String(rest.commodity_group || '').trim(),
          commodity_description: normalizeCommodityDescription(rest.commodity_description || ''),
        };

        // Add optional fields only if they have values
        if (rest.imo) vessel.imo = toOptionalString(rest.imo);
        if (rest.departure_terminal) vessel.departure_terminal = toOptionalString(rest.departure_terminal);
        if (rest.destination_country) vessel.destination_country = toOptionalString(rest.destination_country);
        if (rest.destination_port) vessel.destination_port = toOptionalString(rest.destination_port);
        if (rest.destination_terminal) vessel.destination_terminal = toOptionalString(rest.destination_terminal);
        if (rest.eta) vessel.eta = formatDateForAPI(rest.eta);
        if (rest.operation_completed) vessel.operation_completed = formatDateForAPI(rest.operation_completed);
        if (rest.quantity !== null && rest.quantity !== undefined && rest.quantity !== '') {
          const qty = toOptionalNumber(rest.quantity);
          if (qty !== undefined) vessel.quantity = qty;
        }
        if (rest.shipper) vessel.shipper = toOptionalString(rest.shipper);
        if (rest.cargo_origin_1) vessel.cargo_origin_1 = toOptionalString(rest.cargo_origin_1);
        if (rest.cargo_origin_2) vessel.cargo_origin_2 = toOptionalString(rest.cargo_origin_2);
        if (rest.cargo_origin_3) vessel.cargo_origin_3 = toOptionalString(rest.cargo_origin_3);

        return vessel;
      });
      
      // Call backend API for bulk upsert
      const result = await vesselsApi.upsertVessels(vesselsToImport);
      
      // Store result and show success modal
      setImportResult(result);
      
      // Close preview modal and reset
      setIsPreviewModalOpen(false);
      setUploadedData([]);
      setCurrentPage(1);
      
      // Open success modal
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      // Log full error details for debugging
      console.error('Import error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error response message:', error.response?.data?.message);
      if (vesselsToImport.length > 0) {
        console.error('Request data sample (first vessel):', JSON.stringify(vesselsToImport[0], null, 2));
      }
      
      // Extract detailed validation errors if available
      let errorMessage = 'Failed to import data. Please try again.';
      const errorData = error.response?.data;
      
      if (errorData?.message) {
        if (Array.isArray(errorData.message)) {
          // Format validation errors nicely
          errorMessage = errorData.message.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.constraints) {
              return Object.values(err.constraints).join(', ');
            }
            return JSON.stringify(err);
          }).join('\n');
        } else {
          errorMessage = String(errorData.message);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors([errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
    setUploadedData([]);
    setCurrentPage(1);
    setErrors([]); // Clear any errors
    setIsProcessing(false); // Reset processing state
  };

  // Pagination for modal
  const totalPages = Math.ceil(uploadedData.length / itemsPerPage);
  const paginatedData = uploadedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date values (Excel dates come as numbers or date strings)
  const formatDate = (value: any): string => {
    if (!value) return '-';
    
    // If it's already a formatted date string, return it
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        const date = new Date(value);
        return format(date, 'yyyy-MM-dd');
      } catch {
        return value;
      }
    }
    
    // If it's an Excel serial date number (days since 1900-01-01)
    if (typeof value === 'number') {
      try {
        // Excel epoch starts on 1900-01-01, but Excel incorrectly treats 1900 as a leap year
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
        return format(date, 'yyyy-MM-dd');
      } catch {
        return String(value);
      }
    }
    
    // Try to parse as date
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return format(date, 'yyyy-MM-dd');
      }
    } catch {
      // Ignore
    }
    
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Port Constanta Data</h1>
        <p className="text-slate-400">
          Upload and manage vessel movement data from Port Constanta
        </p>
      </div>

      {/* Export Template Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Export Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">
            Download an Excel template with the correct column structure and example data.
            Fill in your data and upload it back to import.
          </p>
          <Button
            onClick={handleDownloadTemplate}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Template Excel
          </Button>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload 
            key={uploadedData.length === 0 ? 'upload-ready' : 'file-selected'}
            onFileSelect={handleFileSelect} 
            accept=".xlsx,.xls" 
          />

          {isProcessing && (
            <div className="text-center text-slate-400">
              Processing file...
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2">Validation Errors:</h3>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-300">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog 
        open={isPreviewModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            handleCloseModal();
          }
        }}
      >
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <TableIcon className="mr-2 h-5 w-5" />
              Data Preview ({uploadedData.length} records)
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Review the data before importing. Records will be matched by IMO + Operation Commenced + Commodity Description.
              <br />
              <span className="text-amber-400 font-semibold">Note:</span> Departure Country and Departure Port are combined into <span className="font-mono">Departure Location</span> format: <span className="font-mono text-amber-400">{'{CTRY_CODE}-{Departure Port}'}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            <div className="overflow-x-auto w-full" style={{ maxWidth: '100%' }}>
              <Table style={{ minWidth: 'max-content', width: '100%', tableLayout: 'auto' }}>
                <TableHeader>
                  <TableRow className="hover:bg-slate-700/50">
                    <TableHead className="text-slate-400 sticky left-0 bg-slate-800 z-10 min-w-[50px] max-w-[50px]">#</TableHead>
                    {portConstantaColumns.map((col, idx) => {
                      // Skip departure_country and departure_port since they're combined into departure_location
                      if (col.key === 'departure_country' || col.key === 'departure_port') {
                        return null;
                      }
                      // Show departure_location right before departure_terminal
                      if (col.key === 'departure_terminal') {
                        return (
                          <React.Fragment key={`departure-section-${idx}`}>
                            <TableHead key="departure_location" className="text-slate-400 whitespace-nowrap bg-amber-500/10 min-w-[180px]">
                              Departure Location
                            </TableHead>
                            <TableHead key={col.key} className="text-slate-400 whitespace-nowrap min-w-[150px]">
                              {col.label}
                            </TableHead>
                          </React.Fragment>
                        );
                      }
                      return (
                        <TableHead key={col.key} className="text-slate-400 whitespace-nowrap min-w-[150px]">
                          {col.label}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-slate-700/50">
                      <TableCell className="text-slate-300 sticky left-0 bg-slate-800/95 z-10 font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      {portConstantaColumns.map((col, colIdx) => {
                        // Skip departure_country and departure_port since they're combined
                        if (col.key === 'departure_country' || col.key === 'departure_port') {
                          return null;
                        }
                        // Show departure_location right before departure_terminal
                        if (col.key === 'departure_terminal') {
                          return (
                            <React.Fragment key={`departure-section-${colIdx}`}>
                              <TableCell key="departure_location" className="text-slate-300 whitespace-nowrap font-medium bg-amber-500/5">
                                {row.departure_location || '-'}
                              </TableCell>
                              <TableCell key={col.key} className="text-slate-300 whitespace-nowrap">
                                {row[col.key] || '-'}
                              </TableCell>
                            </React.Fragment>
                          );
                        }
                        // Format date columns
                        const isDateColumn = ['eta', 'operation_commenced', 'operation_completed'].includes(col.key);
                        const cellValue = isDateColumn ? formatDate(row[col.key]) : (row[col.key] || '-');
                        
                        return (
                          <TableCell key={col.key} className="text-slate-300 whitespace-nowrap">
                            {cellValue}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {uploadedData.length > itemsPerPage && (
              <div className="mt-4 text-center text-sm text-slate-400">
                Showing {paginatedData.length} of {uploadedData.length} records on this page
              </div>
            )}
              </div>

          <DialogFooter className="flex items-center justify-between border-t border-slate-700 pt-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Previous
              </Button>
              <span className="text-slate-400 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Next
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={isProcessing}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isProcessing ? 'Importing...' : `Import ${uploadedData.length} Records`}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog 
        open={isSuccessModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsSuccessModalOpen(false);
            setImportResult(null);
          }
        }}
      >
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
              Import Successful
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              The data has been successfully imported into the database.
            </DialogDescription>
          </DialogHeader>
          
          {importResult && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Total Records:</span>
                  <span className="text-white font-semibold">{importResult.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">New Records Inserted:</span>
                  <span className="text-green-400 font-semibold">{importResult.inserted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Existing Records Updated:</span>
                  <span className="text-amber-400 font-semibold">{importResult.updated}</span>
                </div>
              </div>
              <div className="text-sm text-slate-400 border-t border-slate-700 pt-4">
                <p className="font-semibold mb-1">Matching Criteria:</p>
                <p className="font-mono text-xs">IMO + Operation Commenced + Commodity Description</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setIsSuccessModalOpen(false);
                setImportResult(null);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
