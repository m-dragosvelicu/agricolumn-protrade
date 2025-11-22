import { ChartInterval } from '@/types';

export interface CommodityOption {
  id: string;
  name: string;
  currency: string;
}

export interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface ChartDataPoint {
  date: string;
  price: number;
  volume?: number;
}

export interface PriceChange {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'unchanged';
  label: string;
  colorClass: string;
}

// ViewModel State (data + UI state)
export interface DailyPricesState {
  selectedInstrument: string;
  selectedInterval: ChartInterval;
  chartData: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
}

// ViewModel Computed Values (derived from state)
export interface DailyPricesComputed {
  priceChange: PriceChange;
  selectedCommodity: CommodityOption | undefined;
  selectedUnit: string;
  selectedColor: string;
}

// ViewModel Actions (methods to modify state)
export interface DailyPricesActions {
  setSelectedInstrument: (instrument: string) => void;
  setSelectedInterval: (interval: ChartInterval) => void;
  refresh: () => Promise<void>;
}

// Complete ViewModel interface
export interface DailyPricesViewModel
  extends DailyPricesState,
          DailyPricesComputed,
          DailyPricesActions {}
