'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportsApi } from '@/lib/api/reports';
import { Report } from '@/types';
import type { ReportsViewModel } from '@/types/viewModels/reports.types';

// Pure utility functions
function getWeekRange(): { from: string; to: string } {
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = (day + 6) % 7; // days since Monday
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    from: startOfWeek.toISOString(),
    to: endOfWeek.toISOString(),
  };
}

function filterVisibleReports(reports: Report[]): Report[] {
  const now = new Date();
  return (reports || []).filter((report) => {
    const publishedAt = new Date(report.dateISO);
    return publishedAt.getTime() <= now.getTime();
  });
}

function sortByRecommended(reports: Report[]): Report[] {
  const recommended = reports.filter((r) => r.isRecommended);
  const nonRecommended = reports.filter((r) => !r.isRecommended);
  return [...recommended, ...nonRecommended];
}

/**
 * ViewModel hook for ReportsSection
 * Manages all state, business logic, and data transformations
 */
export function useReportsViewModel(): ReportsViewModel {
  // State
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Data fetching
  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { from, to } = getWeekRange();
      const latest = await reportsApi.getLatest({ limit: 24, from, to });
      const visible = filterVisibleReports(latest);
      setReports(visible);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load reports.';
      setError(message);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Computed: featured reports (recommended first, max 12)
  const featuredReports = useMemo(() => {
    return sortByRecommended(reports).slice(0, 12);
  }, [reports]);

  // Utility: format date
  const formatDate = useCallback((dateISO: string) => {
    return new Date(dateISO).toLocaleDateString();
  }, []);

  return {
    // State
    reports,
    isLoading,
    error,
    selectedReport,

    // Computed
    featuredReports,

    // Actions
    setSelectedReport,
    formatDate,
    refresh: loadReports,
  };
}
