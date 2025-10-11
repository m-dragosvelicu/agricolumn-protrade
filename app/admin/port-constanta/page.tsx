'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/admin/FileUpload';
import { Download, Upload, Table as TableIcon } from 'lucide-react';
import { downloadCSV, generateTemplate, parseCSV, validateCSVData, type CSVColumn } from '@/lib/csvUtils';

// Define columns for Port Constanta data
const portConstantaColumns: CSVColumn[] = [
  { key: 'vessel_name', label: 'Vessel Name', example: 'MV Black Sea', required: true },
  { key: 'status', label: 'Status', example: 'Loading', required: true },
  { key: 'departure_country', label: 'Departure Country', example: 'Romania', required: true },
  { key: 'departure_port', label: 'Departure Port', example: 'Constanța', required: true },
  { key: 'departure_terminal', label: 'Departure Terminal', example: 'Terminal 1', required: true },
  { key: 'destination_country', label: 'Destination Country', example: 'Egypt', required: true },
  { key: 'operation_type', label: 'Operation Type', example: 'Export', required: true },
  { key: 'operation_completed', label: 'Operation Completed', example: '2025-09-12', required: true },
  { key: 'commodity_description', label: 'Commodity', example: 'Wheat', required: true },
  { key: 'shipper', label: 'Shipper', example: 'AgriTrans', required: true },
  { key: 'cargo_origin_1', label: 'Cargo Origin 1', example: 'Dolj', required: false },
  { key: 'cargo_origin_2', label: 'Cargo Origin 2', example: 'Teleorman', required: false },
];

export default function PortConstantaAdmin() {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadTemplate = () => {
    const template = generateTemplate(portConstantaColumns);
    downloadCSV(template, 'port-constanta-template.csv');
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const text = await file.text();
      const data = parseCSV(text, portConstantaColumns);

      // Validate data
      const validation = validateCSVData(data, portConstantaColumns);

      if (!validation.isValid) {
        setErrors(validation.errors);
        setUploadedData([]);
      } else {
        setUploadedData(data);
        setErrors([]);
      }
    } catch (error) {
      setErrors(['Failed to parse CSV file. Please check the format.']);
      setUploadedData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    // TODO: Send data to backend API
    console.log('Importing data:', uploadedData);
    alert(`Successfully imported ${uploadedData.length} records!`);
    setUploadedData([]);
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
            Download a CSV template with the correct column structure and example data.
            Fill in your data and upload it back to import.
          </p>
          <Button
            onClick={handleDownloadTemplate}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Template CSV
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
          <FileUpload onFileSelect={handleFileSelect} accept=".csv" />

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

          {uploadedData.length > 0 && errors.length === 0 && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                <p className="text-green-400 font-semibold">
                  ✓ Successfully parsed {uploadedData.length} records
                </p>
              </div>

              <Button
                onClick={handleImport}
                className="w-full bg-amber-500 hover:bg-amber-600"
              >
                Import {uploadedData.length} Records
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      {uploadedData.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TableIcon className="mr-2 h-5 w-5" />
              Data Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    {portConstantaColumns.slice(0, 6).map(col => (
                      <th key={col.key} className="text-left p-2 text-slate-400 font-medium">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadedData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b border-slate-800">
                      {portConstantaColumns.slice(0, 6).map(col => (
                        <td key={col.key} className="p-2 text-slate-300">
                          {row[col.key] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {uploadedData.length > 5 && (
                <p className="text-sm text-slate-400 mt-2 text-center">
                  Showing 5 of {uploadedData.length} records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
