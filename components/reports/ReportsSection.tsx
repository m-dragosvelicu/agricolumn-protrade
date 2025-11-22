"use client";

import { Clock, Eye } from "lucide-react";
import React, { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useReportsViewModel } from "@/hooks/viewModels";
import { cn } from "@/lib/utils";
import { Report } from "@/types";

interface ReportsSectionProps {
  className?: string;
}

/**
 * ReportsSection - View Component
 * Pure presentational component that renders UI based on ViewModel state
 */
export function ReportsSection({ className }: ReportsSectionProps) {
  const vm = useReportsViewModel();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, scrollLeft: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    dragState.current = {
      startX: e.pageX,
      scrollLeft: el.scrollLeft,
    };
    setIsDragging(true);
    document.body.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const el = trackRef.current;
    const walk = (e.pageX - dragState.current.startX) * 1.5;
    el.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const endDrag = () => {
    setIsDragging(false);
    document.body.style.cursor = "default";
  };

  return (
    <div className={cn("", className)}>
      {/* Loading State */}
      {vm.isLoading && (
        <p className="text-sm text-slate-400 mb-4">Loading reports...</p>
      )}

      {/* Error State */}
      {!vm.isLoading && vm.error && (
        <p className="text-sm text-red-400 mb-4">{vm.error}</p>
      )}

      {/* Empty State */}
      {!vm.isLoading && !vm.error && vm.reports.length === 0 && (
        <p className="text-sm text-slate-400 mb-4">
          No reports available yet. New articles will appear here once
          published.
        </p>
      )}

      {/* Infinite Scrolling Marquee for Commodity Reports */}
      {vm.featuredReports.length > 0 && (
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0f172a] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0f172a] to-transparent z-10 pointer-events-none" />

          {/* Viewport with drag support */}
          <div
            ref={trackRef}
            className="overflow-x-hidden select-none cursor-grab"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
          >
            {/* Moving strip - cards rendered twice for seamless loop */}
            <div className="marquee-row">
              {/* First set of cards */}
              {vm.featuredReports.map((report) => (
                <div key={`first-${report.id}`} className="marquee-item">
                  <ReportCard
                    report={report}
                    formatDate={vm.formatDate}
                    selectedReport={vm.selectedReport}
                    onSelectReport={vm.setSelectedReport}
                  />
                </div>
              ))}
              {/* Second set of cards (duplicate for seamless loop) */}
              {vm.featuredReports.map((report) => (
                <div key={`second-${report.id}`} className="marquee-item">
                  <ReportCard
                    report={report}
                    formatDate={vm.formatDate}
                    selectedReport={vm.selectedReport}
                    onSelectReport={vm.setSelectedReport}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components (pure presentational) ---

interface ReportCardProps {
  report: Report;
  formatDate: (dateISO: string) => string;
  selectedReport: Report | null;
  onSelectReport: (report: Report | null) => void;
}

function ReportCard({
  report,
  formatDate,
  selectedReport,
  onSelectReport,
}: ReportCardProps) {
  return (
    <div>
      <Card className="bg-slate-800/50 border border-slate-700/50 rounded-lg shadow-lg overflow-hidden h-64 flex flex-col">
        <CardHeader className="border-b border-slate-700/50 pb-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-white font-bold text-lg tracking-wide line-clamp-1">
              {report.title}
            </h3>
            {report.isNew && (
              <span className="text-[10px] uppercase tracking-wide bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {formatDate(report.dateISO)}
          </p>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col flex-1">
          <p className="text-slate-400 text-sm mb-4 line-clamp-4">
            {report.summary}
          </p>
          <div className="mt-auto flex justify-between items-center">
            <div className="flex flex-wrap gap-1 max-w-[60%]">
              {report.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] px-2 py-0"
                >
                  {tag}
                </Badge>
              ))}
              {report.tags.length > 3 && (
                <span className="text-[10px] text-slate-500">
                  +{report.tags.length - 3} more
                </span>
              )}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="text-yellow-500 hover:text-yellow-400 text-sm font-semibold transition-colors"
                  onClick={() => onSelectReport(report)}
                >
                  Read more
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {selectedReport?.title}
                  </DialogTitle>
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
                    {selectedReport?.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {selectedReport?.body}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
