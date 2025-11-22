import api from '@/lib/api/client';

export type Exchange = 'CBOT' | 'EURONEXT';
export type Commodity = 'WHEAT' | 'CORN' | 'SOY' | 'RPS';

export interface CotCftcPosition {
  date: string;  // YYYY-MM-DD format
  value: number; // Can be negative
}

export interface CotCftcPair {
  exchange: Exchange;
  exchangeLabel: string;
  commodity: Commodity;
  commodityLabel: string;
  positions: CotCftcPosition[];
}

export interface CotCftcImportResult {
  total: number;
  inserted: number;
  updated: number;
}

export interface CotCftcMetadata {
  exchanges: Array<{ id: string; label: string }>;
  commodities: Array<{ id: string; label: string }>;
  availablePairs: Array<{ exchange: string; commodity: string }>;
  dateRange: { earliest: string; latest: string };
}

export interface CotCftcLatestParams {
  exchange?: Exchange;
  commodity?: Commodity;
  limit?: number;
}

export interface CotCftcHistoryParams {
  exchange: Exchange;
  commodity: Commodity;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export const cotCftcApi = {
  async importData(formData: FormData): Promise<CotCftcImportResult> {
    const response = await api.post<CotCftcImportResult>('/cot-cftc/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getLatest(params?: CotCftcLatestParams): Promise<CotCftcPair[]> {
    const response = await api.get<CotCftcPair[]>('/cot-cftc/latest', {
      params,
    });
    return response.data;
  },

  async getHistory(params: CotCftcHistoryParams): Promise<CotCftcPair> {
    const response = await api.get<CotCftcPair>('/cot-cftc/history', {
      params,
    });
    return response.data;
  },

  async getMetadata(): Promise<CotCftcMetadata> {
    const response = await api.get<CotCftcMetadata>('/cot-cftc/metadata');
    return response.data;
  },
};
