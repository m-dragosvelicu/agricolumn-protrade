import type { VesselData } from '@/types';

export type SortField = keyof VesselData;
export type SortDirection = 'asc' | 'desc';

export interface ColumnConfig {
  key: SortField;
  label: string;
  visible: boolean;
  customRender?: (row: VesselData) => string;
}

export interface FilterMetadata {
  operationTypes: string[];
  statuses: string[];
  commodityGroups: string[];
  commodityDescriptions: string[];
  shippers: string[];
  departureTerminals: string[];
  destinationCountries: string[];
}

export interface ConstantaPortChartDataPoint {
  country: string;
  quantity: number;
}

// ViewModel State
export interface ConstantaPortState {
  // Data state
  data: VesselData[];
  loading: boolean;
  error: string | null;
  totalCount: number;

  // Table state
  searchTerm: string;
  sortField: SortField;
  sortDirection: SortDirection;
  visibleColumns: Record<string, boolean>;
  currentPage: number;
  pageSize: number;

  // Filter state
  commodityFilter: string;
  operationTypeFilter: string;
  quantityFilter: string;
  shipperFilter: string;
  destinationFilter: string;
  vesselNameFilter: string;
  terminalFilter: string;
  operationStatusFilter: string[];

  // Chart state
  selectedChartCommodity: string;
  selectedDestinationCountries: string[];
  countrySearchTerm: string;
  chartData: ConstantaPortChartDataPoint[];
  chartLoading: boolean;
  uniqueDestinations: string[];

  // UI state
  isMobile: boolean;
  isMounted: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;

  // Metadata
  filterMetadata: FilterMetadata | null;
}

// ViewModel Computed Values
export interface ConstantaPortComputed {
  paginatedData: VesselData[];
  totalPages: number;
  statusOptions: string[];
  activeFiltersCount: number;
  filteredCountries: string[];
  chartMinWidth: number;
  columns: ColumnConfig[];
  pageList: Array<number | string>;
}

// ViewModel Actions
export interface ConstantaPortActions {
  // Search and sorting
  setSearchTerm: (term: string) => void;
  handleSort: (field: SortField) => void;

  // Pagination
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Column visibility
  setVisibleColumns: (columns: Record<string, boolean>) => void;

  // Filters
  setCommodityFilter: (filter: string) => void;
  setOperationTypeFilter: (filter: string) => void;
  setQuantityFilter: (filter: string) => void;
  setShipperFilter: (filter: string) => void;
  setDestinationFilter: (filter: string) => void;
  setVesselNameFilter: (filter: string) => void;
  setTerminalFilter: (filter: string) => void;
  setOperationStatusFilter: (filters: string[]) => void;
  clearFilters: () => void;

  // Chart
  setSelectedChartCommodity: (commodity: string) => void;
  setSelectedDestinationCountries: (countries: string[]) => void;
  setCountrySearchTerm: (term: string) => void;

  // Scroll
  handleScrollLeft: () => void;
  handleScrollRight: () => void;
  updateScrollIndicators: () => void;

  // Export
  exportCSV: () => void;

  // Error handling
  retryFetch: () => void;

  // Refs
  chartScrollRef: React.RefObject<HTMLDivElement | null>;
}

// Complete ViewModel interface
export interface ConstantaPortViewModel extends ConstantaPortState, ConstantaPortComputed, ConstantaPortActions {}
