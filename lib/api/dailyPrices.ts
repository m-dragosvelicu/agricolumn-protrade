import api from '@/lib/api/client';

export interface DailyPricePoint {
  date: string;
  value: number;
}

export interface DailyPricesSeries {
  seriesId: string;
  label: string;
  currency: string;
  unit: string;
  points: DailyPricePoint[];
}

export interface DailyPricesImportResponse {
  totalDays: number;
  totalPoints: number;
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
}

export interface DailyPricesLatestQuery {
  seriesId?: string;
  limit?: number;
}

export interface DailyPricesHistoryQuery {
  seriesId: string;
  startDate?: string;
  endDate?: string;
}

export interface DailyPricesMetadata {
  series: Array<{
    id: string;
    label: string;
    currency: string;
    unit: string;
  }>;
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
}

export const dailyPricesApi = {
  async importData(formData: FormData): Promise<DailyPricesImportResponse> {
    const response = await api.post<DailyPricesImportResponse>('/daily-prices/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getLatest(params?: DailyPricesLatestQuery): Promise<DailyPricesSeries[]> {
    const response = await api.get<DailyPricesSeries[]>('/daily-prices/latest', {
      params,
    });
    return response.data;
  },

  async getHistory(params: DailyPricesHistoryQuery): Promise<DailyPricesSeries> {
    const response = await api.get<DailyPricesSeries>('/daily-prices/history', {
      params,
    });
    return response.data;
  },

  async getMetadata(): Promise<DailyPricesMetadata> {
    const response = await api.get<DailyPricesMetadata>('/daily-prices/metadata');
    return response.data;
  },
};

