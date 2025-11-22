'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  dgAgriApi,
  type DGAgriMetadata,
  type DGAgriTradeType,
  type DGAgriCountryDataResponse,
} from '@/lib/api/dgAgri';
import { colorForCommodity } from '@/lib/commodityColors';
import type { DGAgriViewModel, DGAgriChartDataPoint } from '@/types/viewModels/dgAgri.types';

/**
 * ViewModel hook for DGAgriPanel
 * Manages all state, business logic, and data transformations
 */
export function useDGAgriViewModel(): DGAgriViewModel {
  // State
  const [metadata, setMetadata] = useState<DGAgriMetadata | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [commodity, setCommodityState] = useState<string | null>(null);
  const [tradeType, setTradeTypeState] = useState<DGAgriTradeType>('Export');
  const [countryData, setCountryData] = useState<DGAgriCountryDataResponse | null>(null);
  const [isMetadataLoading, setMetadataLoading] = useState(true);
  const [isDataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

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

  // Fetch country data when commodity or tradeType changes
  useEffect(() => {
    const fetchCountryData = async () => {
      if (!commodity) return;
      setDataLoading(true);
      setDataError(null);

      try {
        const response = await dgAgriApi.getCountryData({
          commodity,
          tradeType,
        });
        setCountryData(response);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load DG AGRI trade data.';
        setDataError(message);
        setCountryData(null);
      } finally {
        setDataLoading(false);
      }
    };

    fetchCountryData();
  }, [commodity, tradeType]);

  // Validate tradeType when commodity changes
  useEffect(() => {
    if (!commodity || !metadata) return;
    const selected = metadata.commodities.find((comm) => comm.id === commodity);
    if (selected && !selected.tradeTypes.includes(tradeType)) {
      setTradeTypeState(selected.tradeTypes[0]);
    }
  }, [commodity, metadata, tradeType]);

  // Computed: commodity options
  const commodityOptions = useMemo(
    () => metadata?.commodities ?? [],
    [metadata]
  );

  // Computed: chart data
  const chartData = useMemo<DGAgriChartDataPoint[]>(
    () =>
      countryData?.entries.map((entry) => ({
        country: entry.countryName ?? entry.countryCode,
        value: entry.value,
      })) ?? [],
    [countryData]
  );

  // Computed: base color for chart
  const baseColor = useMemo(
    () => colorForCommodity(commodity ?? 'WHEAT'),
    [commodity]
  );

  // Computed: Y-axis max value
  const yAxisMax = useMemo(() => {
    const maxValue = chartData.length
      ? Math.max(...chartData.map((d) => d.value))
      : 0;
    return maxValue === 0 ? 10000 : Math.ceil(maxValue / 10000) * 10000 + 40000;
  }, [chartData]);

  // Computed: can export
  const canExport = useMemo(
    () => !!countryData && chartData.length > 0,
    [countryData, chartData]
  );

  // Action: set commodity with trade type validation
  const setCommodity = useCallback(
    (newCommodity: string) => {
      setCommodityState(newCommodity);
    },
    []
  );

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

  // Action: export to CSV
  const exportToCsv = useCallback(() => {
    if (!countryData || chartData.length === 0) return;

    const csv = [
      'Country,Value (Tonnes)',
      ...chartData.map(
        (row) => `${row.country.replace(/,/g, ' ')},${row.value}`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const commoditySlug = (commodity ?? 'commodity').toLowerCase();
    const tradeSlug = tradeType.toLowerCase();
    a.download = `dg-agri-${commoditySlug}-${tradeSlug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [countryData, chartData, commodity, tradeType]);

  return {
    // State
    metadata,
    commodity,
    tradeType,
    countryData,
    isMetadataLoading,
    isDataLoading,
    metadataError,
    dataError,

    // Computed
    commodityOptions,
    chartData,
    baseColor,
    yAxisMax,
    canExport,

    // Actions
    setCommodity,
    setTradeType,
    exportToCsv,
  };
}
