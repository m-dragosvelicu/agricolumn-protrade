'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/admin/FileUpload';
import { Download, Upload, Table as TableIcon } from 'lucide-react';
import { arrayToExcel, downloadExcel, parseExcel, validateExcelData, type ExcelColumn } from '@/lib/excelUtils';

const cotDataColumns: ExcelColumn[] = [
  { key: 'instrument', label: 'Instrument', example: 'CBOT Wheat', required: true },
  { key: 'date', label: 'Date', example: '20.08.2025', required: true },
  { key: 'price', label: 'Net Position', example: '-4261', required: true },
];

const COT_INSTRUMENTS = [
  'CBOT Wheat',
  'CBOT Corn',
  'CBOT Soybean',
  'Euronext Wheat',
  'Euronext Corn',
  'Euronext RPS',
  'CBOT Soy Oil',
];

export default function COTDataAdmin() {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadTemplate = () => {
    const templateRows = COT_INSTRUMENTS.map((instrument) => ({
      instrument,
      date: '',
      price: '',
    }));

    const template = arrayToExcel(templateRows, cotDataColumns);
    downloadExcel(template, 'cot-data-template.xlsx');
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const data = await parseExcel(file, cotDataColumns);

      const validation = validateExcelData(data, cotDataColumns);

      if (!validation.isValid) {
        setErrors(validation.errors);
        setUploadedData([]);
      } else {
        setUploadedData(data);
        setErrors([]);
      }
    } catch (error: any) {
      setErrors([error.message || 'Failed to parse Excel file. Please check the format.']);
      setUploadedData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    console.log('Importing data:', uploadedData);
    alert(`Successfully imported ${uploadedData.length} COT records!`);
    setUploadedData([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">COT CFTC Data</h1>
        <p className="text-slate-400">
          Upload Commitment of Traders (COT) data from CFTC reports
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
            Download the COT data template. Instruments: CBOT Wheat, CBOT Corn, CBOT Soybean,
            Euronext Wheat, Euronext Corn, Euronext RPS, CBOT Soy Oil.
          </p>
          <div className="bg-slate-900/50 border border-slate-700/80 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">How to complete the Excel file</h3>
            <ol className="list-decimal list-inside text-sm text-slate-300 space-y-2">
              <li>The template lists every accepted instrument – keep the instrument labels exactly as provided.</li>
              <li>Insert a new row for each reporting date and instrument combination. Duplicate the instrument name for additional weeks.</li>
              <li>Enter the report date using <code className="px-1 py-0.5 bg-slate-800 rounded">DD.MM.YYYY</code>.</li>
              <li>Fill <span className="font-medium text-white">Net Position</span> as an integer (use minus sign for net short positions).</li>
              <li>Save the file as Excel (.xlsx) before uploading.</li>
            </ol>
            <div>
              <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">Allowed instrument labels</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-300">
                {COT_INSTRUMENTS.map((instrument) => (
                  <li key={instrument} className="bg-slate-800/60 border border-slate-700 rounded px-2 py-1">
                    {instrument}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Button
            onClick={handleDownloadTemplate}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Template Excel
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
          <FileUpload onFileSelect={handleFileSelect} accept=".xlsx,.xls" />

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
                Import {uploadedData.length} COT Records
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
                    {cotDataColumns.map(col => (
                      <th key={col.key} className="text-left p-2 text-slate-400 font-medium">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadedData.slice(0, 15).map((row, index) => (
                    <tr key={index} className="border-b border-slate-800">
                      {cotDataColumns.map(col => (
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
