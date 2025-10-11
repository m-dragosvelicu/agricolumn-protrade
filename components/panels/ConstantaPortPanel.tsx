"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Search, 
  Filter, 
  Settings,
  ChevronUp,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { mockVesselData } from '@/lib/mockData';
import { VesselData } from '@/types';
import { PanelHeader } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

interface ConstantaPortPanelProps {
  className?: string;
}

type SortField = keyof VesselData;
type SortDirection = 'asc' | 'desc';

// Fixed commodity order for tabs
const COMMODITY_ORDER = [
  { key: 'WHEAT', label: 'WHEAT', dataValues: ['Wheat'] },
  { key: 'CORN', label: 'CORN', dataValues: ['Corn'] },
  { key: 'BARLEY', label: 'BARLEY', dataValues: ['Barley'] },
  { key: 'RPS', label: 'RPS', dataValues: ['Rapeseeds'] },
  { key: 'SFS', label: 'SFS', dataValues: ['Sunflower Seeds'] },
  { key: 'RPS_MEAL', label: 'RPS MEAL', dataValues: ['Rapeseeds meal', 'Rapeseeds Meal'] },
  { key: 'SFS_MEAL', label: 'SFS MEAL', dataValues: ['Sunflower seeds meal', 'Sunflower Seeds Meal'] },
  { key: 'RPS_OIL', label: 'RPS OIL', dataValues: ['Rapeseeds Oil'] },
  { key: 'SFS_OIL', label: 'SFS OIL', dataValues: ['Sunflower seeds oil', 'Sunflower Seeds Oil'] },
  { key: 'FERTILIZERS', label: 'FERTILIZERS', dataValues: ['Fertilizers'] },
];

// Commodity display mapping
const getCommodityLabel = (commodity: string): string => {
  const mappings: Record<string, string> = {
    'Wheat': 'WHEAT',
    'Corn': 'CORN',
    'Barley': 'BARLEY',
    'Rapeseeds': 'RPS',
    'Sunflower Seeds': 'SFS',
    'Rapeseeds Oil': 'RPS OIL',
    'Sunflower seeds oil': 'SFS OIL',
    'Sunflower Seeds Oil': 'SFS OIL',
    'Rapeseeds meal': 'RPS MEAL',
    'Rapeseeds Meal': 'RPS MEAL',
    'Sunflower seeds meal': 'SFS MEAL',
    'Sunflower Seeds Meal': 'SFS MEAL',
    'Fertilizers': 'FERTILIZERS',
  };
  return mappings[commodity] || commodity.toUpperCase();
};

const columns = [
  { key: 'vessel_name' as SortField, label: 'Vessel Name', visible: true },
  { key: 'status' as SortField, label: 'Status', visible: true },
  { key: 'departure_country' as SortField, label: 'Departure Country', visible: true },
  { key: 'departure_port' as SortField, label: 'Departure Port', visible: true },
  { key: 'departure_terminal' as SortField, label: 'Departure Terminal', visible: true },
  { key: 'destination_country' as SortField, label: 'Destination Country', visible: true },
  { key: 'operation_type' as SortField, label: 'Operation Type', visible: true },
  { key: 'operation_completed' as SortField, label: 'Completed Date', visible: true },
  { key: 'commodity_description' as SortField, label: 'Commodity', visible: true },
  { key: 'shipper' as SortField, label: 'Shipper', visible: true },
  { key: 'cargo_origin_1' as SortField, label: 'Origin 1', visible: false },
  { key: 'cargo_origin_2' as SortField, label: 'Origin 2', visible: false },
];

export function ConstantaPortPanel({ className }: ConstantaPortPanelProps) {
  const [data] = useState<VesselData[]>(mockVesselData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('operation_completed');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: col.visible }), {} as Record<string, boolean>)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [commodityFilter, setCommodityFilter] = useState('all');
  const [operationTypeFilter, setOperationTypeFilter] = useState('all');
  const [quantityFilter, setQuantityFilter] = useState('all');
  const [shipperFilter, setShipperFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [vesselNameFilter, setVesselNameFilter] = useState('all');
  const [terminalFilter, setTerminalFilter] = useState('all');
  const [operationStatusFilter, setOperationStatusFilter] = useState<string[]>([]);

  // Chart view states
  const [selectedChartCommodity, setSelectedChartCommodity] = useState('WHEAT');
  const [selectedDestinationCountries, setSelectedDestinationCountries] = useState<string[]>([]);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle responsive chart sizing
  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(row => {
      const matchesSearch = Object.values(row).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesCommodity = commodityFilter === 'all' || row.commodity_description === commodityFilter;
      const matchesOperationType = operationTypeFilter === 'all' || row.operation_type === operationTypeFilter;
      const matchesShipper = shipperFilter === 'all' || row.shipper === shipperFilter;
      const matchesDestination = destinationFilter === 'all' || row.destination_country === destinationFilter;
      const matchesVesselName = vesselNameFilter === 'all' || row.vessel_name === vesselNameFilter;
      const matchesTerminal = terminalFilter === 'all' || row.departure_terminal === terminalFilter;
      const matchesOperationStatus = operationStatusFilter.length === 0 || operationStatusFilter.includes(row.status);

      return matchesSearch && matchesCommodity && matchesOperationType && matchesShipper && 
             matchesDestination && matchesVesselName && matchesTerminal && matchesOperationStatus;
    });

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? 
          aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection, commodityFilter, operationTypeFilter, shipperFilter, destinationFilter, vesselNameFilter, terminalFilter, operationStatusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / pageSize));

  // Reset to first page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, commodityFilter, operationTypeFilter, shipperFilter, destinationFilter, vesselNameFilter, terminalFilter, operationStatusFilter]);

  // Clamp current page if total pages shrink below current
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getUniqueValues = (field: keyof VesselData) => {
    return Array.from(new Set(data.map(row => row[field]).filter(Boolean))).map(String);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      "Loading": "bg-blue-500/20 text-blue-300 border-blue-500/30",
      "Loaded": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      "In Transit": "bg-purple-500/20 text-purple-300 border-purple-500/30",
      "Discharged": "bg-orange-500/20 text-orange-300 border-orange-500/30",
      "Completed": "bg-green-500/20 text-green-300 border-green-500/30"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const clearFilters = () => {
    setCommodityFilter('all');
    setOperationTypeFilter('all');
    setShipperFilter('all');
    setDestinationFilter('all');
    setVesselNameFilter('all');
    setTerminalFilter('all');
    setOperationStatusFilter([]);
    setSearchTerm('');
  };

  const activeFiltersCount = 
    (commodityFilter !== 'all' ? 1 : 0) + 
    (operationTypeFilter !== 'all' ? 1 : 0) + 
    (shipperFilter !== 'all' ? 1 : 0) + 
    (destinationFilter !== 'all' ? 1 : 0) + 
    (vesselNameFilter !== 'all' ? 1 : 0) + 
    (terminalFilter !== 'all' ? 1 : 0) + 
    (operationStatusFilter.length > 0 ? 1 : 0);

  const exportCSV = () => {
    const visibleCols = columns.filter(col => visibleColumns[col.key]);
    const headers = visibleCols.map(col => col.label).join(',');
    const rows = filteredAndSortedData.map(row => 
      visibleCols.map(col => row[col.key] || '').join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'constanta-port-data.csv';
    a.click();
  };

  const getPageList = () => {
    const pages: Array<number | string> = [];
    const maxButtons = 7; // including first/last and ellipses
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const showLeftEllipsis = currentPage > 4;
    const showRightEllipsis = currentPage < totalPages - 3;

    pages.push(1);
    if (showLeftEllipsis) pages.push('…');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (showRightEllipsis) pages.push('…');
    pages.push(totalPages);

    return pages;
  };

  // Chart data computation
  const uniqueDestinations = useMemo(() => getUniqueValues('destination_country'), [data]);

  // Filtered countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearchTerm) return uniqueDestinations;
    return uniqueDestinations.filter(country =>
      country.toLowerCase().includes(countrySearchTerm.toLowerCase())
    );
  }, [uniqueDestinations, countrySearchTerm]);

  const chartData = useMemo(() => {
    // Find the commodity config for the selected tab
    const commodityConfig = COMMODITY_ORDER.find(c => c.key === selectedChartCommodity);
    if (!commodityConfig) return [];

    // Filter data by selected commodity and destinations
    const filtered = data.filter(row => {
      const matchesCommodity = commodityConfig.dataValues.includes(row.commodity_description);
      const matchesDestination = selectedDestinationCountries.length === 0 || selectedDestinationCountries.includes(row.destination_country);
      return matchesCommodity && matchesDestination && row.operation_type === 'Export';
    });

    // Group by shipper and sum quantities (mock: use random quantities)
    const shipperData: Record<string, number> = {};
    filtered.forEach(row => {
      if (!shipperData[row.shipper]) {
        shipperData[row.shipper] = 0;
      }
      // Mock quantity - in real app this would come from data
      shipperData[row.shipper] += Math.floor(Math.random() * 10000) + 5000;
    });

    // Convert to chart format with actual shipper names
    return Object.entries(shipperData).map(([shipper, qty]) => ({
      shipper: shipper,
      quantity: qty,
    }));
  }, [data, selectedChartCommodity, selectedDestinationCountries]);

  return (
    <Card className={cn('flex flex-col bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden', className)}>
      <PanelHeader
        title="Constanta Port"
        lastUpdated="2 minutes ago"
        onExport={exportCSV}
        onFullscreen={() => {}}
      />

      <CardContent className="p-0 overflow-hidden">
        {/* Chart View */}
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">EXPORT OVERVIEW</h3>

          {/* Commodity Selection */}
          {/* Mobile: Select Dropdown */}
          <div className="block md:hidden mb-3">
            <Select value={selectedChartCommodity} onValueChange={setSelectedChartCommodity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                {COMMODITY_ORDER.map((commodity) => (
                  <SelectItem key={commodity.key} value={commodity.key}>
                    {commodity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Scrollable Tabs */}
          <div className="hidden md:block">
            <Tabs value={selectedChartCommodity} onValueChange={setSelectedChartCommodity}>
              <div className="overflow-x-auto mb-3">
                <TabsList className="inline-flex w-auto flex-nowrap gap-2">
                  {COMMODITY_ORDER.map((commodity) => (
                    <TabsTrigger
                      key={commodity.key}
                      value={commodity.key}
                      className="whitespace-nowrap"
                    >
                      {commodity.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          </div>

          {/* Destination Country Selector */}
          <div className="mb-4">
            <Label className="text-sm text-slate-400 mb-2 block">Destination Countries</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="text-sm">
                    {selectedDestinationCountries.length === 0
                      ? 'Select countries...'
                      : `${selectedDestinationCountries.length} ${selectedDestinationCountries.length === 1 ? 'country' : 'countries'} selected`}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="border-b border-slate-700/50 bg-slate-800/60">
                  {/* Search Box */}
                  <div className="p-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search countries..."
                        value={countrySearchTerm}
                        onChange={(e) => setCountrySearchTerm(e.target.value)}
                        className="pl-8 h-9"
                      />
                    </div>
                  </div>

                  {/* Select All / Clear All Header */}
                  <div className="flex items-center justify-between px-3 pb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-countries"
                        checked={selectedDestinationCountries.length === uniqueDestinations.length && uniqueDestinations.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDestinationCountries([...uniqueDestinations]);
                          } else {
                            setSelectedDestinationCountries([]);
                          }
                        }}
                      />
                      <Label htmlFor="select-all-countries" className="text-xs font-medium text-slate-300 cursor-pointer">
                        Select All
                      </Label>
                    </div>
                    {selectedDestinationCountries.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDestinationCountries([])}
                        className="h-6 text-xs px-2"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Scrollable Country List */}
                <div className="max-h-[250px] overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <div
                          key={country}
                          className="flex items-center space-x-2 hover:bg-slate-700/30 p-2 rounded transition-colors cursor-pointer"
                          onClick={() => {
                            if (selectedDestinationCountries.includes(country)) {
                              setSelectedDestinationCountries(selectedDestinationCountries.filter(c => c !== country));
                            } else {
                              setSelectedDestinationCountries([...selectedDestinationCountries, country]);
                            }
                          }}
                        >
                          <Checkbox
                            id={`dest-${country}`}
                            checked={selectedDestinationCountries.includes(country)}
                            onClick={(e) => e.stopPropagation()}
                            className="pointer-events-none"
                          />
                          <span className="text-sm text-slate-300 flex-1">
                            {country}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-400">
                        No countries found
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Chart */}
          <div className="outline-none focus:outline-none [&>*]:outline-none [&>*]:focus:outline-none" style={{ height: '300px' }}>
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 0 : 20,
                    bottom: isMobile ? 60 : 40
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="shipper"
                    fontSize={isMobile ? 10 : 12}
                    stroke="#9ca3af"
                    angle={-45}
                    textAnchor="end"
                    height={isMobile ? 80 : 60}
                  />
                  <YAxis
                    fontSize={isMobile ? 10 : 12}
                    tickFormatter={(value) => value.toLocaleString()}
                    stroke="#9ca3af"
                    label={{
                      value: 'QTY (tonnes)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#9ca3af', fontSize: isMobile ? 10 : 12 }
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()} tonnes`, 'Quantity']}
                    labelFormatter={(label) => `Shipper: ${label}`}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '12px' : '14px'
                    }}
                  />
                  <Bar
                    dataKey="quantity"
                    fill="hsl(var(--primary))"
                    name="Quantity"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-slate-700/50 space-y-4">
          {/* Main Filter Row - Desktop */}
          <div className="hidden lg:flex lg:flex-wrap lg:items-end lg:gap-3">
            {/* Commodity Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Commodity</Label>
              <Select value={commodityFilter} onValueChange={setCommodityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Commodities</SelectItem>
                  {getUniqueValues('commodity_description').map(commodity => (
                    <SelectItem key={commodity} value={commodity}>{getCommodityLabel(commodity)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operation Type Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Operation Type</Label>
              <Select value={operationTypeFilter} onValueChange={setOperationTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getUniqueValues('operation_type').map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Quantity</Label>
              <Select value={quantityFilter} onValueChange={setQuantityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quantities</SelectItem>
                  <SelectItem value="<5000">{"< 5,000 mt"}</SelectItem>
                  <SelectItem value="5000-10000">5,000 - 10,000 mt</SelectItem>
                  <SelectItem value=">10000">{"> 10,000 mt"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Shipper/Exporter Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Exporter / Importer</Label>
              <Select value={shipperFilter} onValueChange={setShipperFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shippers</SelectItem>
                  {getUniqueValues('shipper').map(shipper => (
                    <SelectItem key={shipper} value={shipper}>{shipper}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destination Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Destination</Label>
              <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  {getUniqueValues('destination_country').map(dest => (
                    <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vessel Name Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Vessel Name</Label>
              <Select value={vesselNameFilter} onValueChange={setVesselNameFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessels</SelectItem>
                  {getUniqueValues('vessel_name').map(vessel => (
                    <SelectItem key={vessel} value={vessel}>{vessel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Terminal Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Terminal</Label>
              <Select value={terminalFilter} onValueChange={setTerminalFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terminals</SelectItem>
                  {getUniqueValues('departure_terminal').map(terminal => (
                    <SelectItem key={terminal} value={terminal}>{terminal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operation Status - Multi-select */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Operation Status</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[160px] justify-between h-10">
                    <span className="text-sm">
                      {operationStatusFilter.length === 0
                        ? 'All'
                        : `${operationStatusFilter.length} selected`}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <div className="p-2 space-y-1">
                    {['ETA', 'Loading', 'Loaded', 'In Transit', 'Discharged', 'Completed'].map((status) => (
                      <div
                        key={status}
                        className="flex items-center space-x-2 hover:bg-slate-700/30 p-2 rounded transition-colors cursor-pointer"
                        onClick={() => {
                          if (operationStatusFilter.includes(status)) {
                            setOperationStatusFilter(operationStatusFilter.filter(s => s !== status));
                          } else {
                            setOperationStatusFilter([...operationStatusFilter, status]);
                          }
                        }}
                      >
                        <Checkbox
                          id={`status-${status}`}
                          checked={operationStatusFilter.includes(status)}
                          onClick={(e) => e.stopPropagation()}
                          className="pointer-events-none"
                        />
                        <span className="text-sm text-slate-300 flex-1">
                          {status}
                        </span>
                      </div>
                    ))}
                    {operationStatusFilter.length > 0 && (
                      <div className="pt-2 border-t border-slate-700/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOperationStatusFilter([]);
                          }}
                          className="w-full text-xs"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Mobile: Filters Dialog */}
          <div className="lg:hidden">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Filter Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Commodity Filter */}
                  <div>
                    <Label className="text-sm font-medium">Commodity</Label>
                    <Select value={commodityFilter} onValueChange={setCommodityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All commodities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Commodities</SelectItem>
                        {getUniqueValues('commodity_description').map(commodity => (
                          <SelectItem key={commodity} value={commodity}>{getCommodityLabel(commodity)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operation Type Filter */}
                  <div>
                    <Label className="text-sm font-medium">Operation Type</Label>
                    <Select value={operationTypeFilter} onValueChange={setOperationTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {getUniqueValues('operation_type').map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity Filter */}
                  <div>
                    <Label className="text-sm font-medium">Quantity</Label>
                    <Select value={quantityFilter} onValueChange={setQuantityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All quantities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Quantities</SelectItem>
                        <SelectItem value="<5000">{"< 5,000 mt"}</SelectItem>
                        <SelectItem value="5000-10000">5,000 - 10,000 mt</SelectItem>
                        <SelectItem value=">10000">{"> 10,000 mt"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Shipper Filter */}
                  <div>
                    <Label className="text-sm font-medium">Exporter/Importer</Label>
                    <Select value={shipperFilter} onValueChange={setShipperFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All shippers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Shippers</SelectItem>
                        {getUniqueValues('shipper').map(shipper => (
                          <SelectItem key={shipper} value={shipper}>{shipper}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Destination Filter */}
                  <div>
                    <Label className="text-sm font-medium">Destination</Label>
                    <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All destinations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Destinations</SelectItem>
                        {getUniqueValues('destination_country').map(dest => (
                          <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vessel Name Filter */}
                  <div>
                    <Label className="text-sm font-medium">Vessel Name</Label>
                    <Select value={vesselNameFilter} onValueChange={setVesselNameFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All vessels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Vessels</SelectItem>
                        {getUniqueValues('vessel_name').map(vessel => (
                          <SelectItem key={vessel} value={vessel}>{vessel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Terminal Filter */}
                  <div>
                    <Label className="text-sm font-medium">Terminal</Label>
                    <Select value={terminalFilter} onValueChange={setTerminalFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All terminals" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Terminals</SelectItem>
                        {getUniqueValues('departure_terminal').map(terminal => (
                          <SelectItem key={terminal} value={terminal}>{terminal}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operation Status Multi-select */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Operation Status</Label>
                    <div className="space-y-2 border border-slate-700/50 rounded-md p-3">
                      {['ETA', 'Loading', 'Loaded', 'In Transit', 'Discharged', 'Completed'].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mobile-status-${status}`}
                            checked={operationStatusFilter.includes(status)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setOperationStatusFilter([...operationStatusFilter, status]);
                              } else {
                                setOperationStatusFilter(operationStatusFilter.filter(s => s !== status));
                              }
                            }}
                          />
                          <Label htmlFor={`mobile-status-${status}`} className="text-sm cursor-pointer">
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar and Columns - Second Row */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Columns Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Manage Columns</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {columns.map(column => (
                    <div key={column.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.key}
                        checked={visibleColumns[column.key]}
                        onCheckedChange={(checked) => {
                          setVisibleColumns({
                            ...visibleColumns,
                            [column.key]: !!checked
                          });
                        }}
                      />
                      <Label htmlFor={column.key} className="text-sm">
                        {column.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {commodityFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Commodity: {getCommodityLabel(commodityFilter)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setCommodityFilter('all')}
                  />
                </Badge>
              )}
              {operationTypeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Operation: {operationTypeFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setOperationTypeFilter('all')}
                  />
                </Badge>
              )}
              {shipperFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Shipper: {shipperFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setShipperFilter('all')}
                  />
                </Badge>
              )}
              {destinationFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Destination: {destinationFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setDestinationFilter('all')}
                  />
                </Badge>
              )}
              {vesselNameFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Vessel: {vesselNameFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setVesselNameFilter('all')}
                  />
                </Badge>
              )}
              {terminalFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Terminal: {terminalFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setTerminalFilter('all')}
                  />
                </Badge>
              )}
              {operationStatusFilter.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  Status: {operationStatusFilter.length} selected
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setOperationStatusFilter([])}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          <div className="p-4 space-y-3">
            {paginatedData.map((row) => (
              <Card key={row.id} className="bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 transition-all duration-200">
                <CardContent className="p-4 space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-base truncate">{row.vessel_name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{getCommodityLabel(row.commodity_description)}</p>
                    </div>
                    <Badge className={`border ${getStatusBadge(row.status)} pointer-events-none whitespace-nowrap flex-shrink-0`}>
                      {row.status}
                    </Badge>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Operation</p>
                      <p className="text-slate-300 font-medium">{row.operation_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Terminal</p>
                      <p className="text-slate-300 font-medium">{row.departure_terminal}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Destination</p>
                      <p className="text-slate-300 font-medium truncate">{row.destination_country}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Completed</p>
                      <p className="text-slate-300 font-medium">
                        {row.operation_completed ? new Date(row.operation_completed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Footer Row */}
                  <div className="pt-2 border-t border-slate-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{row.shipper}</span>
                      <span className="text-slate-500">{row.departure_port}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile Pagination */}
          <div className="px-4 pb-4 border-t border-slate-700/50">
            <div className="pt-4 space-y-3">
              {/* Results info */}
              <div className="text-xs text-slate-400 text-center">
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length}
              </div>
              
              {/* Pagination controls */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex-1 mr-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm text-slate-400 px-3 whitespace-nowrap">
                  {currentPage} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex-1 ml-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-slate-700/50">
                {columns.filter(col => visibleColumns[col.key]).map(column => (
                  <TableHead
                    key={column.key}
                    className="text-slate-400 font-semibold cursor-pointer hover:bg-slate-700/30 whitespace-nowrap"
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortField === column.key && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={row.id} className="border-b-slate-800 hover:bg-slate-700/10 transition-colors duration-200">
                  {columns.filter(col => visibleColumns[col.key]).map(column => (
                    <TableCell key={column.key} className="text-slate-300 whitespace-nowrap">
                      {column.key === 'vessel_name' ? (
                        <span className="font-medium text-white">
                          {row.vessel_name}
                        </span>
                      ) : column.key === 'status' ? (
                        <Badge className={`border ${getStatusBadge(row.status)} pointer-events-none whitespace-nowrap`}>
                          {row.status}
                        </Badge>
                      ) : column.key === 'operation_completed' ? (
                        row.operation_completed ? new Date(row.operation_completed).toLocaleDateString() : '—'
                      ) : column.key === 'commodity_description' ? (
                        getCommodityLabel(row[column.key] || '')
                      ) : (
                        row[column.key] || '—'
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            
            {/* Table Footer with Pagination */}
            <TableFooter className="bg-slate-800/40 border-t border-slate-700/50">
              <tr>
                <td colSpan={columns.filter(col => visibleColumns[col.key]).length} className="p-0">
                  <div className="px-4 py-3">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      {/* Results info */}
                      <div className="text-sm text-slate-400">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
                      </div>
                      
                      {/* Pagination controls */}
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                        {/* Page info */}
                        <div className="text-sm text-slate-400 text-center sm:text-left">
                          Page {currentPage} of {totalPages}
                        </div>
                        
                        {/* Navigation buttons */}
                        <div className="flex items-center justify-center space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          {/* Page numbers - responsive */}
                          <div className="hidden lg:flex items-center space-x-1">
                            {getPageList().map((p, idx) => (
                              typeof p === 'number' ? (
                                <Button
                                  key={`${p}-${idx}`}
                                  variant={p === currentPage ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setCurrentPage(p)}
                                  className="h-8 min-w-[2rem] text-xs"
                                >
                                  {p}
                                </Button>
                              ) : (
                                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">{p}</span>
                              )
                            ))}
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}