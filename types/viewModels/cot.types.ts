import type { Exchange, Commodity } from '@/lib/api/cotCftc';

export interface CotCommodityOption {
  value: string;
  label: string;
  exchange: Exchange;
  commodity: Commodity;
}

export interface CotDataPoint {
  date: string;
  price: number;
}

// ViewModel State
export interface COTState {
  selectedCommodity: string;
  data: CotDataPoint[];
  isLoading: boolean;
  error: string | null;
}

// ViewModel Computed Values
export interface COTComputed {
  lineColor: string;
  yAxisDomain: [number, number];
}

// ViewModel Actions
export interface COTActions {
  setSelectedCommodity: (commodity: string) => void;
  refresh: () => Promise<void>;
  exportToCsv: () => void;
}

// Complete ViewModel interface
export interface COTViewModel extends COTState, COTComputed, COTActions {}
