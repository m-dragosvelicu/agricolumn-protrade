'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockReports } from '@/lib/mockData';
import { Report } from '@/types';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';

interface ReportsSectionProps {
  className?: string;
}

export function ReportsSection({ className }: ReportsSectionProps) {
  const [reports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 }
    }
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

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

  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO);
    return date.toLocaleDateString();
  };

  const featuredReports = reports.filter(r => r.isRecommended).slice(0, 6);
  const commodityTypes = ['WHEAT', 'CORN', 'BARLEY', 'RAPESEEDS', 'SUNFLOWER SEEDS', 'SOY COMPLEX'];

  return (
    <div className={cn("", className)}>
      {/* Scrollable Carousel for Commodity Reports */}
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
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {commodityTypes.map((commodity) => {
              const report = featuredReports.find(r => r.tags.includes(commodity)) || featuredReports[0];
              return (
                <div key={commodity} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]">
                  <Card className="bg-slate-800/50 border border-slate-700/50 rounded-lg shadow-lg overflow-hidden h-64 flex flex-col">
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
}