/**
 * Country Code Mappings
 * Uses country-data package for comprehensive ISO 3166-1 alpha-2 codes
 * Source: https://github.com/OpenBookPrices/country-data
 */

import { countries, lookup } from 'country-data';

// Build lookup maps from country-data
const COUNTRY_NAME_TO_CODE: Record<string, string> = {};
const CODE_TO_COUNTRY_NAME: Record<string, string> = {};

// Initialize maps from country-data
countries.all.forEach((country: { alpha2?: string; name?: string }) => {
  if (country.alpha2 && country.name) {
    // Map by official name
    COUNTRY_NAME_TO_CODE[country.name.toLowerCase()] = country.alpha2;
    CODE_TO_COUNTRY_NAME[country.alpha2] = country.name;
    
    // Also map common variations
    const nameVariations = [
      country.name.replace(/\s+/g, ''), // Remove spaces
      country.name.replace(/[^\w]/g, ''), // Remove special chars
    ];
    
    nameVariations.forEach((variation) => {
      if (variation && variation !== country.name) {
        COUNTRY_NAME_TO_CODE[variation.toLowerCase()] = country.alpha2!;
      }
    });
  }
});

// Handle common typos and variations manually
const COMMON_TYPOS: Record<string, string> = {
  'komania': 'RO', // Common typo for Romania
  'rumania': 'RO',
  'roumania': 'RO',
  'unitedkingdom': 'GB',
  'uk': 'GB',
  'unitedstates': 'US',
  'usa': 'US',
  'unitedstatesofamerica': 'US',
  'saudiarabia': 'SA',
};

// Add typos to the map
Object.entries(COMMON_TYPOS).forEach(([typo, code]) => {
  COUNTRY_NAME_TO_CODE[typo] = code;
});

/**
 * Reverse mapping: ISO codes to country names
 */
export const CODE_TO_COUNTRY = CODE_TO_COUNTRY_NAME;

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
 * Uses country-data package for comprehensive lookup
 * @param country - Country name (e.g., "Romania", "romania", "ROMANIA", "United Kingdom")
 * @returns ISO country code (e.g., "RO") or undefined if not found
 */
export function getCountryCode(country: string): string | undefined {
  if (!country) return undefined;
  
  const normalizedInput = country.trim();
  const normalizedLower = normalizedInput.toLowerCase();
  
  // Try exact match first (case-insensitive)
  if (COUNTRY_NAME_TO_CODE[normalizedLower]) {
    return COUNTRY_NAME_TO_CODE[normalizedLower];
  }
  
  // Try with spaces removed
  const normalizedNoSpaces = normalizedInput
    .replace(/\s+/g, '')
    .replace(/[^\w]/g, '')
    .toLowerCase();
  
  if (COUNTRY_NAME_TO_CODE[normalizedNoSpaces]) {
    return COUNTRY_NAME_TO_CODE[normalizedNoSpaces];
  }
  
  // Try lookup using country-data lookup function
  try {
    const matches = lookup.countries({ name: normalizedInput });
    if (matches && matches.length > 0 && matches[0].alpha2) {
      return matches[0].alpha2;
    }
  } catch (e) {
    // Fallback if lookup fails
  }
  
  // Try partial match in our map
  for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
    if (normalizedLower.includes(name) || name.includes(normalizedLower)) {
      return code;
    }
  }
  
  // Check common typos
  if (COMMON_TYPOS[normalizedNoSpaces]) {
    return COMMON_TYPOS[normalizedNoSpaces];
  }
  
  // If country name is already a 2-letter code, validate and return it
  if (normalizedInput.length === 2 && /^[A-Z]{2}$/i.test(normalizedInput)) {
    const code = normalizedInput.toUpperCase();
    // Validate it exists in country-data
    if (CODE_TO_COUNTRY_NAME[code]) {
      return code;
    }
  }
  
  // Fallback: use first 2 letters uppercase (last resort)
  if (normalizedInput.length >= 2) {
    return normalizedInput.substring(0, 2).toUpperCase();
  }
  
  return undefined;
}
