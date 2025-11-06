#!/usr/bin/env node

/**
 * Script to transform vessel data from separate departure_country and departure_port
 * to merged departure_location field with format "RO-Constanta"
 */

const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'lib', 'mockData.ts');
const generatedDataPath = path.join(__dirname, '..', 'manual_upload', 'port_constanta_section', 'generated-vessel-data.ts');

// Country name to ISO code mapping
const countryCodeMap = {
  'Romania': 'RO',
  'Bulgaria': 'BG',
  'Ukraine': 'UA',
  'Turkey': 'TR',
  'Russia': 'RU',
};

function transformFile(filePath, fileName) {
  console.log(`\nReading ${fileName}...`);
  let content = fs.readFileSync(filePath, 'utf8');

  let transformCount = 0;

  // Pattern to match vessel objects with departure_country and departure_port
  // This regex matches the entire vessel object block
  const vesselPattern = /(\{[\s\S]*?id:\s*\d+,[\s\S]*?)departure_country:\s*"([^"]+)",\s*departure_port:\s*"([^"]+)",/g;

  content = content.replace(vesselPattern, (match, prefix, country, port) => {
    const countryCode = countryCodeMap[country] || country;
    // Fix the common typo "Constantza" to "Constanta"
    const correctedPort = port === 'Constantza' ? 'Constanta' : port;
    transformCount++;

    return `${prefix}departure_location: "${countryCode}-${correctedPort}",`;
  });

  console.log(`  Transformed ${transformCount} vessel records`);

  console.log(`  Writing updated ${fileName}...`);
  fs.writeFileSync(filePath, content, 'utf8');

  return transformCount;
}

function transformVesselData() {
  console.log('=== Vessel Data Transformation ===');

  let totalCount = 0;

  // Transform mockData.ts
  if (fs.existsSync(mockDataPath)) {
    totalCount += transformFile(mockDataPath, 'mockData.ts');
  }

  // Transform generated-vessel-data.ts
  if (fs.existsSync(generatedDataPath)) {
    totalCount += transformFile(generatedDataPath, 'generated-vessel-data.ts');
  }

  console.log('\n✓ Transformation complete!');
  console.log(`  - Updated ${totalCount} total vessel records`);
  console.log('  - Fixed "Constantza" typo to "Constanta"');
  console.log('  - Format: "CountryCode-Port" (e.g., "RO-Constanta")');
}

try {
  transformVesselData();
} catch (error) {
  console.error('Error transforming vessel data:', error);
  process.exit(1);
}
