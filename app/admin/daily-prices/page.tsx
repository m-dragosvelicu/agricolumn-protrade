'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload, FileUploadRef } from '@/components/admin/FileUpload';
import { Download, Upload, Table as TableIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { downloadExcel, generateTemplate, parseExcel, validateExcelData, type ExcelColumn } from '@/lib/excelUtils';
import { dailyPricesApi, type DailyPricesImportResponse } from '@/lib/api/dailyPrices';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const dailyPricesColumns: ExcelColumn[] = [
  { key: 'date', label: 'Date', example: '2025-09-17', required: true },
  { key: 'wheatBread', label: 'Wheat Bread (EUR/mt)', example: '189', required: false },
  { key: 'wheatFeed', label: 'Wheat Feed (EUR/mt)', example: '184', required: false },
  { key: 'barley', label: 'Barley (EUR/mt)', example: '188', required: false },
  { key: 'corn', label: 'Corn (EUR/mt)', example: '189', required: false },
  { key: 'sunflower', label: 'Sunflower Seeds (USD/mt)', example: '579', required: false },
  { key: 'rapeseed', label: 'Rapeseeds (USD/mt)', example: '550', required: false },
];

export default function DailyPricesAdmin() {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<DailyPricesImportResponse | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileUploadRef = React.useRef<FileUploadRef>(null);

  const handleDownloadTemplate = () => {
    const template = generateTemplate(dailyPricesColumns, 'DailyPrices');
    downloadExcel(template, 'daily-prices-template.xlsx');
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setErrors([]);
    setImportError(null);
    setImportResult(null);

    try {
      const data = await parseExcel(file, dailyPricesColumns);

      const validation = validateExcelData(data, dailyPricesColumns);

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
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadedData([]);
    setErrors([]);
    setImportError(null);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setImportError('Please select a file to upload.');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await dailyPricesApi.importData(formData);
      setImportResult(result);
      setSuccessModalOpen(true);
      setUploadedData([]);
      setSelectedFile(null);
      fileUploadRef.current?.clear();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Import failed. Please verify the Excel file and try again.';
      setImportError(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Daily Prices Data</h1>
        <p className="text-slate-400">
          Upload daily commodity prices for the ProTrade platform. Use one row per date and do not modify the column headers.
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
            Download the daily prices Excel template with fixed column headers. Treat the header row as read-only:
            one row per date, leave cells empty if there is no price for that day, use a dot as decimal separator,
            and enter the date as YYYY-MM-DD. Units and currencies (EUR/mt or USD/mt) are specified in the header.
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

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            ref={fileUploadRef}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            accept=".xlsx,.xls"
          />

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
              {importError && (
                <div className="flex items-center gap-3 rounded-lg border border-red-500/60 bg-red-500/10 p-4 text-sm text-red-200">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{importError}</span>
                </div>
              )}
              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full bg-amber-500 hover:bg-amber-600"
              >
                {isImporting ? 'Importing…' : `Import ${uploadedData.length} Price Records`}
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
                    {dailyPricesColumns.map(col => (
                      <th key={col.key} className="text-left p-2 text-slate-400 font-medium whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadedData.map((row, index) => (
                    <tr key={index} className="border-b border-slate-800">
                      {dailyPricesColumns.map(col => (
                        <td key={col.key} className="p-2 text-slate-300">
                          {row[col.key] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={successModalOpen}
        onOpenChange={(open) => {
          setSuccessModalOpen(open);
          if (!open) {
            setImportResult(null);
          }
        }}
      >
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              Daily Prices Imported
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              The daily price series have been imported and are now available for charts and analytics.
            </DialogDescription>
          </DialogHeader>

          {importResult && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-200">
                <p className="font-medium text-slate-100">Summary</p>
                <ul className="mt-2 space-y-1 text-slate-300">
                  <li>• Days with price data: {importResult.totalDays}</li>
                  <li>• Total price points imported: {importResult.totalPoints}</li>
                  {importResult.dateRange?.earliest && importResult.dateRange?.latest && (
                    <li>
                      • Date range: {importResult.dateRange.earliest} → {importResult.dateRange.latest}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setSuccessModalOpen(false)}
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
