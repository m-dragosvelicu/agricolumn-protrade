'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { cotCftcApi, type CotCftcPair, type Exchange, type Commodity } from '@/lib/api/cotCftc';
import { colorForCommodity } from '@/lib/commodityColors';
import { calculateYAxisRange } from '@/lib/chartUtils';
import type {
  COTViewModel,
  CotCommodityOption,
  CotDataPoint,
} from '@/types/viewModels/cot.types';

// Constants - exported for use in View components
export const COT_COMMODITIES: CotCommodityOption[] = [
  { value: 'CBOT Wheat', label: 'CFTC CME WHEAT', exchange: 'CBOT' as Exchange, commodity: 'WHEAT' as Commodity },
  { value: 'CBOT Corn', label: 'CFTC CME CORN', exchange: 'CBOT' as Exchange, commodity: 'CORN' as Commodity },
  { value: 'CBOT Soybean', label: 'CFTC CME SOYBEANS', exchange: 'CBOT' as Exchange, commodity: 'SOY' as Commodity },
  { value: 'CBOT Soy Oil', label: 'CFTC CME SOY OIL', exchange: 'CBOT' as Exchange, commodity: 'SOY' as Commodity },
  { value: 'Euronext Wheat', label: 'COT EUR WHEAT', exchange: 'EURONEXT' as Exchange, commodity: 'WHEAT' as Commodity },
  { value: 'Euronext Corn', label: 'COT EUR CORN', exchange: 'EURONEXT' as Exchange, commodity: 'CORN' as Commodity },
  { value: 'Euronext RPS', label: 'COT EUR RPS', exchange: 'EURONEXT' as Exchange, commodity: 'RPS' as Commodity },
];

// Pure utility functions
function mapPairsToSeries(pairs: CotCftcPair[]): Record<string, CotDataPoint[]> {
  const transformedData: Record<string, CotDataPoint[]> = {};

  pairs.forEach((pair) => {
    const commodityConfig = COT_COMMODITIES.find(
      (c) => c.exchange === pair.exchange && c.commodity === pair.commodity
    );

    if (commodityConfig) {
      transformedData[commodityConfig.value] = pair.positions.map((pos) => ({
        date: pos.date,
        price: pos.value,
      }));
    }
  });

  return transformedData;
}

/**
 * ViewModel hook for COTPanel
 * Manages all state, business logic, and data transformations
 */
export function useCOTViewModel(): COTViewModel {
  // State
  const [selectedCommodity, setSelectedCommodity] = useState('CBOT Wheat');
  const [cotData, setCotData] = useState<Record<string, CotDataPoint[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data fetching
  const fetchFromLatest = useCallback(async () => {
    const response = await cotCftcApi.getLatest({ limit: 7 });
    return mapPairsToSeries(response);
  }, []);

  const fetchFromHistory = useCallback(async () => {
    const results = await Promise.allSettled(
      COT_COMMODITIES.map((commodity) =>
        cotCftcApi.getHistory({
          exchange: commodity.exchange,
          commodity: commodity.commodity,
        })
      )
    );

    const pairs: CotCftcPair[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        pairs.push(result.value);
      } else {
        console.warn(
          'Failed to fetch COT history for',
          COT_COMMODITIES[index].exchange,
          COT_COMMODITIES[index].commodity
        );
      }
    });

    return mapPairsToSeries(pairs);
  }, []);

  const loadCotData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const latestData = await fetchFromLatest();

      if (Object.keys(latestData).length > 0) {
        setCotData(latestData);
        return;
      }

      const historyData = await fetchFromHistory();
      setCotData(historyData);
    } catch (err: any) {
      console.error('Failed to load COT data:', err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load COT data from backend.';
      setError(message);
      setCotData({});
    } finally {
      setIsLoading(false);
    }
  }, [fetchFromLatest, fetchFromHistory]);

  // Initial fetch
  useEffect(() => {
    loadCotData();
  }, [loadCotData]);

  // Computed: current commodity data
  const data = useMemo(() => cotData[selectedCommodity] || [], [cotData, selectedCommodity]);

  // Computed: line color
  const lineColor = useMemo(
    () => colorForCommodity(selectedCommodity),
    [selectedCommodity]
  );

  // Computed: Y-axis domain with 5% padding
  const yAxisDomain = useMemo<[number, number]>(() => {
    const range = calculateYAxisRange(data, 'price', 0.05);
    return [range.min, range.max];
  }, [data]);

  // Action: export to CSV
  const exportToCsv = useCallback(() => {
    const csv = [
      'Date,Price',
      ...data.map((row) => `${row.date},${row.price}`),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCommodity.toLowerCase().replace(' ', '-')}-positions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, selectedCommodity]);

  return {
    // State
    selectedCommodity,
    data,
    isLoading,
    error,

    // Computed
    lineColor,
    yAxisDomain,

    // Actions
    setSelectedCommodity,
    refresh: loadCotData,
    exportToCsv,
  };
}
