import type { DGAgriMetadata, DGAgriTradeType, DGAgriWeeklySummaryResponse } from '@/lib/api/dgAgri';

export interface EUWeeklyTradeChartDataPoint {
  category: string;
  value: number;
  label: string;
  fill: string;
}

// ViewModel State
export interface EUWeeklyTradeState {
  metadata: DGAgriMetadata | null;
  commodity: string | null;
  tradeType: DGAgriTradeType;
  summary: DGAgriWeeklySummaryResponse | null;
  isMetadataLoading: boolean;
  isSummaryLoading: boolean;
  metadataError: string | null;
  summaryError: string | null;
}

// ViewModel Computed Values
export interface EUWeeklyTradeComputed {
  commodityOptions: DGAgriMetadata['commodities'];
  chartData: EUWeeklyTradeChartDataPoint[];
  baseColor: string;
  lastYearColor: string;
  xAxisMax: number;
  percentChange: number;
}

// ViewModel Actions
export interface EUWeeklyTradeActions {
  setCommodity: (commodity: string) => void;
  setTradeType: (tradeType: DGAgriTradeType) => void;
}

// Complete ViewModel interface
export interface EUWeeklyTradeViewModel extends EUWeeklyTradeState, EUWeeklyTradeComputed, EUWeeklyTradeActions {}
