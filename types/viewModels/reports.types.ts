import { Report } from '@/types';

// ViewModel State
export interface ReportsState {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  selectedReport: Report | null;
}

// ViewModel Computed Values
export interface ReportsComputed {
  featuredReports: Report[];
}

// ViewModel Actions
export interface ReportsActions {
  setSelectedReport: (report: Report | null) => void;
  formatDate: (dateISO: string) => string;
  refresh: () => Promise<void>;
}

// Complete ViewModel interface
export interface ReportsViewModel
  extends ReportsState,
          ReportsComputed,
          ReportsActions {}
