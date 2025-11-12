'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/admin/FileUpload';
import { Download, Upload, Table as TableIcon } from 'lucide-react';
import { arrayToExcel, downloadExcel, parseExcel, validateExcelData, type ExcelColumn } from '@/lib/excelUtils';

const dgAgriColumns: ExcelColumn[] = [
  { key: 'dataset', label: 'Dataset', example: 'Wheat Export', required: true },
  { key: 'country', label: 'Country', example: 'Romania', required: true },
  { key: 'value', label: 'Value (tonnes)', example: '1978033', required: true },
  { key: 'period', label: 'Period', example: '01.07.25-16.09.2025', required: true },
];

const DG_AGRI_DATASETS = [
  'Wheat Export',
  'Wheat Import',
  'Corn Import',
  'Romania RPS Export',
  'Romania Export',
  'Corn Export',
  'Barley Export',
  'Barley Import',
  'Soybean Import',
  'Rapeseed Export',
  'Rapeseed Import',
  'Sunflower Export',
  'Sunflower Import',
  'Rapeseed Oil Export',
  'Rapeseed Oil Import',
  'Sunflower Oil Export',
  'Sunflower Oil Import',
  'Soybeans Export',
  'Soybeans Import',
  'Soy Oil Export',
  'Soy Oil Import',
  'RPS Meal Export',
  'RPS Meal Import',
  'SFS Meal Export',
  'SFS Meal Import',
  'Soy Meal Export',
  'Soy Meal Import',
];

export default function DGAgriAdmin() {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadTemplate = () => {
    const templateRows = DG_AGRI_DATASETS.map((dataset) => ({
      dataset,
      country: '',
      value: '',
      period: '',
    }));

    const template = arrayToExcel(templateRows, dgAgriColumns);
    downloadExcel(template, 'dg-agri-template.xlsx');
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const data = await parseExcel(file, dgAgriColumns);

      const validation = validateExcelData(data, dgAgriColumns);

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
            Download the DG AGRI template. Datasets include: Wheat Export, Wheat Import,
            Corn Export/Import, Barley Export/Import, Rapeseed Export/Import, Sunflower Export/Import,
            Soybean Export/Import, and meal/oil data.
          </p>
          <div className="bg-slate-900/50 border border-slate-700/80 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">How to complete the Excel file</h3>
            <ol className="list-decimal list-inside text-sm text-slate-300 space-y-2">
              <li>Download the template – each row already contains the exact dataset label used in the dashboards.</li>
              <li>Fill in <span className="font-medium text-white">Country</span>, <span className="font-medium text-white">Value (tonnes)</span>, and <span className="font-medium text-white">Period</span> for every dataset row. Keep the dataset label unchanged.</li>
              <li>Use tonnes as whole numbers (no separators) and date ranges in the format <code className="px-1 py-0.5 bg-slate-800 rounded">DD.MM.YY-DD.MM.YYYY</code>.</li>
              <li>Add additional rows if DG AGRI provides more countries for a dataset – duplicate the dataset label exactly as listed.</li>
              <li>Save the file as Excel (.xlsx) before uploading.</li>
            </ol>
            <div>
              <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">Allowed dataset labels</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-slate-300">
                {DG_AGRI_DATASETS.map((dataset) => (
                  <li key={dataset} className="bg-slate-800/60 border border-slate-700 rounded px-2 py-1">
                    {dataset}
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
