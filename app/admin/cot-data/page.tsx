'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload, FileUploadRef } from '@/components/admin/FileUpload';
import { Upload, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cotCftcApi, CotCftcImportResult } from '@/lib/api/cotCftc';

export default function COTDataAdmin() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<CotCftcImportResult | null>(null);
  const fileUploadRef = useRef<FileUploadRef>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      // Send the raw file directly to backend - no frontend parsing!
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Uploading file:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      });

      const response = await cotCftcApi.importData(formData);

      console.log('Import successful:', response);

      setImportResult(response);
      setSuccessModalOpen(true);
      setSelectedFile(null);
      fileUploadRef.current?.clear();
    } catch (err: any) {
      console.error('Import error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);

      let message = 'Import failed. Please verify the Excel file format and try again.';

      // Extract backend error message if available
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.error) {
        message = err.response.data.error;
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">COT-CFTC Data</h1>
        <p className="text-slate-400">
          Upload the official COT-CFTC Excel file with net positions data. The backend will automatically parse the unique alternating-row format.
        </p>
      </div>

      {/* Important Notice */}
      <Card className="bg-blue-500/10 border-blue-500/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200 space-y-2">
              <p className="font-semibold">Important: Unique Excel Format</p>
              <p>
                The COT-CFTC Excel file uses a special alternating-row structure with exchange and commodity data.
                Simply upload the raw Excel file - the backend handles all parsing and validation automatically.
              </p>
              <p className="text-xs text-blue-300">
                Expected structure: Exchange rows (CBOT/EURONEXT) alternate with commodity rows (WHEAT/CORN/SOY/RPS),
                with dates in columns and values in cells.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload COT-CFTC Excel File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            ref={fileUploadRef}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            accept=".xlsx,.xls"
          />

          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/60 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {selectedFile && !error && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                <p className="text-green-400 font-semibold">
                  ✓ File ready: {selectedFile.name}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Size: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>

              <Separator className="bg-slate-700/70" />

              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-300 space-y-2">
                <p className="font-semibold text-slate-200 uppercase tracking-wide text-xs">
                  Import Process
                </p>
                <ul className="space-y-1">
                  <li>• Backend will parse the alternating exchange/commodity row structure</li>
                  <li>• Excel serial dates will be converted to YYYY-MM-DD format</li>
                  <li>• Records are upserted based on exchange + commodity + date combination</li>
                  <li>• Existing records with matching keys will be updated</li>
                </ul>
              </div>

              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full bg-amber-500 hover:bg-amber-600"
              >
                {isImporting ? 'Importing…' : 'Import COT-CFTC Data'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Modal */}
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
              COT-CFTC Data Imported
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              The COT-CFTC positions have been successfully imported and the dashboard data has been updated.
            </DialogDescription>
          </DialogHeader>

          {importResult && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-200">
                <p className="font-medium text-slate-100">Summary</p>
                <ul className="mt-2 space-y-1 text-slate-300">
                  <li>• Total records processed: {importResult.total}</li>
                  <li>• New records inserted: {importResult.inserted}</li>
                  <li>• Existing records updated: {importResult.updated}</li>
                </ul>
              </div>

              <div className="rounded-lg border border-amber-400/50 bg-amber-500/10 p-4 text-xs text-amber-200">
                <p className="font-semibold uppercase tracking-wide text-amber-200">
                  Next Steps
                </p>
                <p>
                  The COT-CFTC panel in the dashboard will now display the updated positions.
                  Refresh the page to see the latest data.
                </p>
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
