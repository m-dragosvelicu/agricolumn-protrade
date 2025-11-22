'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { dailyPricesApi, type DailyPricesSeries } from '@/lib/api/dailyPrices';
import { colorForCommodity } from '@/lib/commodityColors';
import { ChartInterval } from '@/types';
import type {
  DailyPricesViewModel,
  CommodityOption,
  CandleData,
  ChartDataPoint,
  PriceChange,
} from '@/types/viewModels/dailyPrices.types';

// Constants - exported for use in View components
export const COMMODITIES: CommodityOption[] = [
  { id: 'wheatBread', name: 'Milling Wheat', currency: 'EUR' },
  { id: 'wheatFeed', name: 'Feed Wheat', currency: 'EUR' },
  { id: 'barley', name: 'Feed Barley', currency: 'EUR' },
  { id: 'corn', name: 'Corn', currency: 'EUR' },
  { id: 'sunflower', name: 'Sunflower Seeds', currency: 'USD' },
  { id: 'rapeseed', name: 'Rapeseeds', currency: 'USD' },
];

export const INTERVALS: { value: ChartInterval; label: string }[] = [
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: 'YTD', label: 'YTD' },
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
  { value: 'MAX', label: 'MAX' },
];

// Internal constants
const SERIES_ID_MAP: Record<string, string> = {
  wheatBread: 'WHEAT_BREAD',
  wheatFeed: 'WHEAT_FEED',
  barley: 'BARLEY',
  corn: 'CORN',
  sunflower: 'SUNFLOWER_SEEDS',
  rapeseed: 'RAPESEEDS',
};

const INSTRUMENT_BY_SERIES_ID: Record<string, string> = Object.entries(
  SERIES_ID_MAP
).reduce((acc, [instrument, seriesId]) => {
  acc[seriesId] = instrument;
  return acc;
}, {} as Record<string, string>);

// Pure utility functions (no side effects, easily testable)
function mapSeriesToCandles(
  series: DailyPricesSeries[]
): Record<string, CandleData[]> {
  const mapped: Record<string, CandleData[]> = {};

  series.forEach((s) => {
    const instrumentId = INSTRUMENT_BY_SERIES_ID[s.seriesId];
    if (!instrumentId) return;

    mapped[instrumentId] = [...s.points]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((point) => ({
        date: point.date,
        open: point.value,
        high: point.value,
        low: point.value,
        close: point.value,
        volume: undefined,
      }));
  });

  return mapped;
}

function filterByInterval(
  data: CandleData[],
  interval: ChartInterval
): CandleData[] {
  if (data.length === 0) return [];
  if (interval === 'MAX') return data;

  const now = new Date();
  let startDate = new Date();

  switch (interval) {
    case '1W':
      startDate.setDate(now.getDate() - 7);
      break;
    case '1M':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3M':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6M':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case 'YTD':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case '1Y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case '5Y':
      startDate.setFullYear(now.getFullYear() - 5);
      break;
    default:
      startDate.setMonth(now.getMonth() - 3);
  }

  return data.filter((d) => new Date(d.date) >= startDate);
}

function calculatePriceChange(data: ChartDataPoint[]): PriceChange {
  const sorted = data
    .filter((item) => item.price !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const current = sorted.length > 0 ? sorted[sorted.length - 1].price : 0;
  const previous = sorted.length > 1 ? sorted[sorted.length - 2].price : 0;
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

  return {
    current,
    previous,
    change,
    changePercent,
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'unchanged',
    label: change > 0 ? '▲' : change < 0 ? '▼' : '',
    colorClass:
      change > 0
        ? 'text-green-400'
        : change < 0
          ? 'text-red-400'
          : 'text-slate-400',
  };
}

/**
 * ViewModel hook for DailyPricesPanel
 * Manages all state, business logic, and data transformations
 */
export function useDailyPricesViewModel(): DailyPricesViewModel {
  // State
  const [selectedInstrument, setSelectedInstrument] = useState('wheatBread');
  const [selectedInterval, setSelectedInterval] = useState<ChartInterval>('3M');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendSeries, setBackendSeries] = useState<Record<string, CandleData[]>>({});

  // Data fetching
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try fetching latest first
      const response = await dailyPricesApi.getLatest({ limit: 365 });
      const latestMapped = mapSeriesToCandles(response);

      if (Object.keys(latestMapped).length > 0) {
        setBackendSeries(latestMapped);
        return;
      }

      // Fallback to history
      const seriesIds = Object.values(SERIES_ID_MAP);
      const results = await Promise.allSettled(
        seriesIds.map((seriesId) => dailyPricesApi.getHistory({ seriesId }))
      );

      const successfulSeries: DailyPricesSeries[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulSeries.push(result.value);
        } else {
          console.warn(
            'Failed to fetch history for series',
            seriesIds[index]
          );
        }
      });

      setBackendSeries(mapSeriesToCandles(successfulSeries));
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load daily prices from backend.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Computed: filtered chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const rawData = backendSeries[selectedInstrument] || [];
    const filtered = filterByInterval(rawData, selectedInterval);
    return filtered.map((item) => ({
      date: item.date,
      price: item.close,
      volume: item.volume,
    }));
  }, [selectedInstrument, selectedInterval, backendSeries]);

  // Computed: price change
  const priceChange = useMemo(() => calculatePriceChange(chartData), [chartData]);

  // Computed: selected commodity
  const selectedCommodity = useMemo(
    () => COMMODITIES.find((c) => c.id === selectedInstrument),
    [selectedInstrument]
  );

  // Computed: unit/currency
  const selectedUnit = useMemo(
    () => selectedCommodity?.currency || '',
    [selectedCommodity]
  );

  // Computed: chart color
  const selectedColor = useMemo(
    () => colorForCommodity(selectedInstrument),
    [selectedInstrument]
  );

  return {
    // State
    selectedInstrument,
    selectedInterval,
    chartData,
    isLoading,
    error,

    // Computed
    priceChange,
    selectedCommodity,
    selectedUnit,
    selectedColor,

    // Actions
    setSelectedInstrument,
    setSelectedInterval,
    refresh: fetchData,
  };
}
