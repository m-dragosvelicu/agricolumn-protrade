import api from '@/lib/api/client';

export interface ImportVesselDto {
  vessel_name: string;
  imo?: string;
  status: string;
  departure_location: string;
  departure_terminal?: string;
  destination_country?: string;
  destination_port?: string;
  destination_terminal?: string;
  operation_type: string;
  eta?: string;
  operation_commenced: string;
  operation_completed?: string;
  commodity_group: string;
  commodity_description: string;
  quantity?: number;
  shipper?: string;
  cargo_origin_1?: string;
  cargo_origin_2?: string;
  cargo_origin_3?: string;
}

export interface UpsertVesselsResponse {
  total: number;
  inserted: number;
  updated: number;
}

export interface Vessel {
  id: string;
  vesselName: string;
  imo: string | null;
  status: string;
  departureLocation: string;
  departureTerminal: string | null;
  destinationCountry: string | null;
  destinationPort: string | null;
  destinationTerminal: string | null;
  operationType: string;
  eta: string | null;
  operationCommenced: string;
  operationCompleted: string | null;
  commodityGroup: string;
  commodityDescription: string;
  quantity: number | string | null; // PostgreSQL decimal can be serialized as string
  shipper: string | null;
  cargoOrigin1: string | null;
  cargoOrigin2: string | null;
  cargoOrigin3: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueryVesselsParams {
  skip?: number;
  take?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  commodityGroup?: string;
  commodityDescription?: string;
  commodityDescriptions?: string[];
  operationType?: string;
  status?: string;
  statuses?: string[];
  destinationCountry?: string;
  vesselName?: string;
  departureTerminal?: string;
  shipper?: string;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface VesselsResponse {
  data: Vessel[];
  total: number;
  skip: number;
  take: number;
}

export interface ChartDataPoint {
  shipper: string;
  quantity: number;
}

export interface ChartDataResponse {
  data: ChartDataPoint[];
  totalQuantity: number;
  uniqueShippers: number;
}

export interface ChartDataParams {
  commodity?: string;
  commodityDescriptions?: string[];
  destinationCountries?: string[];
  operationType?: string;
}

export const vesselsApi = {
  async upsertVessels(vessels: ImportVesselDto[]): Promise<UpsertVesselsResponse> {
    const response = await api.post<UpsertVesselsResponse>('/vessels/import', {
      vessels: vessels,
    });
    return response.data;
  },

  async getVessels(params?: QueryVesselsParams): Promise<VesselsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.commodityGroup) queryParams.append('commodityGroup', params.commodityGroup);
    if (params?.commodityDescription) queryParams.append('commodityDescription', params.commodityDescription);
    if (params?.commodityDescriptions && params.commodityDescriptions.length > 0) {
      params.commodityDescriptions.forEach(desc => queryParams.append('commodityDescriptions', desc));
    }
    if (params?.operationType) queryParams.append('operationType', params.operationType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.statuses && params.statuses.length > 0) {
      params.statuses.forEach(s => queryParams.append('statuses', s));
    }
    if (params?.destinationCountry) queryParams.append('destinationCountry', params.destinationCountry);
    if (params?.vesselName) queryParams.append('vesselName', params.vesselName);
    if (params?.departureTerminal) queryParams.append('departureTerminal', params.departureTerminal);
    if (params?.shipper) queryParams.append('shipper', params.shipper);
    if (params?.minQuantity !== undefined) queryParams.append('minQuantity', params.minQuantity.toString());
    if (params?.maxQuantity !== undefined) queryParams.append('maxQuantity', params.maxQuantity.toString());

    const queryString = queryParams.toString();
    const url = `/vessels${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<VesselsResponse>(url);
    return response.data;
  },

  async getChartData(params?: ChartDataParams): Promise<ChartDataResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.commodity) queryParams.append('commodity', params.commodity);
    if (params?.commodityDescriptions && params.commodityDescriptions.length > 0) {
      params.commodityDescriptions.forEach(desc => {
        queryParams.append('commodityDescriptions', desc);
      });
    }
    if (params?.operationType) queryParams.append('operationType', params.operationType);
    if (params?.destinationCountries && params.destinationCountries.length > 0) {
      params.destinationCountries.forEach(country => {
        queryParams.append('destinationCountries', country);
      });
    }

    const queryString = queryParams.toString();
    const url = `/vessels/chart-data${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ChartDataResponse>(url);
    return response.data;
  },

  async getUniqueDestinations(): Promise<string[]> {
    const response = await api.get<{ destinations: string[] }>('/vessels/unique-destinations');
    return response.data.destinations;
  },

  async getFilterMetadata(): Promise<{
    operationTypes: string[];
    statuses: string[];
    commodityGroups: string[];
    commodityDescriptions: string[];
    shippers: string[];
    departureTerminals: string[];
    destinationCountries: string[];
  }> {
    const response = await api.get('/vessels/filter-metadata');
    return response.data;
  },
};

