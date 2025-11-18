'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/admin/FileUpload';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Upload, Table as TableIcon, Plus, Trash2 } from 'lucide-react';
import { downloadExcel, generateTemplate, parseExcel, validateExcelData, type ExcelColumn } from '@/lib/excelUtils';
import { reportsApi, type CreateReportDto } from '@/lib/api/reports';
import type { Report } from '@/types';

const reportsColumns: ExcelColumn[] = [
  { key: 'title', label: 'Title', example: 'Wheat Futures Rise on EU Weather Concerns', required: true },
  { key: 'summary', label: 'Summary', example: 'European wheat futures climbed 2.5%...', required: true },
  { key: 'body', label: 'Body', example: 'Extended body content here...', required: true },
  { key: 'dateISO', label: 'Date (ISO)', example: '2024-03-15T09:00:00Z', required: true },
  { key: 'tags', label: 'Tags (comma-separated)', example: 'Wheat,EU,Weather', required: true },
  { key: 'slug', label: 'Slug', example: 'wheat-futures-rise-eu-weather', required: true },
  { key: 'isRecommended', label: 'Is Recommended', example: 'true', required: false },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

export default function ReportsAdmin() {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [existingReports, setExistingReports] = useState<Report[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [existingError, setExistingError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [dateInput, setDateInput] = useState(() => {
    const now = new Date();
    const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
    return iso.slice(0, 16); // yyyy-MM-ddTHH:mm for datetime-local
  });
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);

  const loadReports = async () => {
    setIsLoadingExisting(true);
    setExistingError(null);
    try {
      const response = await reportsApi.getReports({ offset: 0, limit: 50 });
      setExistingReports(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load reports. This will start working once the backend reports endpoint is available.';
      setExistingError(message);
      setExistingReports([]);
    } finally {
      setIsLoadingExisting(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDownloadTemplate = () => {
    const template = generateTemplate(reportsColumns);
    downloadExcel(template, 'commodity-reports-template.xlsx');
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const data = await parseExcel(file, reportsColumns);

      // First validate the raw string values from Excel
      const validation = validateExcelData(data, reportsColumns);

      if (!validation.isValid) {
        setErrors(validation.errors);
        setUploadedData([]);
        return;
      }

      // Transform tags from comma-separated string to array
      const transformedData = data.map(row => ({
        ...row,
        tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
        isRecommended: row.isRecommended === 'true'
      }));

      setUploadedData(transformedData);
      setErrors([]);
    } catch (error: any) {
      setErrors([error.message || 'Failed to parse Excel file. Please check the format.']);
      setUploadedData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    console.log('Importing data:', uploadedData);
    alert(`Successfully imported ${uploadedData.length} reports!`);
    setUploadedData([]);
  };

  const handleDeleteReport = async (report: Report) => {
    const confirmed = window.confirm(
      `Delete the report "${report.title}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await reportsApi.deleteReport(report.id);
      setExistingReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete report. Please try again.';
      alert(message);
    }
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
    setCreateError(null);
  };

  const handleCloseCreateDialog = () => {
    if (isSubmitting) return;
    setIsCreateDialogOpen(false);
    setCreateError(null);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value);
  };

  const parsedTags = useMemo(
    () =>
      tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsInput],
  );

  const handleSubmitCreate = async () => {
    setCreateError(null);

    if (!title.trim() || !summary.trim() || !body.trim()) {
      setCreateError('Title, summary, and body are required.');
      return;
    }

    if (!dateInput) {
      setCreateError('Please select a publish date.');
      return;
    }

    if (!slug.trim()) {
      setCreateError('Slug is required.');
      return;
    }

    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) {
      setCreateError('Publish date is invalid.');
      return;
    }

    const payload: CreateReportDto = {
      title: title.trim(),
      summary: summary.trim(),
      body: body.trim(),
      dateISO: date.toISOString(),
      tags: parsedTags,
      slug: slug.trim(),
      isRecommended,
    };

    try {
      setIsSubmitting(true);
      await reportsApi.createReport(payload);

      // Reset form on success
      setTitle('');
      setSummary('');
      setBody('');
      setTagsInput('');
      setSlug('');
      setSlugTouched(false);
      setIsRecommended(false);
      const now = new Date();
      const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
      setDateInput(iso.slice(0, 16));

      setIsCreateDialogOpen(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create report. Please try again.';
      setCreateError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Commodity Reports</h1>
          <p className="text-slate-400">
            Manage commodity market reports and insights
          </p>
        </div>
        <Button
          onClick={handleOpenCreateDialog}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Report
        </Button>
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
            Download the commodity reports Excel template. Include title, summary, full body content,
            date (ISO format), tags (comma-separated), slug, and recommendation status.
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
            Bulk Upload Reports
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
                  ✓ Successfully parsed {uploadedData.length} reports
                </p>
              </div>
              <Button
                onClick={handleImport}
                className="w-full bg-amber-500 hover:bg-amber-600"
              >
                Import {uploadedData.length} Reports
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
              Reports Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedData.slice(0, 5).map((report, index) => (
                <div
                  key={index}
                  className="border border-slate-700 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-white font-semibold">{report.title}</h3>
                    {report.isRecommended && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {report.summary}
                  </p>
                  <div className="flex items-center gap-2">
                    {Array.isArray(report.tags) && report.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(report.dateISO).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {uploadedData.length > 5 && (
                <p className="text-sm text-slate-400 text-center">
                  Showing 5 of {uploadedData.length} reports
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Existing Reports</span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadReports}
              disabled={isLoadingExisting}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {isLoadingExisting ? 'Refreshing…' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {existingError && (
            <p className="text-sm text-red-400 mb-3">{existingError}</p>
          )}

          {isLoadingExisting ? (
            <p className="text-sm text-slate-400">Loading reports…</p>
          ) : existingReports.length === 0 ? (
            <p className="text-sm text-slate-400">
              No reports found yet. Create a new report or use the bulk upload to add articles.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left py-2 pr-4">Title</th>
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-left py-2 pr-4">Tags</th>
                    <th className="text-left py-2 pr-4">Slug</th>
                    <th className="text-right py-2 pl-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {existingReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="py-2 pr-4 text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-medium line-clamp-1">
                            {report.title}
                          </span>
                          {report.isRecommended && (
                            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-slate-400">
                        {new Date(report.dateISO).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4 text-slate-300">
                        <div className="flex flex-wrap gap-1 max-w-[260px]">
                          {report.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] bg-slate-700 text-slate-200 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-slate-400 max-w-[200px] truncate">
                        {report.slug}
                      </td>
                      <td className="py-2 pl-4 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteReport(report)}
                          className="h-8 w-8 border-red-500/70 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Report</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Report title"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Short summary shown in cards and previews"
                  rows={3}
                  className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Full article content"
                  rows={8}
                  className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="WHEAT, EU, Weather"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Publish Date</label>
                  <Input
                    type="datetime-local"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="wheat-futures-rise-eu-weather"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecommended((prev) => !prev)}
                  className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                    isRecommended
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span
                    className={`mr-2 h-3 w-3 rounded-full border ${
                      isRecommended ? 'border-amber-400 bg-amber-400' : 'border-slate-500'
                    }`}
                  />
                  Mark as recommended
                </button>
              </div>

              {createError && (
                <p className="text-sm text-red-400">{createError}</p>
              )}
            </div>

            {/* Live Preview */}
            <div className="space-y-3">
              <p className="text-sm text-slate-400">Preview</p>
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {title || 'Report title'}
                  </h2>
                  {isRecommended && (
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>
                    {dateInput
                      ? new Date(dateInput).toLocaleDateString()
                      : 'Publish date'}
                  </span>
                  <span className="truncate max-w-[200px] text-slate-500">
                    {slug || 'slug-preview'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {parsedTags.length > 0 ? (
                    parsedTags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      Tags will appear here
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 line-clamp-3">
                  {summary || 'Summary preview will appear here.'}
                </p>
                <div className="mt-2 border-t border-slate-800 pt-3 text-xs text-slate-400">
                  <p className="font-medium mb-1">Body preview:</p>
                  <div className="max-h-32 overflow-y-auto whitespace-pre-line">
                    {body || 'Full article preview will appear here.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseCreateDialog}
              disabled={isSubmitting}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitCreate}
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isSubmitting ? 'Saving…' : 'Save Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
