'use client';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Filter,
  Search,
  Settings,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { PanelHeader } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseDepartureLocation } from '@/lib/countryMappings';
import { cn } from '@/lib/utils';
import { colorForCommodity } from '@/lib/commodityColors';
import {
  useConstantaPortViewModel,
  COMMODITY_ORDER,
  type ColumnConfig,
  type SortField,
} from '@/hooks/viewModels';
import type { VesselData } from '@/types';

interface ConstantaPortPanelProps {
  className?: string;
}

// Status styling
const STATUS_STYLES: Record<string, string> = {
  eta: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  'awaiting berth': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  loading: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'loading/discharging': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  loaded: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  sailed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'in transit': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  discharged: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  completed: 'bg-green-500/20 text-green-300 border-green-500/30',
  delayed: 'bg-red-500/20 text-red-300 border-red-500/30',
};

// Helper functions
const getStatusBadge = (status: string) => {
  const normalized = status?.toLowerCase?.() ?? '';
  return STATUS_STYLES[normalized] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
};

const getCommodityLabel = (commodity: string): string => {
  const mappings: Record<string, string> = {
    Wheat: 'WHEAT',
    Corn: 'CORN',
    Barley: 'BARLEY',
    Rapeseed: 'RPS',
    Rapeseeds: 'RPS',
    'Sunflower Seeds': 'SFS',
    'Rapeseed Oil': 'RPS OIL',
    'Rapeseeds Oil': 'RPS OIL',
    'Sunflower Oil': 'SFS OIL',
    'Sunflower seeds oil': 'SFS OIL',
    'Sunflower Seeds Oil': 'SFS OIL',
    'Rapeseed Meal': 'RPS MEAL',
    'Rapeseeds meal': 'RPS MEAL',
    'Rapeseeds Meal': 'RPS MEAL',
    'Sunflower Meal': 'SFS MEAL',
    'Sunflower seeds meal': 'SFS MEAL',
    'Sunflower Seeds Meal': 'SFS MEAL',
    Fertilizers: 'FERTILIZERS',
  };
  return mappings[commodity] || commodity.toUpperCase();
};

const getQuantityLabel = (filter: string): string => {
  const mappings: Record<string, string> = {
    '<5000': '< 5,000 mt',
    '5000-10000': '5,000 - 10,000 mt',
    '>10000': '> 10,000 mt',
  };
  return mappings[filter] || 'All quantities';
};

const numberFormatter = new Intl.NumberFormat('en-GB');

const formatQuantity = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return numberFormatter.format(value);
};

const formatOperationDate = (value: string | null | undefined): string => {
  if (!value) return '—';
  const parts = value.split('-');
  if (parts.length === 3) {
    const [year, month, dayRaw] = parts;
    const day = dayRaw?.split('T')[0] ?? '';
    if (year && month && day) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
  }
  return value;
};

/**
 * ConstantaPortPanel - View Component
 * Pure presentational component that renders UI based on ViewModel state
 */
export function ConstantaPortPanel({ className }: ConstantaPortPanelProps) {
  const vm = useConstantaPortViewModel();

  return (
    <Card
      className={cn(
        'flex flex-col bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden',
        className
      )}
    >
      <PanelHeader
        title="Constanta Port"
        lastUpdated="2 minutes ago"
        onExport={vm.exportCSV}
        onFullscreen={() => {}}
      />

      <CardContent className="p-0 overflow-hidden">
        {/* Chart Section */}
        <ChartSection vm={vm} />

        {/* Controls Section */}
        <ControlsSection vm={vm} />

        {/* Mobile Card View */}
        <MobileCardView vm={vm} />

        {/* Desktop Table View */}
        <DesktopTableView vm={vm} />
      </CardContent>
    </Card>
  );
}

// --- Chart Section ---
interface ChartSectionProps {
  vm: ReturnType<typeof useConstantaPortViewModel>;
}

function ChartSection({ vm }: ChartSectionProps) {
  return (
    <div className="p-4 border-b border-slate-700/50">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">EXPORT OVERVIEW</h3>

      {/* Mobile: Select Dropdown */}
      <div className="block md:hidden mb-3">
        <Select value={vm.selectedChartCommodity} onValueChange={vm.setSelectedChartCommodity}>
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
        <Tabs value={vm.selectedChartCommodity} onValueChange={vm.setSelectedChartCommodity}>
          <div className="overflow-x-auto mb-3">
            <TabsList className="inline-flex w-auto flex-nowrap gap-2">
              {COMMODITY_ORDER.map((commodity) => (
                <TabsTrigger key={commodity.key} value={commodity.key} className="whitespace-nowrap">
                  {commodity.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Destination Country Selector */}
      <DestinationCountrySelector vm={vm} />

      {/* Chart */}
      <ExportChart vm={vm} />
    </div>
  );
}

function DestinationCountrySelector({ vm }: ChartSectionProps) {
  return (
    <div className="mb-4">
      <Label className="text-sm text-slate-400 mb-2 block">Destination Countries</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="text-sm">
              {vm.selectedDestinationCountries.length === 0
                ? 'Select countries...'
                : vm.selectedDestinationCountries.length === vm.uniqueDestinations.length &&
                    vm.uniqueDestinations.length > 0
                  ? 'All countries'
                  : `${vm.selectedDestinationCountries.length} ${
                      vm.selectedDestinationCountries.length === 1 ? 'country' : 'countries'
                    } selected`}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="border-b border-slate-700/50 bg-slate-800/60">
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search countries..."
                  value={vm.countrySearchTerm}
                  onChange={(e) => vm.setCountrySearchTerm(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-countries"
                  checked={
                    vm.selectedDestinationCountries.length === vm.uniqueDestinations.length &&
                    vm.uniqueDestinations.length > 0
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      vm.setSelectedDestinationCountries([...vm.uniqueDestinations]);
                    } else {
                      vm.setSelectedDestinationCountries([]);
                    }
                  }}
                />
                <Label
                  htmlFor="select-all-countries"
                  className="text-xs font-medium text-slate-300 cursor-pointer"
                >
                  Select All
                </Label>
              </div>
              {vm.selectedDestinationCountries.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => vm.setSelectedDestinationCountries([])}
                  className="h-6 text-xs px-2"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-[250px] overflow-y-auto">
            <div className="p-2 space-y-1">
              {vm.filteredCountries.length > 0 ? (
                vm.filteredCountries.map((country) => (
                  <div
                    key={country}
                    className="flex items-center space-x-2 hover:bg-slate-700/30 p-2 rounded transition-colors cursor-pointer"
                    onClick={() => {
                      if (vm.selectedDestinationCountries.includes(country)) {
                        vm.setSelectedDestinationCountries(
                          vm.selectedDestinationCountries.filter((c) => c !== country)
                        );
                      } else {
                        vm.setSelectedDestinationCountries([
                          ...vm.selectedDestinationCountries,
                          country,
                        ]);
                      }
                    }}
                  >
                    <Checkbox
                      id={`dest-${country}`}
                      checked={vm.selectedDestinationCountries.includes(country)}
                      onClick={(e) => e.stopPropagation()}
                      className="pointer-events-none"
                    />
                    <span className="text-sm text-slate-300 flex-1">{country}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-400">No countries found</div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ExportChart({ vm }: ChartSectionProps) {
  return (
    <div
      className="outline-none focus:outline-none [&>*]:outline-none [&>*]:focus:outline-none"
      style={{ height: '300px' }}
    >
      {!vm.isMounted || vm.chartLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      ) : vm.chartData.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-700 text-sm text-slate-400">
          No export data available for this selection.
        </div>
      ) : (
        <div className="relative h-full">
          <button
            type="button"
            onClick={vm.handleScrollLeft}
            disabled={!vm.canScrollLeft}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-600/60 bg-slate-900/80 p-2 text-slate-100 shadow-xl backdrop-blur transition hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Scroll chart left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={vm.handleScrollRight}
            disabled={!vm.canScrollRight}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-600/60 bg-slate-900/80 p-2 text-slate-100 shadow-xl backdrop-blur transition hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Scroll chart right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div
            ref={vm.chartScrollRef}
            className={cn(
              'h-full overflow-x-auto overflow-y-hidden rounded-md border border-slate-700/40 bg-slate-900/30',
              'scrollbar-thin scrollbar-thumb-slate-700/70 scrollbar-track-transparent'
            )}
            onScroll={vm.updateScrollIndicators}
          >
            <div style={{ minWidth: vm.chartMinWidth, height: '100%', position: 'relative' }}>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-slate-900/80 via-slate-900/40 to-transparent" />
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vm.chartData}
                  margin={{
                    top: 20,
                    right: vm.isMobile ? 10 : 30,
                    left: vm.isMobile ? 32 : 48,
                    bottom: vm.isMobile ? 60 : 40,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="country"
                    fontSize={vm.isMobile ? 10 : 12}
                    stroke="#9ca3af"
                    angle={-45}
                    textAnchor="end"
                    height={vm.isMobile ? 80 : 60}
                  />
                  <YAxis
                    fontSize={vm.isMobile ? 10 : 12}
                    tickFormatter={(value) => numberFormatter.format(value)}
                    stroke="#9ca3af"
                    width={vm.isMobile ? 44 : 64}
                    label={{
                      value: 'QTY (tonnes)',
                      angle: -90,
                      position: 'left',
                      style: { fill: '#9ca3af', fontSize: vm.isMobile ? 10 : 12 },
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${numberFormatter.format(value)} tonnes`,
                      'Quantity',
                    ]}
                    labelFormatter={(label) => `Country: ${label}`}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: vm.isMobile ? '12px' : '14px',
                    }}
                  />
                  <Bar
                    dataKey="quantity"
                    fill={colorForCommodity(vm.selectedChartCommodity)}
                    name="Quantity"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Controls Section ---
function ControlsSection({ vm }: ChartSectionProps) {
  return (
    <div className="p-4 border-b border-slate-700/50 space-y-4">
      {/* Desktop Filters */}
      <DesktopFilters vm={vm} />

      {/* Mobile Filters Dialog */}
      <MobileFiltersDialog vm={vm} />

      {/* Search and Columns */}
      <SearchAndColumns vm={vm} />

      {/* Active Filters */}
      <ActiveFilters vm={vm} />
    </div>
  );
}

function DesktopFilters({ vm }: ChartSectionProps) {
  return (
    <div className="hidden lg:flex lg:flex-wrap lg:items-end lg:gap-3">
      <FilterSelect
        label="Commodity"
        value={vm.commodityFilter}
        onValueChange={vm.setCommodityFilter}
        options={[
          { value: 'all', label: 'All Commodities' },
          ...COMMODITY_ORDER.map((c) => ({ value: c.dataValues[0], label: c.label })),
        ]}
        width="w-[140px]"
      />
      <FilterSelect
        label="Operation Type"
        value={vm.operationTypeFilter}
        onValueChange={vm.setOperationTypeFilter}
        options={[
          { value: 'all', label: 'All Types' },
          ...(vm.filterMetadata?.operationTypes || ['Export', 'Import', 'Transit']).map((t) => ({
            value: t,
            label: t,
          })),
        ]}
        width="w-[140px]"
      />
      <FilterSelect
        label="Quantity"
        value={vm.quantityFilter}
        onValueChange={vm.setQuantityFilter}
        options={[
          { value: 'all', label: 'All Quantities' },
          { value: '<5000', label: '< 5,000 mt' },
          { value: '5000-10000', label: '5,000 - 10,000 mt' },
          { value: '>10000', label: '> 10,000 mt' },
        ]}
        width="w-[140px]"
      />
      <FilterSelect
        label="Exporter / Importer"
        value={vm.shipperFilter}
        onValueChange={vm.setShipperFilter}
        options={[
          { value: 'all', label: 'All Shippers' },
          ...(vm.filterMetadata?.shippers || []).map((s) => ({ value: s, label: s })),
        ]}
        width="w-[160px]"
      />
      <FilterSelect
        label="Destination"
        value={vm.destinationFilter}
        onValueChange={vm.setDestinationFilter}
        options={[
          { value: 'all', label: 'All Destinations' },
          ...(vm.filterMetadata?.destinationCountries || []).map((d) => ({ value: d, label: d })),
        ]}
        width="w-[140px]"
      />
      <FilterSelect
        label="Terminal"
        value={vm.terminalFilter}
        onValueChange={vm.setTerminalFilter}
        options={[
          { value: 'all', label: 'All Terminals' },
          ...(vm.filterMetadata?.departureTerminals || []).map((t) => ({ value: t, label: t })),
        ]}
        width="w-[130px]"
      />
      <FilterSelect
        label="Status"
        value={vm.operationStatusFilter.length === 0 ? 'all' : vm.operationStatusFilter[0]}
        onValueChange={(value) => {
          if (value === 'all') {
            vm.setOperationStatusFilter([]);
          } else {
            vm.setOperationStatusFilter([value]);
          }
        }}
        options={[
          { value: 'all', label: 'All Status' },
          ...(vm.filterMetadata?.statuses || vm.statusOptions).map((s) => ({ value: s, label: s })),
        ]}
        width="w-[130px]"
      />
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  width: string;
}

function FilterSelect({ label, value, onValueChange, options, width }: FilterSelectProps) {
  return (
    <div className="flex flex-col space-y-1.5">
      <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={width}>
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MobileFiltersDialog({ vm }: ChartSectionProps) {
  return (
    <div className="lg:hidden">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {vm.activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {vm.activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filter Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <MobileFilterSelect
              label="Commodity"
              value={vm.commodityFilter}
              onValueChange={vm.setCommodityFilter}
              options={[
                { value: 'all', label: 'All Commodities' },
                ...COMMODITY_ORDER.map((c) => ({ value: c.dataValues[0], label: c.label })),
              ]}
            />
            <MobileFilterSelect
              label="Operation Type"
              value={vm.operationTypeFilter}
              onValueChange={vm.setOperationTypeFilter}
              options={[
                { value: 'all', label: 'All Types' },
                ...(vm.filterMetadata?.operationTypes || ['Export', 'Import', 'Transit']).map(
                  (t) => ({ value: t, label: t })
                ),
              ]}
            />
            <MobileFilterSelect
              label="Quantity"
              value={vm.quantityFilter}
              onValueChange={vm.setQuantityFilter}
              options={[
                { value: 'all', label: 'All Quantities' },
                { value: '<5000', label: '< 5,000 mt' },
                { value: '5000-10000', label: '5,000 - 10,000 mt' },
                { value: '>10000', label: '> 10,000 mt' },
              ]}
            />
            <MobileFilterSelect
              label="Exporter/Importer"
              value={vm.shipperFilter}
              onValueChange={vm.setShipperFilter}
              options={[
                { value: 'all', label: 'All Shippers' },
                ...(vm.filterMetadata?.shippers || []).map((s) => ({ value: s, label: s })),
              ]}
            />
            <MobileFilterSelect
              label="Destination"
              value={vm.destinationFilter}
              onValueChange={vm.setDestinationFilter}
              options={[
                { value: 'all', label: 'All Destinations' },
                ...(vm.filterMetadata?.destinationCountries || []).map((d) => ({
                  value: d,
                  label: d,
                })),
              ]}
            />
            <MobileFilterSelect
              label="Terminal"
              value={vm.terminalFilter}
              onValueChange={vm.setTerminalFilter}
              options={[
                { value: 'all', label: 'All Terminals' },
                ...(vm.filterMetadata?.departureTerminals || []).map((t) => ({
                  value: t,
                  label: t,
                })),
              ]}
            />

            {/* Status Multi-select */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Operation Status</Label>
              <div className="space-y-2 border border-slate-700/50 rounded-md p-3">
                {vm.statusOptions.length > 0 ? (
                  vm.statusOptions.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mobile-status-${status}`}
                        checked={vm.operationStatusFilter.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            vm.setOperationStatusFilter([...vm.operationStatusFilter, status]);
                          } else {
                            vm.setOperationStatusFilter(
                              vm.operationStatusFilter.filter((s) => s !== status)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`mobile-status-${status}`} className="text-sm cursor-pointer">
                        {status}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center">No status data available</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={vm.clearFilters}>
                Clear All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface MobileFilterSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function MobileFilterSelect({ label, value, onValueChange, options }: MobileFilterSelectProps) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SearchAndColumns({ vm }: ChartSectionProps) {
  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search all columns..."
          value={vm.searchTerm}
          onChange={(e) => vm.setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

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
            {vm.columns.map((column) => (
              <div key={column.key} className="flex items-center space-x-2">
                <Checkbox
                  id={column.key}
                  checked={vm.visibleColumns[column.key]}
                  onCheckedChange={(checked) => {
                    vm.setVisibleColumns({
                      ...vm.visibleColumns,
                      [column.key]: !!checked,
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
  );
}

function ActiveFilters({ vm }: ChartSectionProps) {
  if (vm.activeFiltersCount === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {vm.commodityFilter !== 'all' && (
        <FilterBadge
          label="Commodity"
          value={(() => {
            const commodityConfig = COMMODITY_ORDER.find((c) =>
              c.dataValues.includes(vm.commodityFilter)
            );
            return commodityConfig ? commodityConfig.label : getCommodityLabel(vm.commodityFilter);
          })()}
          onClear={() => vm.setCommodityFilter('all')}
        />
      )}
      {vm.operationTypeFilter !== 'all' && (
        <FilterBadge
          label="Operation"
          value={vm.operationTypeFilter}
          onClear={() => vm.setOperationTypeFilter('all')}
        />
      )}
      {vm.quantityFilter !== 'all' && (
        <FilterBadge
          label="Quantity"
          value={getQuantityLabel(vm.quantityFilter)}
          onClear={() => vm.setQuantityFilter('all')}
        />
      )}
      {vm.shipperFilter !== 'all' && (
        <FilterBadge
          label="Shipper"
          value={vm.shipperFilter}
          onClear={() => vm.setShipperFilter('all')}
        />
      )}
      {vm.destinationFilter !== 'all' && (
        <FilterBadge
          label="Destination"
          value={vm.destinationFilter}
          onClear={() => vm.setDestinationFilter('all')}
        />
      )}
      {vm.vesselNameFilter !== 'all' && (
        <FilterBadge
          label="Vessel"
          value={vm.vesselNameFilter}
          onClear={() => vm.setVesselNameFilter('all')}
        />
      )}
      {vm.terminalFilter !== 'all' && (
        <FilterBadge
          label="Terminal"
          value={vm.terminalFilter}
          onClear={() => vm.setTerminalFilter('all')}
        />
      )}
      {vm.operationStatusFilter.length > 0 && (
        <FilterBadge
          label="Status"
          value={`${vm.operationStatusFilter.length} selected`}
          onClear={() => vm.setOperationStatusFilter([])}
        />
      )}
      <Button variant="ghost" size="sm" onClick={vm.clearFilters}>
        Clear all filters
      </Button>
    </div>
  );
}

interface FilterBadgeProps {
  label: string;
  value: string;
  onClear: () => void;
}

function FilterBadge({ label, value, onClear }: FilterBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1">
      {label}: {value}
      <X className="h-3 w-3 cursor-pointer" onClick={onClear} />
    </Badge>
  );
}

// --- Mobile Card View ---
function MobileCardView({ vm }: ChartSectionProps) {
  return (
    <div className="md:hidden">
      <div className="p-4 space-y-3">
        {vm.loading ? (
          <LoadingState />
        ) : vm.error ? (
          <ErrorState error={vm.error} onRetry={vm.retryFetch} />
        ) : vm.paginatedData.length === 0 ? (
          <EmptyState />
        ) : (
          vm.paginatedData.map((row) => <MobileVesselCard key={row.id} row={row} />)
        )}
      </div>

      {/* Mobile Pagination */}
      <MobilePagination vm={vm} />
    </div>
  );
}

function MobileVesselCard({ row }: { row: VesselData }) {
  return (
    <Card className="bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 transition-all duration-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base truncate">{row.vessel_name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {getCommodityLabel(row.commodity_description)}
            </p>
          </div>
          <Badge
            className={`border ${getStatusBadge(row.status)} pointer-events-none whitespace-nowrap flex-shrink-0`}
          >
            {row.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Operation</p>
            <p className="text-slate-300 font-medium">{row.operation_type}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Quantity</p>
            <p className="text-slate-300 font-medium">{formatQuantity(row.quantity)} mt</p>
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
              {row.operation_completed
                ? new Date(row.operation_completed).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{row.shipper}</span>
            <span className="text-slate-500">
              {(() => {
                const parsed = parseDepartureLocation(row.departure_location);
                return parsed ? `${parsed.countryCode}-${parsed.port}` : '—';
              })()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MobilePagination({ vm }: ChartSectionProps) {
  return (
    <div className="px-4 pb-4 border-t border-slate-700/50">
      <div className="pt-4 space-y-3">
        <div className="text-xs text-slate-400 text-center">
          Showing {(vm.currentPage - 1) * vm.pageSize + 1}-
          {Math.min(vm.currentPage * vm.pageSize, vm.totalCount)} of {vm.totalCount}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => vm.setCurrentPage(Math.max(1, vm.currentPage - 1))}
            disabled={vm.currentPage === 1}
            className="flex-1 mr-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm text-slate-400 px-3 whitespace-nowrap">
            {vm.currentPage} / {vm.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => vm.setCurrentPage(Math.min(vm.totalPages, vm.currentPage + 1))}
            disabled={vm.currentPage === vm.totalPages}
            className="flex-1 ml-2"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Desktop Table View ---
function DesktopTableView({ vm }: ChartSectionProps) {
  const visibleCols = vm.columns.filter((col) => vm.visibleColumns[col.key]);

  return (
    <div className="hidden md:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b-slate-700/50">
            {visibleCols.map((column) => (
              <TableHead
                key={column.key}
                className="text-slate-400 font-semibold cursor-pointer hover:bg-slate-700/30 whitespace-nowrap"
                onClick={() => vm.handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {vm.sortField === column.key &&
                    (vm.sortDirection === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {vm.loading ? (
            <TableRow>
              <TableCell colSpan={visibleCols.length} className="text-center py-12">
                <LoadingState />
              </TableCell>
            </TableRow>
          ) : vm.error ? (
            <TableRow>
              <TableCell colSpan={visibleCols.length} className="text-center py-12">
                <ErrorState error={vm.error} onRetry={vm.retryFetch} />
              </TableCell>
            </TableRow>
          ) : vm.paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleCols.length} className="text-center py-12">
                <EmptyState />
              </TableCell>
            </TableRow>
          ) : (
            vm.paginatedData.map((row) => (
              <TableRow
                key={row.id}
                className="border-b-slate-800 hover:bg-slate-700/10 transition-colors duration-200"
              >
                {visibleCols.map((column) => (
                  <TableCell
                    key={`${column.key}-${column.label}`}
                    className="text-slate-300 whitespace-nowrap"
                  >
                    <TableCellContent row={row} column={column} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>

        <TableFooter className="bg-slate-800/40 border-t border-slate-700/50">
          <tr>
            <td colSpan={visibleCols.length} className="p-0">
              <DesktopPagination vm={vm} />
            </td>
          </tr>
        </TableFooter>
      </Table>
    </div>
  );
}

function TableCellContent({ row, column }: { row: VesselData; column: ColumnConfig }) {
  if (column.customRender) {
    return <>{column.customRender(row)}</>;
  }

  switch (column.key) {
    case 'vessel_name':
      return <span className="font-medium text-white">{row.vessel_name}</span>;
    case 'status':
      return (
        <Badge
          className={`border ${getStatusBadge(row.status)} pointer-events-none whitespace-nowrap`}
        >
          {row.status}
        </Badge>
      );
    case 'operation_completed':
      return <>{formatOperationDate(row.operation_completed)}</>;
    case 'commodity_description':
      return <>{getCommodityLabel(row[column.key] || '')}</>;
    case 'quantity':
      return <span className="font-medium">{formatQuantity(row.quantity)}</span>;
    default:
      return <>{row[column.key] || '—'}</>;
  }
}

function DesktopPagination({ vm }: ChartSectionProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="text-sm text-slate-400">
          Showing {(vm.currentPage - 1) * vm.pageSize + 1} to{' '}
          {Math.min(vm.currentPage * vm.pageSize, vm.totalCount)} of {vm.totalCount} results
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400 whitespace-nowrap">Rows per page:</span>
            <Select
              value={vm.pageSize.toString()}
              onValueChange={(value) => vm.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="150">150</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="250">250</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-slate-400 text-center sm:text-left">
            Page {vm.currentPage} of {vm.totalPages}
          </div>

          <div className="flex items-center justify-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.setCurrentPage(1)}
              disabled={vm.currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.setCurrentPage(Math.max(1, vm.currentPage - 1))}
              disabled={vm.currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="hidden lg:flex items-center space-x-1">
              {vm.pageList.map((p, idx) =>
                typeof p === 'number' ? (
                  <Button
                    key={`${p}-${idx}`}
                    variant={p === vm.currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => vm.setCurrentPage(p)}
                    className="h-8 min-w-[2rem] text-xs"
                  >
                    {p}
                  </Button>
                ) : (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">
                    {p}
                  </span>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.setCurrentPage(Math.min(vm.totalPages, vm.currentPage + 1))}
              disabled={vm.currentPage === vm.totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.setCurrentPage(vm.totalPages)}
              disabled={vm.currentPage === vm.totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Shared Components ---
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-slate-400">Loading vessel data...</p>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
      <p className="text-red-400 mb-4">{error}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-slate-400">No vessels found</p>
    </div>
  );
}
