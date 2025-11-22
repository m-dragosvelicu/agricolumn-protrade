'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { vesselsApi, Vessel } from '@/lib/api/vessels';
import { parseDepartureLocation } from '@/lib/countryMappings';
import type { VesselData } from '@/types';
import type {
  ConstantaPortViewModel,
  SortField,
  SortDirection,
  ColumnConfig,
  FilterMetadata,
  ConstantaPortChartDataPoint,
} from '@/types/viewModels/constantaPort.types';

// Fixed commodity order for tabs
export const COMMODITY_ORDER = [
  { key: 'WHEAT', label: 'WHEAT', dataValues: ['Wheat'] },
  { key: 'CORN', label: 'CORN', dataValues: ['Corn'] },
  { key: 'BARLEY', label: 'BARLEY', dataValues: ['Barley'] },
  { key: 'RPS', label: 'RPS', dataValues: ['Rapeseed', 'Rapeseeds'] },
  { key: 'SFS', label: 'SFS', dataValues: ['Sunflower Seeds'] },
  {
    key: 'RPS_MEAL',
    label: 'RPS MEAL',
    dataValues: ['Rapeseed Meal', 'Rapeseeds meal', 'Rapeseeds Meal'],
  },
  {
    key: 'SFS_MEAL',
    label: 'SFS MEAL',
    dataValues: ['Sunflower Meal', 'Sunflower seeds meal', 'Sunflower Seeds Meal'],
  },
  {
    key: 'RPS_OIL',
    label: 'RPS OIL',
    dataValues: ['Rapeseed Oil', 'Rapeseeds Oil'],
  },
  {
    key: 'SFS_OIL',
    label: 'SFS OIL',
    dataValues: ['Sunflower Oil', 'Sunflower seeds oil', 'Sunflower Seeds Oil'],
  },
];

export const STATUS_ORDER = [
  'ETA',
  'Awaiting Berth',
  'Loading',
  'Loading/Discharging',
  'Loaded',
  'Sailed',
  'In Transit',
  'Discharged',
  'Completed',
];

// Helper functions
const normalizeCommodityForFilter = (description: string): string => {
  if (!description) return description;

  if (/SUNFLOWER\s*SEEDS?\s*MEAL/i.test(description)) return 'SFS MEAL';
  if (/SUNFLOWER\s*SEEDS?\s*OIL/i.test(description)) return 'SFS OIL';
  if (/SUNFLOWER\s*SEEDS?/i.test(description) && !/MEAL|OIL/i.test(description)) return 'SFS';
  if (/(CANOLA|RAPESEED)\s*MEAL/i.test(description)) return 'RPS MEAL';
  if (/(CANOLA|RAPESEED)\s*OIL/i.test(description)) return 'RPS OIL';
  if (/(CANOLA|RAPESEED)/i.test(description) && !/MEAL|OIL/i.test(description)) return 'RPS';
  if (/CORN|MAIZE/i.test(description)) return 'CORN';

  return String(description).trim();
};

const getCommodityFilterValues = (selectedCommodity: string): string[] => {
  if (selectedCommodity === 'all') return [];

  let commodityConfig = COMMODITY_ORDER.find((c) => c.key === selectedCommodity);
  if (!commodityConfig) {
    commodityConfig = COMMODITY_ORDER.find((c) =>
      c.dataValues.some((v) => v.toLowerCase() === selectedCommodity.toLowerCase())
    );
  }

  if (!commodityConfig) {
    return [normalizeCommodityForFilter(selectedCommodity)];
  }

  const normalized = commodityConfig.dataValues.map((v) => normalizeCommodityForFilter(v));
  return [...new Set([...commodityConfig.dataValues, ...normalized])];
};

const mapSortField = (field: SortField): string => {
  const mapping: Record<string, string> = {
    vessel_name: 'vesselName',
    operation_completed: 'operationCompleted',
    operation_commenced: 'operationCommenced',
    commodity_description: 'commodityDescription',
    destination_country: 'destinationCountry',
    departure_location: 'departureLocation',
    departure_terminal: 'departureTerminal',
    operation_type: 'operationType',
    quantity: 'quantity',
    status: 'status',
  };
  return mapping[field] || 'operationCommenced';
};

const transformVesselToVesselData = (vessel: Vessel, index: number): VesselData => {
  let quantity: number | null = null;
  if (vessel.quantity !== null && vessel.quantity !== undefined) {
    if (typeof vessel.quantity === 'string') {
      const parsed = parseFloat(vessel.quantity);
      quantity = isNaN(parsed) ? null : parsed;
    } else if (typeof vessel.quantity === 'number') {
      quantity = vessel.quantity;
    }
  }

  return {
    id: index,
    vessel_name: vessel.vesselName,
    status: vessel.status,
    departure_location: vessel.departureLocation,
    departure_terminal: vessel.departureTerminal || '',
    destination_country: vessel.destinationCountry || '',
    operation_type: vessel.operationType,
    operation_completed: vessel.operationCompleted || '',
    commodity_description: vessel.commodityDescription,
    quantity: quantity ?? 0,
    shipper: vessel.shipper || '',
    cargo_origin_1: vessel.cargoOrigin1 || '',
    cargo_origin_2: vessel.cargoOrigin2 || '',
  };
};

const defaultColumns: ColumnConfig[] = [
  { key: 'commodity_description' as SortField, label: 'Commodity', visible: true },
  { key: 'quantity' as SortField, label: 'Quantity (mt)', visible: true },
  { key: 'shipper' as SortField, label: 'Shipper', visible: true },
  { key: 'destination_country' as SortField, label: 'Destination Country', visible: true },
  {
    key: 'departure_location' as SortField,
    label: 'Departure Location',
    visible: true,
    customRender: (row: VesselData) => {
      const parsed = parseDepartureLocation(row.departure_location);
      return parsed ? `${parsed.countryCode}-${parsed.port}` : '—';
    },
  },
  { key: 'departure_terminal' as SortField, label: 'Departure Terminal', visible: true },
  { key: 'vessel_name' as SortField, label: 'Vessel Name', visible: true },
  { key: 'status' as SortField, label: 'Status', visible: true },
];

/**
 * ViewModel hook for ConstantaPortPanel
 * Manages all state, business logic, and data transformations
 */
export function useConstantaPortViewModel(): ConstantaPortViewModel {
  // Data state
  const [data, setData] = useState<VesselData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Table state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('operation_completed');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [visibleColumns, setVisibleColumns] = useState(
    defaultColumns.reduce(
      (acc, col) => ({ ...acc, [col.key]: col.visible }),
      {} as Record<string, boolean>
    )
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [commodityFilter, setCommodityFilter] = useState('all');
  const [operationTypeFilter, setOperationTypeFilter] = useState('all');
  const [quantityFilter, setQuantityFilter] = useState('all');
  const [shipperFilter, setShipperFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [vesselNameFilter, setVesselNameFilter] = useState('all');
  const [terminalFilter, setTerminalFilter] = useState('all');
  const [operationStatusFilter, setOperationStatusFilter] = useState<string[]>([]);

  // Chart state
  const [selectedChartCommodity, setSelectedChartCommodity] = useState('WHEAT');
  const [selectedDestinationCountries, setSelectedDestinationCountries] = useState<string[]>([]);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [chartData, setChartData] = useState<ConstantaPortChartDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [uniqueDestinations, setUniqueDestinations] = useState<string[]>([]);

  // UI state
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Metadata
  const [filterMetadata, setFilterMetadata] = useState<FilterMetadata | null>(null);

  // Refs
  const chartScrollRef = useRef<HTMLDivElement>(null);

  // Handle responsive sizing
  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams: any = {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          sortBy: mapSortField(sortField),
          sortOrder: sortDirection.toUpperCase() as 'ASC' | 'DESC',
        };

        if (searchTerm) queryParams.search = searchTerm;

        if (commodityFilter !== 'all') {
          const commodityValues = getCommodityFilterValues(commodityFilter);
          if (commodityValues.length > 0) {
            queryParams.commodityDescriptions = commodityValues;
          }
        }
        if (operationTypeFilter !== 'all') queryParams.operationType = operationTypeFilter;
        if (shipperFilter !== 'all') queryParams.shipper = shipperFilter;
        if (destinationFilter !== 'all') queryParams.destinationCountry = destinationFilter;
        if (vesselNameFilter !== 'all') queryParams.vesselName = vesselNameFilter;
        if (terminalFilter !== 'all') queryParams.departureTerminal = terminalFilter;
        if (operationStatusFilter.length > 0) queryParams.statuses = operationStatusFilter;

        if (quantityFilter !== 'all') {
          if (quantityFilter === '<5000') queryParams.maxQuantity = 4999;
          else if (quantityFilter === '5000-10000') {
            queryParams.minQuantity = 5000;
            queryParams.maxQuantity = 10000;
          } else if (quantityFilter === '>10000') queryParams.minQuantity = 10001;
        }

        const response = await vesselsApi.getVessels(queryParams);
        const transformedData = response.data.map((vessel, index) =>
          transformVesselToVesselData(vessel, index)
        );

        setData(transformedData);
        setTotalCount(response.total);
      } catch (err: any) {
        console.error('Failed to fetch vessels:', err);
        setError(err.response?.data?.message || 'Failed to load vessel data');
        setData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    currentPage,
    pageSize,
    searchTerm,
    sortField,
    sortDirection,
    commodityFilter,
    operationTypeFilter,
    quantityFilter,
    shipperFilter,
    destinationFilter,
    vesselNameFilter,
    terminalFilter,
    operationStatusFilter,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    commodityFilter,
    operationTypeFilter,
    quantityFilter,
    shipperFilter,
    destinationFilter,
    vesselNameFilter,
    terminalFilter,
    operationStatusFilter,
  ]);

  // Fetch filter metadata
  useEffect(() => {
    const fetchFilterMetadata = async () => {
      try {
        const metadata = await vesselsApi.getFilterMetadata();
        setFilterMetadata(metadata);
        setUniqueDestinations(metadata.destinationCountries);
        setSelectedDestinationCountries((prev) => {
          if (prev.length === 0 && metadata.destinationCountries.length > 0) {
            return metadata.destinationCountries;
          }
          return prev;
        });
      } catch (err) {
        console.error('Failed to fetch filter metadata:', err);
        try {
          const destinations = await vesselsApi.getUniqueDestinations();
          setUniqueDestinations(destinations);
          setSelectedDestinationCountries((prev) => {
            if (prev.length === 0 && destinations.length > 0) {
              return destinations;
            }
            return prev;
          });
        } catch (destErr) {
          console.error('Failed to fetch unique destinations:', destErr);
        }
      }
    };
    fetchFilterMetadata();
  }, []);

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        const commodityConfig = COMMODITY_ORDER.find((c) => c.key === selectedChartCommodity);
        if (!commodityConfig) {
          setChartData([]);
          return;
        }

        const commodityValues = getCommodityFilterValues(commodityConfig.dataValues[0]);
        const destinationCountries =
          selectedDestinationCountries.length === 0 ||
          selectedDestinationCountries.length === uniqueDestinations.length
            ? undefined
            : selectedDestinationCountries;

        const response = await vesselsApi.getChartData({
          commodity: commodityValues[0],
          commodityDescriptions: commodityValues.length > 1 ? commodityValues : undefined,
          destinationCountries,
          operationType: 'Export',
        });

        setChartData(response.data);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, [selectedChartCommodity, selectedDestinationCountries, uniqueDestinations.length]);

  // Computed values
  const paginatedData = data;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);

  // Clamp current page if total pages shrink
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const statusOptions = useMemo(() => {
    const uniqueStatuses = new Set<string>();
    data.forEach((row) => {
      if (row.status) uniqueStatuses.add(row.status);
    });
    operationStatusFilter.forEach((status) => uniqueStatuses.add(status));

    const orderLookup = new Map(STATUS_ORDER.map((status, index) => [status.toLowerCase(), index]));

    return Array.from(uniqueStatuses).sort((a, b) => {
      const orderA = orderLookup.get(a.toLowerCase()) ?? STATUS_ORDER.length;
      const orderB = orderLookup.get(b.toLowerCase()) ?? STATUS_ORDER.length;
      if (orderA === orderB) return a.localeCompare(b);
      return orderA - orderB;
    });
  }, [data, operationStatusFilter]);

  const activeFiltersCount = useMemo(
    () =>
      (commodityFilter !== 'all' ? 1 : 0) +
      (operationTypeFilter !== 'all' ? 1 : 0) +
      (quantityFilter !== 'all' ? 1 : 0) +
      (shipperFilter !== 'all' ? 1 : 0) +
      (destinationFilter !== 'all' ? 1 : 0) +
      (vesselNameFilter !== 'all' ? 1 : 0) +
      (terminalFilter !== 'all' ? 1 : 0) +
      (operationStatusFilter.length > 0 ? 1 : 0),
    [
      commodityFilter,
      operationTypeFilter,
      quantityFilter,
      shipperFilter,
      destinationFilter,
      vesselNameFilter,
      terminalFilter,
      operationStatusFilter,
    ]
  );

  const filteredCountries = useMemo(() => {
    if (!countrySearchTerm) return uniqueDestinations;
    return uniqueDestinations.filter((country) =>
      country.toLowerCase().includes(countrySearchTerm.toLowerCase())
    );
  }, [uniqueDestinations, countrySearchTerm]);

  const chartMinWidth = useMemo(() => {
    const minBarWidth = isMobile ? 80 : 70;
    const baseWidth = isMobile ? 360 : 640;
    if (chartData.length === 0) return baseWidth;
    return Math.max(chartData.length * minBarWidth, baseWidth);
  }, [chartData.length, isMobile]);

  const pageList = useMemo(() => {
    const pages: Array<number | string> = [];
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const showLeftEllipsis = currentPage > 4;
    const showRightEllipsis = currentPage < totalPages - 3;

    pages.push(1);
    if (showLeftEllipsis) pages.push('…');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (showRightEllipsis) pages.push('…');
    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  // Actions
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField, sortDirection]
  );

  const clearFilters = useCallback(() => {
    setCommodityFilter('all');
    setOperationTypeFilter('all');
    setQuantityFilter('all');
    setShipperFilter('all');
    setDestinationFilter('all');
    setVesselNameFilter('all');
    setTerminalFilter('all');
    setOperationStatusFilter([]);
    setSearchTerm('');
  }, []);

  const updateScrollIndicators = useCallback(() => {
    const container = chartScrollRef.current;
    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const tolerance = 2;
    setCanScrollLeft(scrollLeft > tolerance);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - tolerance);
  }, []);

  const handleScrollRight = useCallback(() => {
    const container = chartScrollRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.3;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }, []);

  const handleScrollLeft = useCallback(() => {
    const container = chartScrollRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.3;
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }, []);

  // Update scroll indicators on chart data change
  useEffect(() => {
    updateScrollIndicators();
  }, [chartData.length, chartMinWidth, isMobile, updateScrollIndicators]);

  // Add scroll listener
  useEffect(() => {
    const container = chartScrollRef.current;
    if (!container) return;

    const onScroll = () => updateScrollIndicators();
    container.addEventListener('scroll', onScroll);
    updateScrollIndicators();

    return () => container.removeEventListener('scroll', onScroll);
  }, [updateScrollIndicators]);

  // Reset scroll on selection change
  useEffect(() => {
    const container = chartScrollRef.current;
    if (!container) return;
    container.scrollLeft = 0;
    updateScrollIndicators();
  }, [selectedChartCommodity, selectedDestinationCountries, updateScrollIndicators]);

  const exportCSV = useCallback(() => {
    const visibleCols = defaultColumns.filter((col) => visibleColumns[col.key]);
    const headers = visibleCols.map((col) => col.label).join(',');
    const rows = data
      .map((row) =>
        visibleCols
          .map((col) => {
            const value = col.customRender ? col.customRender(row) : row[col.key] || '';
            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(',')
      )
      .join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'constanta-port-data.csv';
    a.click();
  }, [data, visibleColumns]);

  const retryFetch = useCallback(() => {
    setError(null);
    setCurrentPage((prev) => prev);
  }, []);

  return {
    // State
    data,
    loading,
    error,
    totalCount,
    searchTerm,
    sortField,
    sortDirection,
    visibleColumns,
    currentPage,
    pageSize,
    commodityFilter,
    operationTypeFilter,
    quantityFilter,
    shipperFilter,
    destinationFilter,
    vesselNameFilter,
    terminalFilter,
    operationStatusFilter,
    selectedChartCommodity,
    selectedDestinationCountries,
    countrySearchTerm,
    chartData,
    chartLoading,
    uniqueDestinations,
    isMobile,
    isMounted,
    canScrollLeft,
    canScrollRight,
    filterMetadata,

    // Computed
    paginatedData,
    totalPages,
    statusOptions,
    activeFiltersCount,
    filteredCountries,
    chartMinWidth,
    columns: defaultColumns,
    pageList,

    // Actions
    setSearchTerm,
    handleSort,
    setCurrentPage,
    setPageSize,
    setVisibleColumns,
    setCommodityFilter,
    setOperationTypeFilter,
    setQuantityFilter,
    setShipperFilter,
    setDestinationFilter,
    setVesselNameFilter,
    setTerminalFilter,
    setOperationStatusFilter,
    clearFilters,
    setSelectedChartCommodity,
    setSelectedDestinationCountries,
    setCountrySearchTerm,
    handleScrollLeft,
    handleScrollRight,
    updateScrollIndicators,
    exportCSV,
    retryFetch,
    chartScrollRef,
  };
}
