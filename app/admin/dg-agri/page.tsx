'use client';

import React, { useMemo, useState, useRef } from 'react';
import { AlertTriangle, CheckCircle2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload, FileUploadRef } from '@/components/admin/FileUpload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { dgAgriApi, DGAgriImportResponse } from '@/lib/api/dgAgri';

export default function DGAgriAdmin() {
  const [cerFile, setCerFile] = useState<File | null>(null);
  const [oilseedsFile, setOilseedsFile] = useState<File | null>(null);
  const cerFileUploadRef = useRef<FileUploadRef>(null);
  const oilseedsFileUploadRef = useRef<FileUploadRef>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<DGAgriImportResponse | null>(
    null,
  );

  const canImport = useMemo(
    () => !!cerFile && !!oilseedsFile && !isImporting,
    [cerFile, oilseedsFile, isImporting],
  );

  const resetSelection = () => {
    setCerFile(null);
    setOilseedsFile(null);
    cerFileUploadRef.current?.clear();
    oilseedsFileUploadRef.current?.clear();
  };

  const handleImport = async () => {
    if (!cerFile || !oilseedsFile) {
      setError('Please select both CER and OILSEEDS Excel files before importing.');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cerFile', cerFile);
      formData.append('oilseedsFile', oilseedsFile);

      const response = await dgAgriApi.importData(formData);
      setImportResult(response);
      setSuccessModalOpen(true);
      resetSelection();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Import failed. Please verify both Excel files and try again.';
      setError(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">DG AGRI Data</h1>
        <p className="text-slate-400">
          Upload the official DG AGRI trade files to refresh the dashboard data.
          Provide the latest <span className="font-semibold text-white">CER</span>{' '}
          and <span className="font-semibold text-white">OILSEEDS</span> Excel
          workbooks in one import to keep the weekly charts and YTD views in sync.
        </p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload DG AGRI Excel Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                  CER (Cereals) Workbook
                </h3>
                <p className="text-xs text-slate-400">
                  Use the official CER TAXUD_Surv data file. The import reads 1MY
                  and 3MY sheets for wheat, corn, and barley.
                </p>
              </div>
              <FileUpload
                ref={cerFileUploadRef}
                onFileSelect={(file) => setCerFile(file)}
                onFileRemove={() => setCerFile(null)}
                accept=".xlsx,.xls"
              />
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                  OILSEEDS Workbook
                </h3>
                <p className="text-xs text-slate-400">
                  Upload the matching OILSEEDS TAXUD_Surv file. Palm oil data is
                  ignored automatically.
                </p>
              </div>
              <FileUpload
                ref={oilseedsFileUploadRef}
                onFileSelect={(file) => setOilseedsFile(file)}
                onFileRemove={() => setOilseedsFile(null)}
                accept=".xlsx,.xls"
              />
            </div>
          </div>

          <Separator className="bg-slate-700/70" />

          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-300 space-y-2">
            <p className="font-semibold text-slate-200 uppercase tracking-wide text-xs">
              Import Checklist
            </p>
            <ul className="space-y-1">
              <li>• Use the official DG AGRI weekly Excel exports (no alterations).</li>
              <li>• Make sure both workbooks cover the same reporting date.</li>
              <li>• Each import replaces the existing DG AGRI dataset in the platform.</li>
            </ul>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/60 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end">
            <Button
              onClick={handleImport}
              disabled={!canImport}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isImporting ? 'Importing…' : 'Import DG AGRI Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

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
              DG AGRI Data Imported
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              The DG AGRI dashboards have been refreshed with the latest weekly and YTD data.
            </DialogDescription>
          </DialogHeader>

          {importResult && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-200">
                <p className="font-medium text-slate-100">Summary</p>
                <ul className="mt-2 space-y-1 text-slate-300">
                  <li>• YTD country rows loaded: {importResult.ytdRecords}</li>
                  <li>• Weekly time-series rows loaded: {importResult.weeklyRecords}</li>
                  {importResult.marketingYear && (
                    <li>• Marketing year: {importResult.marketingYear}</li>
                  )}
                  {importResult.periodLabel && (
                    <li>• Period covered: {importResult.periodLabel}</li>
                  )}
                </ul>
              </div>

              <div className="rounded-lg border border-amber-400/50 bg-amber-500/10 p-4 text-xs text-amber-200">
                <p className="font-semibold uppercase tracking-wide text-amber-200">
                  Next Steps
                </p>
                <p>
                  Refresh the analytics dashboard to view the updated DG AGRI charts. Redis caches
                  were cleared automatically.
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
