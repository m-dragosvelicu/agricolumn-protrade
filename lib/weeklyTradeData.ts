/**
 * EU Weekly Trade Data - DEMO DATA
 *
 * This file contains demo data for EU-wide weekly trade comparisons.
 * Shows current week vs same week last year for all commodities.
 *
 * NOTE: This is placeholder data for visualization purposes only.
 * Real data will be imported from actual trade reports in the future.
 */

export interface WeeklyTradeEntry {
  commodity: string;        // e.g., "WHEAT", "CORN"
  tradeType: "Export" | "Import";
  thisYearVolume: number;   // Current year volume in tonnes
  lastYearVolume: number;   // Same week last year in tonnes
  weekLabel: string;        // e.g., "Week 44: Oct 28 - Nov 3, 2024"
  weekNumber: number;       // Week number in the year
  year: number;             // Current year
}

// Current week for demo purposes
const CURRENT_WEEK = 44;
const CURRENT_YEAR = 2024;
const WEEK_DATE_RANGE = "Oct 28 - Nov 3";

/**
 * DEMO DATA - EU Weekly Trade Volumes
 *
 * These are placeholder values using round numbers to clearly indicate demo status.
 * Real data will replace these values once weekly import functionality is implemented.
 */
export const mockWeeklyTradeData: WeeklyTradeEntry[] = [
  // WHEAT
  {
    commodity: "WHEAT",
    tradeType: "Export",
    thisYearVolume: 250000,
    lastYearVolume: 220000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
  {
    commodity: "WHEAT",
    tradeType: "Import",
    thisYearVolume: 85000,
    lastYearVolume: 92000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },

  // BARLEY
  {
    commodity: "BARLEY",
    tradeType: "Export",
    thisYearVolume: 180000,
    lastYearVolume: 165000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
  {
    commodity: "BARLEY",
    tradeType: "Import",
    thisYearVolume: 42000,
    lastYearVolume: 48000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },

  // CORN
  {
    commodity: "CORN",
    tradeType: "Export",
    thisYearVolume: 320000,
    lastYearVolume: 285000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
  {
    commodity: "CORN",
    tradeType: "Import",
    thisYearVolume: 125000,
    lastYearVolume: 138000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },

  // RAPESEED
  {
    commodity: "RAPESEED",
    tradeType: "Export",
    thisYearVolume: 95000,
    lastYearVolume: 88000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
  {
    commodity: "RAPESEED",
    tradeType: "Import",
    thisYearVolume: 52000,
    lastYearVolume: 55000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },

  // SUNFLOWER
  {
    commodity: "SUNFLOWER",
    tradeType: "Export",
    thisYearVolume: 72000,
    lastYearVolume: 68000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
  {
    commodity: "SUNFLOWER",
    tradeType: "Import",
    thisYearVolume: 35000,
    lastYearVolume: 38000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },

  // RAPESEED OIL
  {
    commodity: "RAPESEED_OIL",
    tradeType: "Export",
    thisYearVolume: 48000,
    lastYearVolume: 45000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
  {
    commodity: "RAPESEED_OIL",
    tradeType: "Import",
    thisYearVolume: 22000,
    lastYearVolume: 25000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },

  // SUNFLOWER OIL
  {
    commodity: "SUNFLOWER_OIL",
    tradeType: "Export",
    thisYearVolume: 65000,
    lastYearVolume: 62000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
  {
    commodity: "SUNFLOWER_OIL",
    tradeType: "Import",
    thisYearVolume: 18000,
    lastYearVolume: 20000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },

  // SOYBEANS
  {
    commodity: "SOYBEANS",
    tradeType: "Export",
    thisYearVolume: 110000,
    lastYearVolume: 102000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
  {
    commodity: "SOYBEANS",
    tradeType: "Import",
    thisYearVolume: 285000,
    lastYearVolume: 295000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },

  // SOY OIL
  {
    commodity: "SOY_OIL",
    tradeType: "Export",
    thisYearVolume: 38000,
    lastYearVolume: 35000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
  {
    commodity: "SOY_OIL",
    tradeType: "Import",
    thisYearVolume: 55000,
    lastYearVolume: 58000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },

  // RPS MEAL (Rapeseed Meal)
  {
    commodity: "RPS_MEAL",
    tradeType: "Export",
    thisYearVolume: 125000,
    lastYearVolume: 118000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
  {
    commodity: "RPS_MEAL",
    tradeType: "Import",
    thisYearVolume: 42000,
    lastYearVolume: 45000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },

  // SFS MEAL (Sunflower Meal)
  {
    commodity: "SFS_MEAL",
    tradeType: "Export",
    thisYearVolume: 95000,
    lastYearVolume: 88000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
  {
    commodity: "SFS_MEAL",
    tradeType: "Import",
    thisYearVolume: 28000,
    lastYearVolume: 32000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },

  // SOY MEAL
  {
    commodity: "SOY_MEAL",
    tradeType: "Export",
    thisYearVolume: 185000,
    lastYearVolume: 172000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
  {
    commodity: "SOY_MEAL",
    tradeType: "Import",
    thisYearVolume: 420000,
    lastYearVolume: 435000,
    weekLabel: `Week ${CURRENT_WEEK}: ${WEEK_DATE_RANGE}, ${CURRENT_YEAR}`,
    weekNumber: CURRENT_WEEK,
    year: CURRENT_YEAR,
  },
];

/**
 * Helper function to get weekly data for a specific commodity and trade type
 */
export function getWeeklyTradeData(
  commodity: string,
  tradeType: "Export" | "Import"
): WeeklyTradeEntry | undefined {
  return mockWeeklyTradeData.find(
    (entry) => entry.commodity === commodity && entry.tradeType === tradeType
  );
}

/**
 * Calculate percentage change from last year
 */
export function calculateYearOverYearChange(
  thisYear: number,
  lastYear: number
): number {
  if (lastYear === 0) return 0;
  return ((thisYear - lastYear) / lastYear) * 100;
}
