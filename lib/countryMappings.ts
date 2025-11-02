/**
 * Country Code Mappings
 * Maps country names to their ISO 3166-1 alpha-2 codes
 */

export const COUNTRY_CODES: Record<string, string> = {
  Romania: "RO",
  Bulgaria: "BG",
  Ukraine: "UA",
  Turkey: "TR",
  Russia: "RU",
  Georgia: "GE",
  Greece: "GR",
  Italy: "IT",
  France: "FR",
  Spain: "ES",
  Germany: "DE",
  Netherlands: "NL",
  Belgium: "BE",
  Poland: "PL",
  // Add more countries as needed
};

/**
 * Reverse mapping: ISO codes to country names
 */
export const CODE_TO_COUNTRY: Record<string, string> = Object.entries(
  COUNTRY_CODES
).reduce(
  (acc, [country, code]) => {
    acc[code] = country;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Interface for parsed departure location
 */
export interface ParsedLocation {
  countryCode: string;
  port: string;
  raw: string;
}

/**
 * Parses a departure_location string in format "RO-Constanta"
 * @param location - The departure location string (e.g., "RO-Constanta")
 * @returns Parsed location object with countryCode and port, or null if invalid
 */
export function parseDepartureLocation(
  location: string | undefined | null
): ParsedLocation | null {
  if (!location || typeof location !== "string") {
    return null;
  }

  const parts = location.split("-");
  if (parts.length !== 2) {
    return null;
  }

  const [countryCode, port] = parts.map((part) => part.trim());

  if (!countryCode || !port) {
    return null;
  }

  return {
    countryCode,
    port,
    raw: location,
  };
}

/**
 * Creates a departure_location string from country code and port
 * @param countryCode - ISO country code (e.g., "RO")
 * @param port - Port name (e.g., "Constanta")
 * @returns Formatted departure location string (e.g., "RO-Constanta")
 */
export function createDepartureLocation(
  countryCode: string,
  port: string
): string {
  return `${countryCode.trim()}-${port.trim()}`;
}

/**
 * Validates if a country code is recognized
 * @param code - ISO country code to validate
 * @returns True if the code is in our mapping
 */
export function isValidCountryCode(code: string): boolean {
  return code in CODE_TO_COUNTRY;
}

/**
 * Gets the full country name from a country code
 * @param code - ISO country code (e.g., "RO")
 * @returns Full country name (e.g., "Romania") or the code itself if not found
 */
export function getCountryName(code: string): string {
  return CODE_TO_COUNTRY[code] || code;
}

/**
 * Gets the country code from a country name
 * @param country - Country name (e.g., "Romania")
 * @returns ISO country code (e.g., "RO") or undefined if not found
 */
export function getCountryCode(country: string): string | undefined {
  return COUNTRY_CODES[country];
}
