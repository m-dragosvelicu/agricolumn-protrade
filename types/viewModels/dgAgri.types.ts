import type { DGAgriMetadata, DGAgriTradeType, DGAgriCountryDataResponse } from '@/lib/api/dgAgri';

export interface DGAgriChartDataPoint {
  country: string;
  value: number;
}

// ViewModel State
export interface DGAgriState {
  metadata: DGAgriMetadata | null;
  commodity: string | null;
  tradeType: DGAgriTradeType;
  countryData: DGAgriCountryDataResponse | null;
  isMetadataLoading: boolean;
  isDataLoading: boolean;
  metadataError: string | null;
  dataError: string | null;
}

// ViewModel Computed Values
export interface DGAgriComputed {
  commodityOptions: DGAgriMetadata['commodities'];
  chartData: DGAgriChartDataPoint[];
  baseColor: string;
  yAxisMax: number;
  canExport: boolean;
}

// ViewModel Actions
export interface DGAgriActions {
  setCommodity: (commodity: string) => void;
  setTradeType: (tradeType: DGAgriTradeType) => void;
  exportToCsv: () => void;
}

// Complete ViewModel interface
export interface DGAgriViewModel extends DGAgriState, DGAgriComputed, DGAgriActions {}
