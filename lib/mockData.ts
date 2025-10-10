import { Report, ConstantaRow, VesselData, PriceData, COTData, DGAgriData } from '@/types';

// Mock Reports Data
export const mockReports: Report[] = [
  {
    id: '1',
    title: 'Wheat Futures Rise on EU Weather Concerns',
    summary: 'European wheat futures climbed 2.5% as drought conditions in major growing regions raise supply concerns for the upcoming harvest.',
    body: 'Extended body content here...',
    dateISO: '2024-03-15T09:00:00Z',
    tags: ['Wheat', 'EU', 'Weather'],
    slug: 'wheat-futures-rise-eu-weather',
    isNew: true,
    isRecommended: true,
  },
  {
    id: '2',
    title: 'Romania Corn Export Volumes Increase 15%',
    summary: 'Port Constanta reports significant increase in corn shipments to Mediterranean markets, driven by competitive pricing.',
    body: 'Extended body content here...',
    dateISO: '2024-03-14T14:30:00Z',
    tags: ['Corn', 'Romania', 'Export'],
    slug: 'romania-corn-exports-increase',
    isNew: true,
  },
  {
    id: '3',
    title: 'Black Sea Barley Trade Analysis',
    summary: 'Comprehensive analysis of barley trading patterns in the Black Sea region shows shifting demand from Asia.',
    body: 'Extended body content here...',
    dateISO: '2024-03-13T11:15:00Z',
    tags: ['Barley', 'Black Sea', 'Trade'],
    slug: 'black-sea-barley-analysis',
  },
  {
    id: '4',
    title: 'DG AGRI Weekly Price Report',
    summary: 'EU grain prices show mixed signals with wheat down 1.2% while corn maintains steady levels across member states.',
    body: 'Extended body content here...',
    dateISO: '2024-03-12T16:00:00Z',
    tags: ['EU', 'Prices', 'Weekly'],
    slug: 'dg-agri-weekly-prices',
  },
];

// Mock Constanta Port Data for the legacy table
export const mockConstantaData: ConstantaRow[] = [
  {
    id: '1',
    date: '2024-03-15',
    commodity: 'Wheat',
    grade: 'Feed',
    basis: 'FOB',
    deliveryWindow: 'Mar 20-25',
    location: 'Constanta',
    price: 235,
    currency: 'EUR',
    quotationType: 'Ask',
    volume: 5000,
    source: 'Local Trader',
    notes: 'Premium quality',
  },
  {
    id: '2',
    date: '2024-03-15',
    commodity: 'Corn',
    grade: '#2',
    basis: 'CIF',
    deliveryWindow: 'Mar 18-22',
    location: 'Constanta',
    price: 205,
    currency: 'EUR',
    quotationType: 'Bid',
    volume: 10000,
    source: 'Export Terminal',
  },
  {
    id: '3',
    date: '2024-03-14',
    commodity: 'Barley',
    grade: 'Malting',
    basis: 'EXW',
    deliveryWindow: 'Apr 1-5',
    location: 'Constanta',
    price: 220,
    currency: 'EUR',
    quotationType: 'Last',
    volume: 3000,
    source: 'Producer',
    notes: 'High protein',
  },
];

// Port Constanta Vessel Data
export const mockVesselData: VesselData[] = [
  {
    "id": 1,
    "vessel_name": "MV Black Sea",
    "status": "Loading",
    "departure_country": "Romania",
    "departure_port": "Constanța",
    "departure_terminal": "Terminal 1",
    "destination_country": "Egypt",
    "operation_type": "Export",
    "operation_completed": "2025-09-12",
    "commodity_description": "Wheat",
    "shipper": "AgriTrans",
    "cargo_origin_1": "Dolj",
    "cargo_origin_2": "Teleorman"
  },
  {
    "id": 2,
    "vessel_name": "MV Danube Star",
    "status": "Loaded",
    "departure_country": "Romania",
    "departure_port": "Constanța",
    "departure_terminal": "Terminal 3",
    "destination_country": "Italy",
    "operation_type": "Export",
    "operation_completed": "2025-09-08",
    "commodity_description": "Corn",
    "shipper": "BlackSea Commodities",
    "cargo_origin_1": "Ialomița",
    "cargo_origin_2": "Călărași"
  },
  {
    "id": 3,
    "vessel_name": "MV Meridian",
    "status": "In Transit",
    "departure_country": "Romania",
    "departure_port": "Constanța",
    "departure_terminal": "Terminal 2",
    "destination_country": "Spain",
    "operation_type": "Export",
    "operation_completed": "2025-08-28",
    "commodity_description": "Barley",
    "shipper": "Danube Exports",
    "cargo_origin_1": "Constanța",
    "cargo_origin_2": "Tulcea"
  },
  {
    "id": 4,
    "vessel_name": "MV Blue Horizon",
    "status": "Discharged",
    "departure_country": "Romania",
    "departure_port": "Constanța",
    "departure_terminal": "Terminal 5",
    "destination_country": "Greece",
    "operation_type": "Export",
    "operation_completed": "2025-09-05",
    "commodity_description": "Sunflower Seeds",
    "shipper": "AgroMaritime",
    "cargo_origin_1": "Buzău",
    "cargo_origin_2": "Galați"
  },
  {
    "id": 5,
    "vessel_name": "MV Amber Wave",
    "status": "Completed",
    "departure_country": "Romania",
    "departure_port": "Constanța",
    "departure_terminal": "Terminal 4",
    "destination_country": "Turkey",
    "operation_type": "Export",
    "operation_completed": "2025-08-19",
    "commodity_description": "Rapeseeds",
    "shipper": "Delta Agro",
    "cargo_origin_1": "Brăila",
    "cargo_origin_2": "Ialomița"
  },
  {
    "id": 6,
    "vessel_name": "MV Dacia",
    "status": "Loading",
    "departure_country": "Romania",
    "departure_port": "Constanța",
    "departure_terminal": "Terminal 1",
    "destination_country": "Morocco",
    "operation_type": "Export",
    "operation_completed": "2025-09-14",
    "commodity_description": "Wheat",
    "shipper": "Port Logistics",
    "cargo_origin_1": "Ilfov",
    "cargo_origin_2": "Giurgiu"
  },
  {
    "id": 7,
    "vessel_name": "MV Aurora",
    "status": "Loaded",
    "departure_country": "Romania",
    "departure_port": "Constanța",
    "departure_terminal": "Terminal 3",
    "destination_country": "Israel",
    "operation_type": "Export",
    "operation_completed": "2025-09-03",
    "commodity_description": "Corn",
    "shipper": "Delta Agro",
    "cargo_origin_1": "Călărași",
    "cargo_origin_2": "Giurgiu"
  },
  {
    "id": 8,
    "vessel_name": "MV Polaris",
    "status": "In Transit",
    "departure_country": "Romania",
    "departure_port": "Constanța",
    "departure_terminal": "Terminal 2",
    "destination_country": "Saudi Arabia",
    "operation_type": "Export",
    "operation_completed": "2025-08-31",
    "commodity_description": "Sunflower seeds meal",
    "shipper": "AgriTrans",
    "cargo_origin_1": "Timiș",
    "cargo_origin_2": "Arad"
  },
  {
    "id": 9,
    "vessel_name": "MV Horizon",
    "status": "Completed",
    "departure_country": "Romania",
    "departure_port": "Constanța",
    "departure_terminal": "Terminal 4",
    "destination_country": "Netherlands",
    "operation_type": "Export",
    "operation_completed": "2025-08-15",
    "commodity_description": "Sunflower seeds oil",
    "shipper": "BlackSea Commodities",
    "cargo_origin_1": "Dolj",
    "cargo_origin_2": "Olt"
  },
  {
    "id": 10,
    "vessel_name": "MV Danubia",
    "status": "Discharged",
    "departure_country": "Romania",
    "departure_port": "Constanța",
    "departure_terminal": "Terminal 5",
    "destination_country": "Jordan",
    "operation_type": "Export",
    "operation_completed": "2025-09-01",
    "commodity_description": "Barley",
    "shipper": "Port Logistics",
    "cargo_origin_1": "Constanța",
    "cargo_origin_2": "Tulcea"
  },
  {
    "id": 11,
    "vessel_name": "MV Liberty",
    "status": "Loading",
    "departure_country": "Romania",
    "departure_port": "Constanța",
    "departure_terminal": "Terminal 3",
    "destination_country": "Lebanon",
    "operation_type": "Export",
    "operation_completed": "2025-09-15",
    "commodity_description": "Corn",
    "shipper": "AgroMaritime",
    "cargo_origin_1": "Iași",
    "cargo_origin_2": "Vaslui"
  },
  {
    "id": 12,
    "vessel_name": "MV Carpathia",
    "status": "Completed",
    "departure_country": "Romania",
    "departure_port": "Constanța",
    "departure_terminal": "Terminal 2",
    "destination_country": "Portugal",
    "operation_type": "Export",
    "operation_completed": "2025-08-10",
    "commodity_description": "Wheat",
    "shipper": "Danube Exports",
    "cargo_origin_1": "Botoșani",
    "cargo_origin_2": "Suceava"
  },
  {
    "id": 13,
    "vessel_name": "MV Baltic Trader",
    "status": "Loading",
    "departure_country": "Ukraine",
    "departure_port": "Odessa",
    "departure_terminal": "Terminal A",
    "destination_country": "Romania",
    "operation_type": "Import",
    "operation_completed": "2025-09-18",
    "commodity_description": "Rapeseeds meal",
    "shipper": "Black Sea Imports",
    "cargo_origin_1": "Odessa",
    "cargo_origin_2": "Mykolaiv"
  },
  {
    "id": 14,
    "vessel_name": "MV Adriatic",
    "status": "In Transit",
    "departure_country": "Bulgaria",
    "departure_port": "Varna",
    "departure_terminal": "Terminal 2",
    "destination_country": "Romania",
    "operation_type": "Import",
    "operation_completed": "2025-09-16",
    "commodity_description": "Rapeseeds Oil",
    "shipper": "Adriatic Logistics",
    "cargo_origin_1": "Varna",
    "cargo_origin_2": "Burgas"
  },
  {
    "id": 15,
    "vessel_name": "MV Sea Pioneer",
    "status": "Discharged",
    "departure_country": "Turkey",
    "departure_port": "Samsun",
    "departure_terminal": "Terminal 1",
    "destination_country": "Romania",
    "operation_type": "Import",
    "operation_completed": "2025-09-10",
    "commodity_description": "Fertilizers",
    "shipper": "Eastern Trade Co",
    "cargo_origin_1": "Samsun",
    "cargo_origin_2": "Trabzon"
  },
  {
    "id": 16,
    "vessel_name": "MV Constanta Express",
    "status": "Completed",
    "departure_country": "Greece",
    "departure_port": "Thessaloniki",
    "departure_terminal": "Terminal B",
    "destination_country": "Romania",
    "operation_type": "Import",
    "operation_completed": "2025-08-25",
    "commodity_description": "Wheat",
    "shipper": "Mediterranean Grains",
    "cargo_origin_1": "Thessaloniki",
    "cargo_origin_2": "Kavala"
  },
  {
    "id": 17,
    "vessel_name": "MV Danube Bridge",
    "status": "Loading",
    "departure_country": "Serbia",
    "departure_port": "Novi Sad",
    "departure_terminal": "River Terminal",
    "destination_country": "Romania",
    "operation_type": "Import",
    "operation_completed": "2025-09-20",
    "commodity_description": "Corn",
    "shipper": "Danube River Transport",
    "cargo_origin_1": "Novi Sad",
    "cargo_origin_2": "Belgrade"
  }
];

// Daily Prices Data based on actual ProTrade daily indications
export const dailyPricesData = [
  { date: '2025-07-17', wheatBread: 196, wheatFeed: 191, barley: 175, corn: 178, sunflower: 465, rapeseed: 450 },
  { date: '2025-07-28', wheatBread: 195, wheatFeed: 190, barley: 179, corn: 180, sunflower: 485, rapeseed: 455 },
  { date: '2025-07-30', wheatBread: 197, wheatFeed: 191, barley: 182, corn: 181, sunflower: 485, rapeseed: 460 },
  { date: '2025-07-31', wheatBread: 198, wheatFeed: 193, barley: 183, corn: 181, sunflower: 495, rapeseed: 462 },
  { date: '2025-08-01', wheatBread: 196, wheatFeed: 191, barley: 183, corn: 182, sunflower: 499, rapeseed: null },
  { date: '2025-08-04', wheatBread: 195, wheatFeed: 190, barley: 183, corn: 182, sunflower: 501, rapeseed: null },
  { date: '2025-08-05', wheatBread: 197, wheatFeed: 192, barley: 187, corn: 185, sunflower: 503, rapeseed: null },
  { date: '2025-08-06', wheatBread: 196, wheatFeed: 190, barley: 188, corn: 183, sunflower: 503, rapeseed: 490 },
  { date: '2025-08-11', wheatBread: 197, wheatFeed: 192, barley: 193, corn: 182, sunflower: 516, rapeseed: 505 },
  { date: '2025-08-12', wheatBread: 194, wheatFeed: 189, barley: 191, corn: 185, sunflower: 516, rapeseed: 505 },
  { date: '2025-08-13', wheatBread: 193, wheatFeed: 188, barley: 190, corn: 181, sunflower: 520, rapeseed: null },
  { date: '2025-08-14', wheatBread: 195, wheatFeed: 190, barley: 190, corn: 182, sunflower: 520, rapeseed: null },
  { date: '2025-08-26', wheatBread: 192, wheatFeed: 187, barley: 191, corn: 187, sunflower: 555, rapeseed: null },
  { date: '2025-08-27', wheatBread: 193, wheatFeed: 188, barley: 193, corn: 184, sunflower: 555, rapeseed: null },
  { date: '2025-09-02', wheatBread: 188, wheatFeed: 183, barley: 189, corn: 187, sunflower: 580, rapeseed: 550 },
  { date: '2025-09-03', wheatBread: 187, wheatFeed: 182, barley: 186, corn: 187, sunflower: 575, rapeseed: 550 },
  { date: '2025-09-04', wheatBread: 186, wheatFeed: 181, barley: 185, corn: 188, sunflower: 585, rapeseed: 560 },
  { date: '2025-09-05', wheatBread: 187, wheatFeed: 182, barley: 186, corn: 188, sunflower: 580, rapeseed: 550 },
  { date: '2025-09-08', wheatBread: 186, wheatFeed: 181, barley: 186, corn: 187, sunflower: 575, rapeseed: 545 },
  { date: '2025-09-09', wheatBread: 186, wheatFeed: 181, barley: 186, corn: 187, sunflower: 575, rapeseed: 545 },
  { date: '2025-09-12', wheatBread: 188, wheatFeed: 183, barley: 180, corn: 189, sunflower: 570, rapeseed: 540 },
  { date: '2025-09-15', wheatBread: 189, wheatFeed: 184, barley: 188, corn: 189, sunflower: 569, rapeseed: 540 },
  { date: '2025-09-16', wheatBread: 189, wheatFeed: 184, barley: 188, corn: 189, sunflower: 571, rapeseed: 545 },
  { date: '2025-09-17', wheatBread: 189, wheatFeed: 184, barley: 188, corn: 189, sunflower: 579, rapeseed: 550 }
];

// Convert dailyPricesData to the format expected by mockPricesData
export const mockPricesData: Record<string, PriceData[]> = {
  'wheatBread': dailyPricesData.map(item => ({
    date: item.date,
    open: item.wheatBread,
    high: item.wheatBread * 1.02,
    low: item.wheatBread * 0.98,
    close: item.wheatBread,
    volume: Math.floor(Math.random() * 50000) + 10000,
  })),
  'wheatFeed': dailyPricesData.map(item => ({
    date: item.date,
    open: item.wheatFeed,
    high: item.wheatFeed * 1.02,
    low: item.wheatFeed * 0.98,
    close: item.wheatFeed,
    volume: Math.floor(Math.random() * 50000) + 10000,
  })),
  'barley': dailyPricesData.map(item => ({
    date: item.date,
    open: item.barley,
    high: item.barley * 1.02,
    low: item.barley * 0.98,
    close: item.barley,
    volume: Math.floor(Math.random() * 50000) + 10000,
  })),
  'corn': dailyPricesData.map(item => ({
    date: item.date,
    open: item.corn,
    high: item.corn * 1.02,
    low: item.corn * 0.98,
    close: item.corn,
    volume: Math.floor(Math.random() * 50000) + 10000,
  })),
  'sunflower': dailyPricesData.map(item => ({
    date: item.date,
    open: item.sunflower,
    high: item.sunflower * 1.02,
    low: item.sunflower * 0.98,
    close: item.sunflower,
    volume: Math.floor(Math.random() * 50000) + 10000,
  })),
  'rapeseed': dailyPricesData.filter(item => item.rapeseed !== null).map(item => ({
    date: item.date,
    open: item.rapeseed!,
    high: item.rapeseed! * 1.02,
    low: item.rapeseed! * 0.98,
    close: item.rapeseed!,
    volume: Math.floor(Math.random() * 50000) + 10000,
  })),
  // Keep the original futures data for comparison
  'WHEAT-CBOT': generateMockPriceData(250, 280),
  'CORN-CBOT': generateMockPriceData(420, 450),
  'WHEAT-MATIF': generateMockPriceData(240, 270),
  'CORN-MATIF': generateMockPriceData(200, 220),
  'SFS_FOB': generateMockPriceData(550, 590),
};

function generateMockPriceData(basePrice: number, maxPrice: number): PriceData[] {
  const data: PriceData[] = [];
  const days = 365;
  let currentPrice = basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const volatility = 0.02;
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    const open = currentPrice;
    const close = Math.max(basePrice * 0.8, Math.min(maxPrice, currentPrice + change));
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.floor(Math.random() * 100000) + 10000,
    });

    currentPrice = close;
  }

  return data;
}

// CFTC/COT Net Position Data - 8 weeks of data with 7-day cadence
export const mockCOTData: Record<string, any[]> = {
  'CBOT Wheat': [
    { date: '20.08.2025', price: -4261 },
    { date: '27.08.2025', price: 20818 },
    { date: '02.09.2025', price: 11964 },
    { date: '09.09.2025', price: -14714 },
    { date: '16.09.2025', price: -2287 },
    { date: '23.09.2025', price: -29302 },
    { date: '30.09.2025', price: -15432 },
    { date: '07.10.2025', price: 8956 }
  ],
  'CBOT Corn': [
    { date: '20.08.2025', price: 125430 },
    { date: '27.08.2025', price: 138920 },
    { date: '02.09.2025', price: 142560 },
    { date: '09.09.2025', price: 135670 },
    { date: '16.09.2025', price: 128340 },
    { date: '23.09.2025', price: 119230 },
    { date: '30.09.2025', price: 132450 },
    { date: '07.10.2025', price: 145670 }
  ],
  'CBOT Soybean': [
    { date: '20.08.2025', price: -4261 },
    { date: '27.08.2025', price: 20818 },
    { date: '02.09.2025', price: 11964 },
    { date: '09.09.2025', price: -14714 },
    { date: '16.09.2025', price: -2287 },
    { date: '23.09.2025', price: -29302 },
    { date: '30.09.2025', price: -18560 },
    { date: '07.10.2025', price: 12340 }
  ],
  'Euronext Wheat': [
    { date: '20.08.2025', price: 45670 },
    { date: '27.08.2025', price: 52340 },
    { date: '02.09.2025', price: 48920 },
    { date: '09.09.2025', price: 51230 },
    { date: '16.09.2025', price: 47890 },
    { date: '23.09.2025', price: 44560 },
    { date: '30.09.2025', price: 49780 },
    { date: '07.10.2025', price: 53120 }
  ],
  'Euronext Corn': [
    { date: '20.08.2025', price: 32450 },
    { date: '27.08.2025', price: 38670 },
    { date: '02.09.2025', price: 41230 },
    { date: '09.09.2025', price: 39890 },
    { date: '16.09.2025', price: 35670 },
    { date: '23.09.2025', price: 33210 },
    { date: '30.09.2025', price: 37450 },
    { date: '07.10.2025', price: 40890 }
  ],
  'Euronext RPS': [
    { date: '20.08.2025', price: 23450 },
    { date: '27.08.2025', price: 28670 },
    { date: '02.09.2025', price: 31230 },
    { date: '09.09.2025', price: 29560 },
    { date: '16.09.2025', price: 26780 },
    { date: '23.09.2025', price: 24890 },
    { date: '30.09.2025', price: 27340 },
    { date: '07.10.2025', price: 30120 }
  ],
  'CBOT Soy Oil': [
    { date: '20.08.2025', price: 15670 },
    { date: '27.08.2025', price: 18920 },
    { date: '02.09.2025', price: 21450 },
    { date: '09.09.2025', price: 19780 },
    { date: '16.09.2025', price: 17230 },
    { date: '23.09.2025', price: 15890 },
    { date: '30.09.2025', price: 18340 },
    { date: '07.10.2025', price: 20560 }
  ]
};

function generateMockCOTData(): COTData[] {
  const data: COTData[] = [];
  const weeks = 52;
  
  for (let i = weeks; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    
    data.push({
      date: date.toISOString().split('T')[0],
      managedMoney: Math.floor(Math.random() * 100000) - 50000,
      commercial: Math.floor(Math.random() * 80000) - 40000,
      others: Math.floor(Math.random() * 30000) - 15000,
      openInterest: Math.floor(Math.random() * 500000) + 200000,
    });
  }
  
  return data;
}

// Mock DG AGRI Trade Data (Current Year)
export const mockDGAgriData: Record<string, any[]> = {
  'EU Wheat Export': [
    { country: 'Romania', value: 1978033, period: '01.07.25-16.09.2025' },
    { country: 'Lithuania', value: 521169, period: '01.07.25-16.09.2025' },
    { country: 'Germany', value: 397806, period: '01.07.25-16.09.2025' },
    { country: 'Poland', value: 320971, period: '01.07.25-16.09.2025' },
    { country: 'Bulgaria', value: 240044, period: '01.07.25-16.09.2025' },
    { country: 'France', value: 0, period: '01.07.25-16.09.2025' },
  ],
  'Wheat Import': [
    { country: 'Ukraine', value: 328709, period: '01.07.25-16.09.2025' },
    { country: 'Canada', value: 322925, period: '01.07.25-16.09.2025' },
    { country: 'Serbia', value: 137052, period: '01.07.25-16.09.2025' },
    { country: 'Moldova', value: 132219, period: '01.07.25-16.09.2025' },
    { country: 'SUA', value: 25541, period: '01.07.25-16.09.2025' },
  ],
  'Corn Import': [
    { country: 'Brazil', value: 1227778, period: '01.07.25-16.09.2025' },
    { country: 'Ukraine', value: 653628, period: '01.07.25-16.09.2025' },
    { country: 'SUA', value: 316914, period: '01.07.25-16.09.2025' },
    { country: 'Canada', value: 230798, period: '01.07.25-16.09.2025' },
    { country: 'Argentina', value: 41270, period: '01.07.25-16.09.2025' },
  ],
  'Romania RPS Export': [
    { country: 'RPS Export', value: 32371, period: '01.07.24-YTD' },
    { country: 'RPS Import', value: 57781, period: '01.07.24-YTD' },
    { country: 'SFS Export Extra EU', value: 950000, period: '01.07.24-YTD' },
    { country: 'SFS Import', value: 123021, period: '01.07.24-YTD' },
  ],
  'Romania Export': [
    { country: 'Wheat', value: 2175565, period: 'Export 01.07-YTD' },
    { country: 'Corn', value: 120670, period: 'Export 01.07-YTD' },
    { country: 'Sunflowerseeds', value: 980000, period: 'Export 01.07-YTD' },
    { country: 'Barley', value: 947581, period: 'Export 01.07-YTD' },
    { country: 'Rapeseeds', value: 163165, period: 'Export 01.07-YTD' },
    { country: 'SFS Oil', value: 81303, period: 'Export 01.07-YTD' },
  ],
  'EU Grains Export': [
    { country: 'Romania', value: 3192752, period: '01.07.25-16.09.2025' },
    { country: 'Germany', value: 454477, period: '01.07.25-16.09.2025' },
    { country: 'Lithuania', value: 436789, period: '01.07.25-16.09.2025' },
    { country: 'Bulgaria', value: 330592, period: '01.07.25-16.09.2025' },
    { country: 'Poland', value: 261050, period: '01.07.25-16.09.2025' },
    { country: 'France', value: 0, period: '01.07.25-16.09.2025' },
  ],
  'EU Corn Export': [
    { country: 'Romania', value: 34350, period: '01.07.25-16.09.2025' },
    { country: 'Poland', value: 7535, period: '01.07.25-16.09.2025' },
    { country: 'Bulgaria', value: 2517, period: '01.07.25-16.09.2025' },
    { country: 'Germany', value: 1327, period: '01.07.25-16.09.2025' },
    { country: 'France', value: 0, period: '01.07.25-16.09.2025' },
    { country: 'Lithuania', value: 0, period: '01.07.25-16.09.2025' },
  ],
  'Barley Export': [
    { country: 'Romania', value: 1419080, period: '01.07.25-16.09.2025' },
    { country: 'Bulgaria', value: 144162, period: '01.07.25-16.09.2025' },
    { country: 'Germany', value: 96514, period: '01.07.25-16.09.2025' },
    { country: 'Lithuania', value: 32160, period: '01.07.25-16.09.2025' },
    { country: 'Poland', value: 801, period: '01.07.25-16.09.2025' },
    { country: 'France', value: 0, period: '01.07.25-16.09.2025' },
  ],
  'Soybean Import': [
    { country: 'Brazil', value: 1625089, period: '01.07.25-16.09.2025' },
    { country: 'USA', value: 622840, period: '01.07.25-16.09.2025' },
    { country: 'Ukraine', value: 319363, period: '01.07.25-16.09.2025' },
    { country: 'Canada', value: 76758, period: '01.07.25-16.09.2025' },
    { country: 'Togo', value: 16169, period: '01.07.25-16.09.2025' },
  ],
  'Barley Import': [
    { country: 'Ukraine', value: 285420, period: '01.07.25-16.09.2025' },
    { country: 'Russia', value: 198650, period: '01.07.25-16.09.2025' },
    { country: 'Serbia', value: 125340, period: '01.07.25-16.09.2025' },
    { country: 'Australia', value: 89560, period: '01.07.25-16.09.2025' },
    { country: 'Argentina', value: 45230, period: '01.07.25-16.09.2025' },
  ],
  'Rapeseed Export': [
    { country: 'Romania', value: 163165, period: '01.07.25-16.09.2025' },
    { country: 'France', value: 456780, period: '01.07.25-16.09.2025' },
    { country: 'Germany', value: 387650, period: '01.07.25-16.09.2025' },
    { country: 'Poland', value: 234560, period: '01.07.25-16.09.2025' },
    { country: 'Czech Republic', value: 145890, period: '01.07.25-16.09.2025' },
  ],
  'Rapeseed Import': [
    { country: 'Ukraine', value: 456780, period: '01.07.25-16.09.2025' },
    { country: 'Australia', value: 298450, period: '01.07.25-16.09.2025' },
    { country: 'Canada', value: 187560, period: '01.07.25-16.09.2025' },
    { country: 'Belarus', value: 123890, period: '01.07.25-16.09.2025' },
    { country: 'Serbia', value: 76540, period: '01.07.25-16.09.2025' },
  ],
  'Sunflower Export': [
    { country: 'Romania', value: 980000, period: '01.07.25-16.09.2025' },
    { country: 'Bulgaria', value: 654320, period: '01.07.25-16.09.2025' },
    { country: 'Hungary', value: 423670, period: '01.07.25-16.09.2025' },
    { country: 'France', value: 267890, period: '01.07.25-16.09.2025' },
    { country: 'Slovakia', value: 145230, period: '01.07.25-16.09.2025' },
  ],
  'Sunflower Import': [
    { country: 'Ukraine', value: 1245600, period: '01.07.25-16.09.2025' },
    { country: 'Russia', value: 876540, period: '01.07.25-16.09.2025' },
    { country: 'Argentina', value: 234560, period: '01.07.25-16.09.2025' },
    { country: 'Serbia', value: 187430, period: '01.07.25-16.09.2025' },
    { country: 'Turkey', value: 123450, period: '01.07.25-16.09.2025' },
  ],
  'Rapeseed Oil Export': [
    { country: 'Germany', value: 567890, period: '01.07.25-16.09.2025' },
    { country: 'Netherlands', value: 456320, period: '01.07.25-16.09.2025' },
    { country: 'Belgium', value: 334560, period: '01.07.25-16.09.2025' },
    { country: 'Poland', value: 278940, period: '01.07.25-16.09.2025' },
    { country: 'France', value: 198760, period: '01.07.25-16.09.2025' },
  ],
  'Rapeseed Oil Import': [
    { country: 'Ukraine', value: 398760, period: '01.07.25-16.09.2025' },
    { country: 'Canada', value: 287650, period: '01.07.25-16.09.2025' },
    { country: 'Australia', value: 198450, period: '01.07.25-16.09.2025' },
    { country: 'Russia', value: 156340, period: '01.07.25-16.09.2025' },
    { country: 'India', value: 98760, period: '01.07.25-16.09.2025' },
  ],
  'Sunflower Oil Export': [
    { country: 'Romania', value: 345670, period: '01.07.25-16.09.2025' },
    { country: 'Bulgaria', value: 289540, period: '01.07.25-16.09.2025' },
    { country: 'Hungary', value: 198760, period: '01.07.25-16.09.2025' },
    { country: 'Netherlands', value: 156890, period: '01.07.25-16.09.2025' },
    { country: 'Germany', value: 123450, period: '01.07.25-16.09.2025' },
  ],
  'Sunflower Oil Import': [
    { country: 'Ukraine', value: 1876540, period: '01.07.25-16.09.2025' },
    { country: 'Russia', value: 1234560, period: '01.07.25-16.09.2025' },
    { country: 'Argentina', value: 456780, period: '01.07.25-16.09.2025' },
    { country: 'Turkey', value: 298760, period: '01.07.25-16.09.2025' },
    { country: 'India', value: 187650, period: '01.07.25-16.09.2025' },
  ],
  'Soybeans Export': [
    { country: 'Romania', value: 45670, period: '01.07.25-16.09.2025' },
    { country: 'France', value: 123450, period: '01.07.25-16.09.2025' },
    { country: 'Italy', value: 87650, period: '01.07.25-16.09.2025' },
    { country: 'Hungary', value: 56780, period: '01.07.25-16.09.2025' },
    { country: 'Austria', value: 34560, period: '01.07.25-16.09.2025' },
  ],
  'Soybeans Import': [
    { country: 'Brazil', value: 1834560, period: '01.07.25-16.09.2025' },
    { country: 'USA', value: 987650, period: '01.07.25-16.09.2025' },
    { country: 'Argentina', value: 456780, period: '01.07.25-16.09.2025' },
    { country: 'Ukraine', value: 234560, period: '01.07.25-16.09.2025' },
    { country: 'Canada', value: 178650, period: '01.07.25-16.09.2025' },
  ],
  'Soy Oil Export': [
    { country: 'Romania', value: 78900, period: '01.07.25-16.09.2025' },
    { country: 'Netherlands', value: 234560, period: '01.07.25-16.09.2025' },
    { country: 'Germany', value: 198760, period: '01.07.25-16.09.2025' },
    { country: 'Belgium', value: 145670, period: '01.07.25-16.09.2025' },
    { country: 'Poland', value: 98760, period: '01.07.25-16.09.2025' },
  ],
  'Soy Oil Import': [
    { country: 'Argentina', value: 876540, period: '01.07.25-16.09.2025' },
    { country: 'Brazil', value: 654320, period: '01.07.25-16.09.2025' },
    { country: 'USA', value: 345670, period: '01.07.25-16.09.2025' },
    { country: 'Paraguay', value: 198760, period: '01.07.25-16.09.2025' },
    { country: 'Ukraine', value: 123450, period: '01.07.25-16.09.2025' },
  ],
  'RPS Meal Export': [
    { country: 'Romania', value: 65430, period: '01.07.25-16.09.2025' },
    { country: 'Germany', value: 187650, period: '01.07.25-16.09.2025' },
    { country: 'France', value: 156780, period: '01.07.25-16.09.2025' },
    { country: 'Poland', value: 98760, period: '01.07.25-16.09.2025' },
    { country: 'Netherlands', value: 76540, period: '01.07.25-16.09.2025' },
  ],
  'RPS Meal Import': [
    { country: 'India', value: 234560, period: '01.07.25-16.09.2025' },
    { country: 'Canada', value: 198760, period: '01.07.25-16.09.2025' },
    { country: 'Australia', value: 123450, period: '01.07.25-16.09.2025' },
    { country: 'Ukraine', value: 87650, period: '01.07.25-16.09.2025' },
    { country: 'Kazakhstan', value: 56780, period: '01.07.25-16.09.2025' },
  ],
  'SFS Meal Export': [
    { country: 'Romania', value: 98760, period: '01.07.25-16.09.2025' },
    { country: 'Bulgaria', value: 167890, period: '01.07.25-16.09.2025' },
    { country: 'Hungary', value: 123450, period: '01.07.25-16.09.2025' },
    { country: 'France', value: 87650, period: '01.07.25-16.09.2025' },
    { country: 'Poland', value: 54320, period: '01.07.25-16.09.2025' },
  ],
  'SFS Meal Import': [
    { country: 'Ukraine', value: 345670, period: '01.07.25-16.09.2025' },
    { country: 'Russia', value: 234560, period: '01.07.25-16.09.2025' },
    { country: 'Argentina', value: 123450, period: '01.07.25-16.09.2025' },
    { country: 'Turkey', value: 98760, period: '01.07.25-16.09.2025' },
    { country: 'Serbia', value: 67890, period: '01.07.25-16.09.2025' },
  ],
  'Soy Meal Export': [
    { country: 'Romania', value: 87650, period: '01.07.25-16.09.2025' },
    { country: 'Netherlands', value: 298760, period: '01.07.25-16.09.2025' },
    { country: 'Germany', value: 234560, period: '01.07.25-16.09.2025' },
    { country: 'Spain', value: 176540, period: '01.07.25-16.09.2025' },
    { country: 'Italy', value: 123450, period: '01.07.25-16.09.2025' },
  ],
  'Soy Meal Import': [
    { country: 'Argentina', value: 1234560, period: '01.07.25-16.09.2025' },
    { country: 'Brazil', value: 987650, period: '01.07.25-16.09.2025' },
    { country: 'USA', value: 567890, period: '01.07.25-16.09.2025' },
    { country: 'Paraguay', value: 234560, period: '01.07.25-16.09.2025' },
    { country: 'India', value: 156780, period: '01.07.25-16.09.2025' },
  ],
};

// Mock DG AGRI Trade Data (Last Year - for comparison)
export const mockDGAgriDataLastYear: Record<string, any[]> = {
  'EU Wheat Export': [
    { country: 'Romania', value: 1756820, period: '01.07.24-16.09.2024' },
    { country: 'Lithuania', value: 468950, period: '01.07.24-16.09.2024' },
    { country: 'Germany', value: 356780, period: '01.07.24-16.09.2024' },
    { country: 'Poland', value: 287650, period: '01.07.24-16.09.2024' },
    { country: 'Bulgaria', value: 215430, period: '01.07.24-16.09.2024' },
    { country: 'France', value: 0, period: '01.07.24-16.09.2024' },
  ],
  'Wheat Import': [
    { country: 'Ukraine', value: 294560, period: '01.07.24-16.09.2024' },
    { country: 'Canada', value: 289340, period: '01.07.24-16.09.2024' },
    { country: 'Serbia', value: 122870, period: '01.07.24-16.09.2024' },
    { country: 'Moldova', value: 118560, period: '01.07.24-16.09.2024' },
    { country: 'SUA', value: 22890, period: '01.07.24-16.09.2024' },
  ],
  'Corn Import': [
    { country: 'Brazil', value: 1098760, period: '01.07.24-16.09.2024' },
    { country: 'Ukraine', value: 585430, period: '01.07.24-16.09.2024' },
    { country: 'SUA', value: 283890, period: '01.07.24-16.09.2024' },
    { country: 'Canada', value: 206780, period: '01.07.24-16.09.2024' },
    { country: 'Argentina', value: 36980, period: '01.07.24-16.09.2024' },
  ],
  'Romania RPS Export': [
    { country: 'RPS Export', value: 28970, period: '01.07.23-YTD' },
    { country: 'RPS Import', value: 51760, period: '01.07.23-YTD' },
    { country: 'SFS Export Extra EU', value: 851000, period: '01.07.23-YTD' },
    { country: 'SFS Import', value: 110230, period: '01.07.23-YTD' },
  ],
  'Romania Export': [
    { country: 'Wheat', value: 1948960, period: 'Export 01.07-YTD' },
    { country: 'Corn', value: 108120, period: 'Export 01.07-YTD' },
    { country: 'Sunflowerseeds', value: 877000, period: 'Export 01.07-YTD' },
    { country: 'Barley', value: 848790, period: 'Export 01.07-YTD' },
    { country: 'Rapeseeds', value: 146230, period: 'Export 01.07-YTD' },
    { country: 'SFS Oil', value: 72870, period: 'Export 01.07-YTD' },
  ],
  'EU Grains Export': [
    { country: 'Romania', value: 2859870, period: '01.07.24-16.09.2024' },
    { country: 'Germany', value: 407120, period: '01.07.24-16.09.2024' },
    { country: 'Lithuania', value: 391230, period: '01.07.24-16.09.2024' },
    { country: 'Bulgaria', value: 296340, period: '01.07.24-16.09.2024' },
    { country: 'Poland', value: 233890, period: '01.07.24-16.09.2024' },
    { country: 'France', value: 0, period: '01.07.24-16.09.2024' },
  ],
  'EU Corn Export': [
    { country: 'Romania', value: 30780, period: '01.07.24-16.09.2024' },
    { country: 'Poland', value: 6750, period: '01.07.24-16.09.2024' },
    { country: 'Bulgaria', value: 2256, period: '01.07.24-16.09.2024' },
    { country: 'Germany', value: 1189, period: '01.07.24-16.09.2024' },
    { country: 'France', value: 0, period: '01.07.24-16.09.2024' },
    { country: 'Lithuania', value: 0, period: '01.07.24-16.09.2024' },
  ],
  'Barley Export': [
    { country: 'Romania', value: 1271230, period: '01.07.24-16.09.2024' },
    { country: 'Bulgaria', value: 129120, period: '01.07.24-16.09.2024' },
    { country: 'Germany', value: 86450, period: '01.07.24-16.09.2024' },
    { country: 'Lithuania', value: 28810, period: '01.07.24-16.09.2024' },
    { country: 'Poland', value: 718, period: '01.07.24-16.09.2024' },
    { country: 'France', value: 0, period: '01.07.24-16.09.2024' },
  ],
  'Barley Import': [
    { country: 'Ukraine', value: 255670, period: '01.07.24-16.09.2024' },
    { country: 'Russia', value: 177890, period: '01.07.24-16.09.2024' },
    { country: 'Serbia', value: 112290, period: '01.07.24-16.09.2024' },
    { country: 'Australia', value: 80230, period: '01.07.24-16.09.2024' },
    { country: 'Argentina', value: 40520, period: '01.07.24-16.09.2024' },
  ],
  'Rapeseed Export': [
    { country: 'Romania', value: 146230, period: '01.07.24-16.09.2024' },
    { country: 'France', value: 409340, period: '01.07.24-16.09.2024' },
    { country: 'Germany', value: 347560, period: '01.07.24-16.09.2024' },
    { country: 'Poland', value: 210120, period: '01.07.24-16.09.2024' },
    { country: 'Czech Republic', value: 130780, period: '01.07.24-16.09.2024' },
  ],
  'Rapeseed Import': [
    { country: 'Ukraine', value: 409340, period: '01.07.24-16.09.2024' },
    { country: 'Australia', value: 267560, period: '01.07.24-16.09.2024' },
    { country: 'Canada', value: 168120, period: '01.07.24-16.09.2024' },
    { country: 'Belarus', value: 111010, period: '01.07.24-16.09.2024' },
    { country: 'Serbia', value: 68650, period: '01.07.24-16.09.2024' },
  ],
  'Sunflower Export': [
    { country: 'Romania', value: 877000, period: '01.07.24-16.09.2024' },
    { country: 'Bulgaria', value: 586450, period: '01.07.24-16.09.2024' },
    { country: 'Hungary', value: 379670, period: '01.07.24-16.09.2024' },
    { country: 'France', value: 240010, period: '01.07.24-16.09.2024' },
    { country: 'Slovakia', value: 130120, period: '01.07.24-16.09.2024' },
  ],
  'Sunflower Import': [
    { country: 'Ukraine', value: 1116780, period: '01.07.24-16.09.2024' },
    { country: 'Russia', value: 785670, period: '01.07.24-16.09.2024' },
    { country: 'Argentina', value: 210230, period: '01.07.24-16.09.2024' },
    { country: 'Serbia', value: 168010, period: '01.07.24-16.09.2024' },
    { country: 'Turkey', value: 110670, period: '01.07.24-16.09.2024' },
  ],
  'Rapeseed Oil Export': [
    { country: 'Germany', value: 509120, period: '01.07.24-16.09.2024' },
    { country: 'Netherlands', value: 409010, period: '01.07.24-16.09.2024' },
    { country: 'Belgium', value: 299780, period: '01.07.24-16.09.2024' },
    { country: 'Poland', value: 250010, period: '01.07.24-16.09.2024' },
    { country: 'France', value: 178120, period: '01.07.24-16.09.2024' },
  ],
  'Rapeseed Oil Import': [
    { country: 'Ukraine', value: 357120, period: '01.07.24-16.09.2024' },
    { country: 'Canada', value: 257890, period: '01.07.24-16.09.2024' },
    { country: 'Australia', value: 177890, period: '01.07.24-16.09.2024' },
    { country: 'Russia', value: 140120, period: '01.07.24-16.09.2024' },
    { country: 'India', value: 88560, period: '01.07.24-16.09.2024' },
  ],
  'Sunflower Oil Export': [
    { country: 'Romania', value: 310010, period: '01.07.24-16.09.2024' },
    { country: 'Bulgaria', value: 259670, period: '01.07.24-16.09.2024' },
    { country: 'Hungary', value: 178120, period: '01.07.24-16.09.2024' },
    { country: 'Netherlands', value: 140560, period: '01.07.24-16.09.2024' },
    { country: 'Germany', value: 110670, period: '01.07.24-16.09.2024' },
  ],
  'Sunflower Oil Import': [
    { country: 'Ukraine', value: 1682340, period: '01.07.24-16.09.2024' },
    { country: 'Russia', value: 1106780, period: '01.07.24-16.09.2024' },
    { country: 'Argentina', value: 409340, period: '01.07.24-16.09.2024' },
    { country: 'Turkey', value: 267890, period: '01.07.24-16.09.2024' },
    { country: 'India', value: 168120, period: '01.07.24-16.09.2024' },
  ],
  'Soybean Import': [
    { country: 'Brazil', value: 1456780, period: '01.07.24-16.09.2024' },
    { country: 'USA', value: 558340, period: '01.07.24-16.09.2024' },
    { country: 'Ukraine', value: 286120, period: '01.07.24-16.09.2024' },
    { country: 'Canada', value: 68780, period: '01.07.24-16.09.2024' },
    { country: 'Togo', value: 14490, period: '01.07.24-16.09.2024' },
  ],
  'Soybeans Export': [
    { country: 'Romania', value: 40890, period: '01.07.24-16.09.2024' },
    { country: 'France', value: 110560, period: '01.07.24-16.09.2024' },
    { country: 'Italy', value: 78450, period: '01.07.24-16.09.2024' },
    { country: 'Hungary', value: 50890, period: '01.07.24-16.09.2024' },
    { country: 'Austria', value: 30980, period: '01.07.24-16.09.2024' },
  ],
  'Soybeans Import': [
    { country: 'Brazil', value: 1645670, period: '01.07.24-16.09.2024' },
    { country: 'USA', value: 885430, period: '01.07.24-16.09.2024' },
    { country: 'Argentina', value: 409340, period: '01.07.24-16.09.2024' },
    { country: 'Ukraine', value: 210230, period: '01.07.24-16.09.2024' },
    { country: 'Canada', value: 160120, period: '01.07.24-16.09.2024' },
  ],
  'Soy Oil Export': [
    { country: 'Romania', value: 70670, period: '01.07.24-16.09.2024' },
    { country: 'Netherlands', value: 210120, period: '01.07.24-16.09.2024' },
    { country: 'Germany', value: 178010, period: '01.07.24-16.09.2024' },
    { country: 'Belgium', value: 130560, period: '01.07.24-16.09.2024' },
    { country: 'Poland', value: 88450, period: '01.07.24-16.09.2024' },
  ],
  'Soy Oil Import': [
    { country: 'Argentina', value: 785670, period: '01.07.24-16.09.2024' },
    { country: 'Brazil', value: 586780, period: '01.07.24-16.09.2024' },
    { country: 'USA', value: 309890, period: '01.07.24-16.09.2024' },
    { country: 'Paraguay', value: 178010, period: '01.07.24-16.09.2024' },
    { country: 'Ukraine', value: 110560, period: '01.07.24-16.09.2024' },
  ],
  'RPS Meal Export': [
    { country: 'Romania', value: 58670, period: '01.07.24-16.09.2024' },
    { country: 'Germany', value: 168120, period: '01.07.24-16.09.2024' },
    { country: 'France', value: 140560, period: '01.07.24-16.09.2024' },
    { country: 'Poland', value: 88450, period: '01.07.24-16.09.2024' },
    { country: 'Netherlands', value: 68670, period: '01.07.24-16.09.2024' },
  ],
  'RPS Meal Import': [
    { country: 'India', value: 210230, period: '01.07.24-16.09.2024' },
    { country: 'Canada', value: 178010, period: '01.07.24-16.09.2024' },
    { country: 'Australia', value: 110560, period: '01.07.24-16.09.2024' },
    { country: 'Ukraine', value: 78450, period: '01.07.24-16.09.2024' },
    { country: 'Kazakhstan', value: 50890, period: '01.07.24-16.09.2024' },
  ],
  'SFS Meal Export': [
    { country: 'Romania', value: 88450, period: '01.07.24-16.09.2024' },
    { country: 'Bulgaria', value: 150340, period: '01.07.24-16.09.2024' },
    { country: 'Hungary', value: 110560, period: '01.07.24-16.09.2024' },
    { country: 'France', value: 78450, period: '01.07.24-16.09.2024' },
    { country: 'Poland', value: 48670, period: '01.07.24-16.09.2024' },
  ],
  'SFS Meal Import': [
    { country: 'Ukraine', value: 309890, period: '01.07.24-16.09.2024' },
    { country: 'Russia', value: 210230, period: '01.07.24-16.09.2024' },
    { country: 'Argentina', value: 110560, period: '01.07.24-16.09.2024' },
    { country: 'Turkey', value: 88450, period: '01.07.24-16.09.2024' },
    { country: 'Serbia', value: 60890, period: '01.07.24-16.09.2024' },
  ],
  'Soy Meal Export': [
    { country: 'Romania', value: 78450, period: '01.07.24-16.09.2024' },
    { country: 'Netherlands', value: 267890, period: '01.07.24-16.09.2024' },
    { country: 'Germany', value: 210230, period: '01.07.24-16.09.2024' },
    { country: 'Spain', value: 158010, period: '01.07.24-16.09.2024' },
    { country: 'Italy', value: 110560, period: '01.07.24-16.09.2024' },
  ],
  'Soy Meal Import': [
    { country: 'Argentina', value: 1106780, period: '01.07.24-16.09.2024' },
    { country: 'Brazil', value: 885430, period: '01.07.24-16.09.2024' },
    { country: 'USA', value: 509120, period: '01.07.24-16.09.2024' },
    { country: 'Paraguay', value: 210230, period: '01.07.24-16.09.2024' },
    { country: 'India', value: 140560, period: '01.07.24-16.09.2024' },
  ],
};

// ProTrade Daily Prices Instruments
export const instrumentGroups = {
  grains: [
    { symbol: 'wheatBread', name: 'Grau panificatie (EUR/mt)', type: 'grain', unit: 'EUR/mt' },
    { symbol: 'wheatFeed', name: 'Grau furaj (EUR/mt)', type: 'grain', unit: 'EUR/mt' },
    { symbol: 'barley', name: 'Orz (EUR/mt)', type: 'grain', unit: 'EUR/mt' },
    { symbol: 'corn', name: 'Porumb (EUR/mt)', type: 'grain', unit: 'EUR/mt' },
  ],
  oilseeds: [
    { symbol: 'SFS_FOB', name: 'SFS FOB (USD/mt)', type: 'oilseed', unit: 'USD/mt' },
    { symbol: 'sunflower', name: 'SFS DAP Constanta (USD/mt)', type: 'oilseed', unit: 'USD/mt' },
    { symbol: 'rapeseed', name: 'RPS (USD/mt)', type: 'oilseed', unit: 'USD/mt' },
  ],
  futures: {
    CBOT: [
      { symbol: 'WHEAT-CBOT', name: 'Wheat CBOT', type: 'futures' },
      { symbol: 'CORN-CBOT', name: 'Corn CBOT', type: 'futures' },
      { symbol: 'SOYBEAN-CBOT', name: 'Soybean CBOT', type: 'futures' },
    ],
    MATIF: [
      { symbol: 'WHEAT-MATIF', name: 'Wheat MATIF', type: 'futures' },
      { symbol: 'CORN-MATIF', name: 'Corn MATIF', type: 'futures' },
      { symbol: 'RAPESEED-MATIF', name: 'Rapeseed MATIF', type: 'futures' },
    ],
  },
  cash: [
    { symbol: 'WHEAT-CASH-RO', name: 'Wheat Cash Romania', type: 'cash' },
    { symbol: 'CORN-CASH-RO', name: 'Corn Cash Romania', type: 'cash' },
    { symbol: 'BARLEY-CASH-RO', name: 'Barley Cash Romania', type: 'cash' },
  ],
  fx: [
    { symbol: 'EURUSD', name: 'EUR/USD', type: 'fx' },
    { symbol: 'USDRON', name: 'USD/RON', type: 'fx' },
  ],
};