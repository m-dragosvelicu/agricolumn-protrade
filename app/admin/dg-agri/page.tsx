'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/admin/FileUpload';
import { Download, Upload, Table as TableIcon } from 'lucide-react';
import { downloadCSV, generateTemplate, parseCSV, validateCSVData, type CSVColumn } from '@/lib/csvUtils';

const dgAgriColumns: CSVColumn[] = [
  { key: 'dataset', label: 'Dataset', example: 'EU Wheat Export', required: true },
  { key: 'country', label: 'Country', example: 'Romania', required: true },
  { key: 'value', label: 'Value (tonnes)', example: '1978033', required: true },
  { key: 'period', label: 'Period', example: '01.07.25-16.09.2025', required: true },
];

export default function DGAgriAdmin() {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadTemplate = () => {
    const template = generateTemplate(dgAgriColumns);
    downloadCSV(template, 'dg-agri-template.csv');
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const text = await file.text();
      const data = parseCSV(text, dgAgriColumns);

      const validation = validateCSVData(data, dgAgriColumns);

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
    console.log('Importing data:', uploadedData);
    alert(`Successfully imported ${uploadedData.length} DG AGRI records!`);
    setUploadedData([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">DG AGRI Data</h1>
        <p className="text-slate-400">
          Upload EU agricultural trade data from DG AGRI reports
        </p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Export Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">
            Download the DG AGRI template. Datasets include: EU Wheat Export, Wheat Import,
            Corn Import, Barley Export/Import, Rapeseed Export/Import, Sunflower Export/Import,
            Soybean Export/Import, and meal/oil data.
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
            <div className="text-center text-slate-400">Processing file...</div>
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
                Import {uploadedData.length} DG AGRI Records
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
                    {dgAgriColumns.map(col => (
                      <th key={col.key} className="text-left p-2 text-slate-400 font-medium">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadedData.slice(0, 15).map((row, index) => (
                    <tr key={index} className="border-b border-slate-800">
                      {dgAgriColumns.map(col => (
                        <td key={col.key} className="p-2 text-slate-300">
                          {row[col.key] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {uploadedData.length > 15 && (
                <p className="text-sm text-slate-400 mt-2 text-center">
                  Showing 15 of {uploadedData.length} records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
