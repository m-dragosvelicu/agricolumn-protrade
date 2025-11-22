'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  dgAgriApi,
  type DGAgriMetadata,
  type DGAgriTradeType,
  type DGAgriWeeklySummaryResponse,
} from '@/lib/api/dgAgri';
import { colorForCommodity } from '@/lib/commodityColors';
import type { EUWeeklyTradeViewModel, EUWeeklyTradeChartDataPoint } from '@/types/viewModels/euWeeklyTrade.types';

// Helper functions
const withAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const calculatePercentChange = (current: number | null, previous: number | null): number => {
  if (current === null || previous === null || previous === 0) {
    return 0;
  }
  return ((current - previous) / previous) * 100;
};

/**
 * ViewModel hook for EUWeeklyTradePanel
 * Manages all state, business logic, and data transformations
 */
export function useEUWeeklyTradeViewModel(): EUWeeklyTradeViewModel {
  // State
  const [metadata, setMetadata] = useState<DGAgriMetadata | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [commodity, setCommodityState] = useState<string | null>(null);
  const [tradeType, setTradeTypeState] = useState<DGAgriTradeType>('Export');
  const [summary, setSummary] = useState<DGAgriWeeklySummaryResponse | null>(null);
  const [isMetadataLoading, setMetadataLoading] = useState(true);
  const [isSummaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Fetch metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      setMetadataLoading(true);
      setMetadataError(null);
      try {
        const response = await dgAgriApi.getMetadata();
        setMetadata(response);
        if (response.commodities.length > 0) {
          const defaultCommodity = response.commodities[0];
          setCommodityState(defaultCommodity.id);
          if (defaultCommodity.tradeTypes.includes('Export')) {
            setTradeTypeState('Export');
          } else {
            setTradeTypeState(defaultCommodity.tradeTypes[0]);
          }
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load DG AGRI metadata.';
        setMetadataError(message);
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  // Validate tradeType when commodity changes
  useEffect(() => {
    if (!commodity || !metadata) return;
    const selected = metadata.commodities.find((comm) => comm.id === commodity);
    if (selected && !selected.tradeTypes.includes(tradeType)) {
      setTradeTypeState(selected.tradeTypes[0]);
    }
  }, [commodity, metadata, tradeType]);

  // Fetch summary data when commodity or tradeType changes
  useEffect(() => {
    const fetchSummary = async () => {
      if (!commodity) return;
      setSummaryLoading(true);
      setSummaryError(null);

      try {
        const response = await dgAgriApi.getWeeklySummary({
          commodity,
          tradeType,
        });
        setSummary(response);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load DG AGRI weekly summary.';
        setSummaryError(message);
        setSummary(null);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [commodity, tradeType]);

  // Computed: commodity options
  const commodityOptions = useMemo(
    () => metadata?.commodities ?? [],
    [metadata]
  );

  // Computed: base color for chart
  const baseColor = useMemo(
    () => colorForCommodity(commodity ?? 'WHEAT'),
    [commodity]
  );

  // Computed: last year color (with alpha)
  const lastYearColor = useMemo(
    () => withAlpha(baseColor, 0.45),
    [baseColor]
  );

  // Computed: chart data
  const chartData = useMemo<EUWeeklyTradeChartDataPoint[]>(() => {
    if (!summary || summary.thisYearVolume === null) {
      return [];
    }

    const data: EUWeeklyTradeChartDataPoint[] = [
      {
        category: summary.marketingYear ?? 'This Year',
        value: summary.thisYearVolume ?? 0,
        label: 'This Year',
        fill: baseColor,
      },
    ];

    if (summary.lastYearVolume !== null) {
      data.push({
        category:
          summary.previousMarketingYear ??
          (summary.marketingYear
            ? `${summary.marketingYear} (prev)`
            : 'Last Year'),
        value: summary.lastYearVolume ?? 0,
        label: 'Last Year',
        fill: lastYearColor,
      });
    }

    return data;
  }, [summary, baseColor, lastYearColor]);

  // Computed: X-axis max value
  const xAxisMax = useMemo(() => {
    const maxValue = chartData.length
      ? Math.max(...chartData.map((item) => item.value))
      : 0;
    if (maxValue === 0) {
      return 40000;
    }

    const padding = Math.max(40000, maxValue * 0.25);
    const rawMax = maxValue + padding;
    const roundedMax = Math.ceil(rawMax / 10000) * 10000;
    return roundedMax;
  }, [chartData]);

  // Computed: percent change year-over-year
  const percentChange = useMemo(
    () => calculatePercentChange(
      summary?.thisYearVolume ?? null,
      summary?.lastYearVolume ?? null
    ),
    [summary]
  );

  // Action: set commodity
  const setCommodity = useCallback((newCommodity: string) => {
    setCommodityState(newCommodity);
  }, []);

  // Action: set trade type with commodity fallback
  const setTradeType = useCallback(
    (newTradeType: DGAgriTradeType) => {
      setTradeTypeState(newTradeType);
      const currentCommodity = commodityOptions.find((comm) => comm.id === commodity);
      if (!currentCommodity || !currentCommodity.tradeTypes.includes(newTradeType)) {
        const fallback = commodityOptions.find((comm) =>
          comm.tradeTypes.includes(newTradeType)
        );
        if (fallback) {
          setCommodityState(fallback.id);
        }
      }
    },
    [commodityOptions, commodity]
  );

  return {
    // State
    metadata,
    commodity,
    tradeType,
    summary,
    isMetadataLoading,
    isSummaryLoading,
    metadataError,
    summaryError,

    // Computed
    commodityOptions,
    chartData,
    baseColor,
    lastYearColor,
    xAxisMax,
    percentChange,

    // Actions
    setCommodity,
    setTradeType,
  };
}
