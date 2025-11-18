import api from '@/lib/api/client';
import type { Report } from '@/types';

export interface CreateReportDto {
  title: string;
  summary: string;
  body: string;
  dateISO: string;
  tags: string[];
  slug: string;
  isRecommended?: boolean;
}

export interface ReportsListQuery {
  offset?: number;
  limit?: number;
  tag?: string;
  search?: string;
  isRecommended?: boolean;
  from?: string;
  to?: string;
}

export interface ReportsListResponse {
  data: Report[];
  total: number;
  offset: number;
  limit: number;
}

export interface ReportsImportResult {
  total: number;
  inserted: number;
  updated: number;
}

export const reportsApi = {
  async createReport(payload: CreateReportDto): Promise<Report> {
    const response = await api.post<Report>('/reports', payload);
    return response.data;
  },

  async getReports(params?: ReportsListQuery): Promise<ReportsListResponse> {
    const response = await api.get<ReportsListResponse>('/reports', {
      params,
    });
    return response.data;
  },

  async getLatest(params?: ReportsListQuery): Promise<Report[]> {
    const response = await api.get<Report[]>('/reports/latest', {
      params,
    });
    return response.data;
  },

  async importReports(reports: CreateReportDto[]): Promise<ReportsImportResult> {
    const response = await api.post<ReportsImportResult>('/reports/import', {
      reports,
    });
    return response.data;
  },

  async deleteReport(id: string): Promise<void> {
    // Soft delete via PATCH /reports/:id with { isDeleted: true }
    await api.patch(`/reports/${id}`, { isDeleted: true });
  },
};
