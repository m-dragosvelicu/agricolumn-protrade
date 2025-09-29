export interface Report {
  id: string;
  title: string;
  summary: string;
  body: string;
  dateISO: string;
  tags: string[];
  slug: string;
  isNew?: boolean;
  isRecommended?: boolean;
}

export interface ConstantaRow {
  id: string;
  date: string;
  commodity: string;
  grade: string;
  basis: string;
  deliveryWindow: string;
  location: string;
  price: number;
  currency: string;
  quotationType: 'Bid' | 'Ask' | 'Last';
  volume?: number;
  source: string;
  notes?: string;
}

export interface VesselData {
  id: number;
  vessel_name: string;
  status: string;
  departure_country: string;
  departure_port: string;
  departure_terminal: string;
  destination_country: string;
  operation_type: string;
  operation_completed: string;
  commodity_description: string;
  shipper: string;
  cargo_origin_1: string;
  cargo_origin_2: string;
}

export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface COTData {
  date: string;
  managedMoney: number;
  commercial: number;
  others: number;
  openInterest?: number;
}

export interface DGAgriData {
  country: string;
  value: number;
  period: string;
  metric: string;
}

export interface FilterState {
  dateRange: [string, string] | null;
  commodity: string[];
  grade: string[];
  basis: string[];
  currency: string[];
  source: string[];
  priceRange: [number, number] | null;
}

export type ChartInterval = '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';

export type PanelStatus = 'loading' | 'error' | 'success' | 'empty';
