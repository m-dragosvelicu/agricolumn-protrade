import api from '@/lib/api/client';

export type DGAgriTradeType = 'Export' | 'Import';

export interface DGAgriCountryEntry {
  countryCode: string;
  countryName: string;
  value: number;
  source: string;
}

export interface DGAgriCountryDataResponse {
  commodity: string;
  tradeType: DGAgriTradeType;
  datasetLabel: string;
  periodLabel: string | null;
  marketingYear: string | null;
  situationDate: string | null;
  entries: DGAgriCountryEntry[];
}

export interface DGAgriWeeklySummaryResponse {
  commodity: string;
  tradeType: DGAgriTradeType;
  datasetLabel: string;
  weekNumber: number | null;
  marketingYear: string | null;
  weekLabel: string | null;
  thisYearVolume: number | null;
  lastYearVolume: number | null;
  weekStartDate: string | null;
  weekEndDate: string | null;
  previousMarketingYear: string | null;
}

export interface DGAgriMetadata {
  commodities: Array<{
    id: string;
    label: string;
    tradeTypes: DGAgriTradeType[];
  }>;
  tradeTypes: DGAgriTradeType[];
  marketingYear: string | null;
  periodLabel: string | null;
  situationDate: string | null;
}

export interface DGAgriImportResponse {
  ytdRecords: number;
  weeklyRecords: number;
  marketingYear: string | null;
  periodLabel: string | null;
  situationDate: string | null;
}

export const dgAgriApi = {
  async importData(formData: FormData): Promise<DGAgriImportResponse> {
    const response = await api.post<DGAgriImportResponse>('/dg-agri/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getCountryData(params: {
    commodity: string;
    tradeType: DGAgriTradeType;
  }): Promise<DGAgriCountryDataResponse> {
    const response = await api.get<DGAgriCountryDataResponse>('/dg-agri/country-data', {
      params,
    });
    return response.data;
  },

  async getWeeklySummary(params: {
    commodity: string;
    tradeType: DGAgriTradeType;
  }): Promise<DGAgriWeeklySummaryResponse> {
    const response = await api.get<DGAgriWeeklySummaryResponse>('/dg-agri/weekly-summary', {
      params,
    });
    return response.data;
  },

  async getMetadata(): Promise<DGAgriMetadata> {
    const response = await api.get<DGAgriMetadata>('/dg-agri/metadata');
    return response.data;
  },
};


