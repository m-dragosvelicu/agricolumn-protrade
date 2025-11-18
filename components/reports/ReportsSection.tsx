"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { reportsApi } from '@/lib/api/reports';
import { Report } from '@/types';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';

interface ReportsSectionProps {
  className?: string;
}

const AUTOPLAY_DURATION_MS = 7000;

export function ReportsSection({ className }: ReportsSectionProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const isHoveredRef = useRef(false);
  const isAutoplayingRef = useRef(false);

  // Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    duration: AUTOPLAY_DURATION_MS,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 }
    }
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const pauseAutoplay = useCallback(() => {
    isAutoplayingRef.current = false;
  }, []);

  const resumeAutoplay = useCallback(
    (triggerImmediate: boolean) => {
      if (!emblaApi || isHoveredRef.current) return;
      isAutoplayingRef.current = true;

      if (triggerImmediate && emblaApi.internalEngine().scrollBody.settled()) {
        window.requestAnimationFrame(() => {
          if (!isAutoplayingRef.current || isHoveredRef.current) return;
          emblaApi.scrollNext();
        });
      }
    },
    [emblaApi]
  );

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    pauseAutoplay();
    emblaApi.scrollPrev();
    resumeAutoplay(false);
  }, [emblaApi, pauseAutoplay, resumeAutoplay]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    pauseAutoplay();
    emblaApi.scrollNext();
    resumeAutoplay(false);
  }, [emblaApi, pauseAutoplay, resumeAutoplay]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const now = new Date();

        // Compute current week range: Monday 00:00 to Sunday 23:59 (local time)
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay(); // 0 (Sun) - 6 (Sat)
        const diffToMonday = (day + 6) % 7; // days since Monday
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const from = startOfWeek.toISOString();
        const to = endOfWeek.toISOString();

        // Fetch only reports within the current week (inclusive)
        const latest = await reportsApi.getLatest({ limit: 24, from, to });

        // Filter out reports scheduled in the future (dateISO > now)
        const visible = (latest || []).filter((report) => {
          const publishedAt = new Date(report.dateISO);
          return publishedAt.getTime() <= now.getTime();
        });

        setReports(visible);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load reports.';
        setError(message);
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;

    const handlePointerDown = () => pauseAutoplay();
    const handlePointerUp = () => resumeAutoplay(false);
    const handleSettle = () => {
      if (!isAutoplayingRef.current || isHoveredRef.current) return;
      emblaApi.scrollNext();
    };
    const handleReInit = () => resumeAutoplay(true);

    resumeAutoplay(true);

    emblaApi.on('pointerDown', handlePointerDown);
    emblaApi.on('pointerUp', handlePointerUp);
    emblaApi.on('settle', handleSettle);
    emblaApi.on('reInit', handleReInit);

    return () => {
      pauseAutoplay();
      emblaApi.off('pointerDown', handlePointerDown);
      emblaApi.off('pointerUp', handlePointerUp);
      emblaApi.off('settle', handleSettle);
      emblaApi.off('reInit', handleReInit);
    };
  }, [emblaApi, pauseAutoplay, resumeAutoplay]);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    pauseAutoplay();
  }, [pauseAutoplay]);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    resumeAutoplay(true);
  }, [resumeAutoplay]);

  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO);
    return date.toLocaleDateString();
  };

  const recommendedReports = reports.filter((r) => r.isRecommended);
  const nonRecommendedReports = reports.filter((r) => !r.isRecommended);
  // Show recommended reports first, then fill with non-recommended, up to 12 cards
  const featuredReports = [...recommendedReports, ...nonRecommendedReports].slice(0, 12);

  return (
    <div className={cn("", className)}>
      {isLoading && (
        <p className="text-sm text-slate-400 mb-4">Loading reports…</p>
      )}
      {!isLoading && error && (
        <p className="text-sm text-red-400 mb-4">{error}</p>
      )}
      {!isLoading && !error && reports.length === 0 && (
        <p className="text-sm text-slate-400 mb-4">
          No reports available yet. New articles will appear here once published.
        </p>
      )}

      {/* Scrollable Carousel for Commodity Reports */}
      {reports.length > 0 && (
      <div className="relative">
        {/* Navigation Buttons */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(
              "h-8 w-8 rounded-full border-slate-700/50 bg-slate-800/50 transition-all duration-200",
              canScrollPrev
                ? "hover:bg-amber-500 hover:border-amber-500"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-colors",
              canScrollPrev ? "text-white" : "text-slate-500"
            )} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(
              "h-8 w-8 rounded-full border-slate-700/50 bg-slate-800/50 transition-all duration-200",
              canScrollNext
                ? "hover:bg-amber-500 hover:border-amber-500"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronRight className={cn(
              "h-4 w-4 transition-colors",
              canScrollNext ? "text-white" : "text-slate-500"
            )} />
          </Button>
        </div>

        {/* Carousel Container */}
        <div
          className="overflow-hidden"
          ref={emblaRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex -ml-6">
            {featuredReports.map((report) => (
              <div
                key={report.id}
                className="pl-6 flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-1.5rem)] lg:flex-[0_0_calc(33.333%-1.5rem)]"
              >
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
                          <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0">
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
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
