/**
 * Smart Y-Axis Range Calculator
 * Implements industry-standard padding with smart rounding following the (1,2,5) × 10^n pattern
 */

/**
 * Rounds a number to a "nice" number following the pattern: 1, 2, 5, 10, 20, 50, 100, etc.
 * @param value - The value to round
 * @returns A nicely rounded value
 */
function roundToNiceNumber(value: number): number {
  if (value === 0) return 0;
  
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(value))));
  const normalized = value / magnitude;
  
  let nice: number;
  if (normalized < 1.5) {
    nice = 1;
  } else if (normalized < 3) {
    nice = 2;
  } else if (normalized < 7) {
    nice = 5;
  } else {
    nice = 10;
  }
  
  return nice * magnitude;
}

/**
 * Calculates smart Y-axis min/max range with appropriate padding and rounding
 * @param data - Array of data points with numeric values
 * @param dataKey - The key to extract values from (default: 'price')
 * @param paddingPercent - Percentage of range to use as padding (default: 5%)
 * @returns Object with min and max values for Y-axis domain
 */
export function calculateYAxisRange(
  data: any[],
  dataKey: string = 'price',
  paddingPercent: number = 0.05
): { min: number; max: number } {
  if (!data || data.length === 0) {
    return { min: 0, max: 100 };
  }

  // Extract all numeric values
  const values = data
    .map(item => {
      const val = item[dataKey];
      return typeof val === 'number' && !isNaN(val) ? val : null;
    })
    .filter((v): v is number => v !== null);

  if (values.length === 0) {
    return { min: 0, max: 100 };
  }

  const minPrice = Math.min(...values);
  const maxPrice = Math.max(...values);
  
  // Handle edge case where all values are the same
  if (minPrice === maxPrice) {
    const padding = Math.abs(minPrice * 0.1) || 10;
    return {
      min: minPrice - padding,
      max: maxPrice + padding
    };
  }

  const range = maxPrice - minPrice;
  const padding = range * paddingPercent;
  
  // Smart rounding for padding
  const roundedPadding = roundToNiceNumber(padding);
  
  // Calculate min/max with padding
  const rawMin = minPrice - roundedPadding;
  const rawMax = maxPrice + roundedPadding;
  
  // Round to nice numbers
  const min = Math.floor(rawMin / roundedPadding) * roundedPadding;
  const max = Math.ceil(rawMax / roundedPadding) * roundedPadding;
  
  return { min, max };
}

/**
 * Alternative percentage-based approach for Y-axis range
 * @param data - Array of data points
 * @param dataKey - The key to extract values from
 * @param paddingPercent - Direct percentage padding (default: 5%)
 * @returns Object with min and max values
 */
export function calculateYAxisRangePercentage(
  data: any[],
  dataKey: string = 'price',
  paddingPercent: number = 0.05
): { min: number; max: number } {
  if (!data || data.length === 0) {
    return { min: 0, max: 100 };
  }

  const values = data
    .map(item => {
      const val = item[dataKey];
      return typeof val === 'number' && !isNaN(val) ? val : null;
    })
    .filter((v): v is number => v !== null);

  if (values.length === 0) {
    return { min: 0, max: 100 };
  }

  const minPrice = Math.min(...values);
  const maxPrice = Math.max(...values);
  
  if (minPrice === maxPrice) {
    const padding = Math.abs(minPrice * 0.1) || 10;
    return {
      min: minPrice - padding,
      max: maxPrice + padding
    };
  }

  // Apply percentage directly to min/max values
  const rawMin = minPrice * (1 - paddingPercent);
  const rawMax = maxPrice * (1 + paddingPercent);
  
  // Get nice rounding unit based on range
  const range = rawMax - rawMin;
  const roundingUnit = roundToNiceNumber(range / 10);
  
  const min = Math.floor(rawMin / roundingUnit) * roundingUnit;
  const max = Math.ceil(rawMax / roundingUnit) * roundingUnit;
  
  return { min, max };
}

