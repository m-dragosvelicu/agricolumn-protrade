// Centralized commodity color definitions and mapping

export const COLOR_GREEN = '#10b981'; // Daily Prices green (emerald)
export const COLOR_YELLOW = '#eab308'; // DG Agri bar yellow (amber)
export const COLOR_MAGENTA = '#8b5cf6'; // Daily Prices magenta (violet)

// Explicit mapping for known ids/labels used across the app
const EXPLICIT_MAP: Record<string, string> = {
  // Daily Prices ids
  wheatbread: COLOR_GREEN,
  wheatfeed: COLOR_GREEN,
  barley: COLOR_GREEN,
  corn: COLOR_YELLOW,
  rapeseed: COLOR_MAGENTA,
  rapeseeds: COLOR_MAGENTA,
  sunflower: COLOR_MAGENTA,

  // DG Agri ids
  WHEAT: COLOR_GREEN,
  BARLEY: COLOR_GREEN,
  CORN: COLOR_YELLOW,
  RAPESEED: COLOR_MAGENTA,
  SUNFLOWER: COLOR_MAGENTA,
  RAPESEED_OIL: COLOR_MAGENTA,
  SUNFLOWER_OIL: COLOR_MAGENTA,
  SOYBEANS: COLOR_YELLOW,
  SOY_OIL: COLOR_YELLOW,
  RPS_MEAL: COLOR_MAGENTA,
  SFS_MEAL: COLOR_MAGENTA,
  SOY_MEAL: COLOR_YELLOW,

  // Constanta abbreviations
  RPS: COLOR_MAGENTA,
  SFS: COLOR_MAGENTA,
  RPS_OIL: COLOR_MAGENTA,
  SFS_OIL: COLOR_MAGENTA,
};

/**
 * Returns the standardized color for a commodity key or display label.
 * Falls back to keyword rules if the key isn't explicitly mapped.
 */
export function colorForCommodity(keyOrLabel: string | undefined | null): string {
  const raw = (keyOrLabel ?? '').toString().trim();
  if (!raw) return COLOR_MAGENTA;

  // Exact matches first (case-insensitive for known lowercase ids, and exact for uppercase ids)
  const lower = raw.toLowerCase();
  if (lower in EXPLICIT_MAP) return EXPLICIT_MAP[lower];
  if (raw in EXPLICIT_MAP) return EXPLICIT_MAP[raw];

  // Keyword-based heuristics
  // Green: wheat, barley
  if (lower.includes('wheat') || lower.includes('barley')) return COLOR_GREEN;

  // Yellow: corn, soybeans/soy, soy oil/meal
  if (lower.includes('corn') || lower.includes('soy')) return COLOR_YELLOW;

  // Magenta: rapeseed/rape/rps, sunflower/sfs, plus their oils/meals
  if (
    lower.includes('rapeseed') ||
    lower.includes('rape') ||
    lower.includes('rps') ||
    lower.includes('sunflower') ||
    lower.includes('sfs')
  ) {
    return COLOR_MAGENTA;
  }

  // Oil/meal default: if soy -> yellow, else magenta
  if (lower.includes('oil') || lower.includes('meal')) {
    return lower.includes('soy') ? COLOR_YELLOW : COLOR_MAGENTA;
  }

  // Safe default aligned with existing UI accent
  return COLOR_MAGENTA;
}

