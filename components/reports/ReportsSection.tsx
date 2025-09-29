'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Search, Filter, Clock, Eye, Star } from 'lucide-react';
import { mockReports } from '@/lib/mockData';
import { Report } from '@/types';
import { cn } from '@/lib/utils';

interface ReportsSectionProps {
  className?: string;
}

export function ReportsSection({ className }: ReportsSectionProps) {
  const [reports] = useState<Report[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const allTags = Array.from(new Set(reports.flatMap(r => r.tags)));
  
  const filteredReports = reports
    .filter(report => 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(report => 
      selectedTags.length === 0 || 
      selectedTags.some(tag => report.tags.includes(tag))
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
      }
      return 0; // For 'popular' we'd need view counts
    });

  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO);
    return date.toLocaleDateString();
  };

  const featuredReports = reports.filter(r => r.isRecommended).slice(0, 3);
  const commodityTypes = ['WHEAT', 'CORN', 'SOYBEAN'];
  
  return (
    <div className={cn("", className)}>
      {/* Simple Reports Grid matching agricolumn-protrade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {commodityTypes.map((commodity) => {
          const report = featuredReports.find(r => r.tags.includes(commodity)) || featuredReports[0];
          return (
            <Card key={commodity} className="bg-slate-800/50 border border-slate-700/50 rounded-lg shadow-lg overflow-hidden h-64 flex flex-col">
              <CardHeader className="border-b border-slate-700/50 pb-3">
                <h3 className="text-white font-bold text-lg tracking-wide">{commodity}</h3>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col flex-1">
                <p className="text-slate-400 text-sm mb-4 h-24 line-clamp-6">
                  {report?.summary || `Sample report content for ${commodity}. The quick brown fox jumps over the lazy dog. This text is a placeholder and will be replaced with actual report data.`}
                </p>
                <div className="flex justify-end mt-auto">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="text-yellow-500 hover:text-yellow-400 text-sm font-semibold transition-colors"
                        onClick={() => setSelectedReport(report)}
                      >
                        Read more
                      </button>
                    </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl">{selectedReport?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {selectedReport && formatDate(selectedReport.dateISO)}
                        </div>
                        <div className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          245
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {selectedReport?.tags.map(tag => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {selectedReport?.summary}
                        </p>
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <p className="text-sm">
                            This is where the full article content would be displayed.
                            In a real implementation, this would contain the complete
                            market analysis, charts, and detailed insights.
                          </p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}