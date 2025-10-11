'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/admin/FileUpload';
import { Download, Upload, Table as TableIcon, Plus } from 'lucide-react';
import { downloadCSV, generateTemplate, parseCSV, validateCSVData, type CSVColumn } from '@/lib/csvUtils';

const reportsColumns: CSVColumn[] = [
  { key: 'title', label: 'Title', example: 'Wheat Futures Rise on EU Weather Concerns', required: true },
  { key: 'summary', label: 'Summary', example: 'European wheat futures climbed 2.5%...', required: true },
  { key: 'body', label: 'Body', example: 'Extended body content here...', required: true },
  { key: 'dateISO', label: 'Date (ISO)', example: '2024-03-15T09:00:00Z', required: true },
  { key: 'tags', label: 'Tags (comma-separated)', example: 'Wheat,EU,Weather', required: true },
  { key: 'slug', label: 'Slug', example: 'wheat-futures-rise-eu-weather', required: true },
  { key: 'isRecommended', label: 'Is Recommended', example: 'true', required: false },
];

export default function ReportsAdmin() {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadTemplate = () => {
    const template = generateTemplate(reportsColumns);
    downloadCSV(template, 'commodity-reports-template.csv');
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const text = await file.text();
      const data = parseCSV(text, reportsColumns);

      // Transform tags from comma-separated string to array
      const transformedData = data.map(row => ({
        ...row,
        tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
        isRecommended: row.isRecommended === 'true'
      }));

      const validation = validateCSVData(transformedData, reportsColumns);

      if (!validation.isValid) {
        setErrors(validation.errors);
        setUploadedData([]);
      } else {
        setUploadedData(transformedData);
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
    alert(`Successfully imported ${uploadedData.length} reports!`);
    setUploadedData([]);
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
        <Button className="bg-amber-500 hover:bg-amber-600">
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
            Download the commodity reports CSV template. Include title, summary, full body content,
            date (ISO format), tags (comma-separated), slug, and recommendation status.
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
            Bulk Upload Reports
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
    </div>
  );
}
