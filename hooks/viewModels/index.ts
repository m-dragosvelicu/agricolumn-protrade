// ViewModel hooks barrel export
export {
  useDailyPricesViewModel,
  COMMODITIES,
  INTERVALS,
} from './useDailyPricesViewModel';

export { useReportsViewModel } from './useReportsViewModel';

export { useCOTViewModel, COT_COMMODITIES } from './useCOTViewModel';

export { useDGAgriViewModel } from './useDGAgriViewModel';

export { useEUWeeklyTradeViewModel } from './useEUWeeklyTradeViewModel';

export {
  useConstantaPortViewModel,
  COMMODITY_ORDER,
  STATUS_ORDER,
} from './useConstantaPortViewModel';

export { useProfileViewModel } from './useProfileViewModel';

export { useBillingViewModel } from './useBillingViewModel';

// Re-export types for convenience
export type {
  DailyPricesViewModel,
  CommodityOption,
  ChartDataPoint,
  PriceChange,
} from '@/types/viewModels/dailyPrices.types';

export type { ReportsViewModel } from '@/types/viewModels/reports.types';

export type {
  COTViewModel,
  CotCommodityOption,
  CotDataPoint,
} from '@/types/viewModels/cot.types';

export type {
  DGAgriViewModel,
  DGAgriChartDataPoint,
} from '@/types/viewModels/dgAgri.types';

export type {
  EUWeeklyTradeViewModel,
  EUWeeklyTradeChartDataPoint,
} from '@/types/viewModels/euWeeklyTrade.types';

export type {
  ConstantaPortViewModel,
  SortField,
  SortDirection,
  ColumnConfig,
} from '@/types/viewModels/constantaPort.types';

export type { ProfileViewModel } from '@/types/viewModels/profile.types';

export type { BillingViewModel } from '@/types/viewModels/billing.types';
