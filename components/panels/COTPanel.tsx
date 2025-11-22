'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import {
  useCOTViewModel,
  COT_COMMODITIES,
  type CotCommodityOption,
  type CotDataPoint,
} from '@/hooks/viewModels';

interface COTPanelProps {
  className?: string;
}

/**
 * COTPanel - View Component
 * Pure presentational component that renders UI based on ViewModel state
 */
export function COTPanel({ className }: COTPanelProps) {
  const vm = useCOTViewModel();

  return (
    <Card
      className={cn(
        'h-full flex flex-col bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50',
        className
      )}
    >
      {/* Header */}
      <COTHeader
        onRefresh={vm.refresh}
        isLoading={vm.isLoading}
        error={vm.error}
      />

      <CardContent className="flex-1 p-0">
        {/* Commodity Selection */}
        <CommoditySelector
          commodities={COT_COMMODITIES}
          selectedCommodity={vm.selectedCommodity}
          onSelect={vm.setSelectedCommodity}
        />

        {/* Chart */}
        <COTChart
          data={vm.data}
          isLoading={vm.isLoading}
          lineColor={vm.lineColor}
          yAxisDomain={vm.yAxisDomain}
          selectedCommodity={vm.selectedCommodity}
        />

        {/* Footer */}
        <COTFooter />
      </CardContent>
    </Card>
  );
}

// --- Sub-components (pure presentational) ---

interface COTHeaderProps {
  onRefresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function COTHeader({ onRefresh, isLoading, error }: COTHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-white">FUNDS NET POSITION</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8"
          title="Refresh data"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </CardHeader>
  );
}

interface CommoditySelectorProps {
  commodities: CotCommodityOption[];
  selectedCommodity: string;
  onSelect: (commodity: string) => void;
}

function CommoditySelector({
  commodities,
  selectedCommodity,
  onSelect,
}: CommoditySelectorProps) {
  return (
    <div className="p-4 border-b border-slate-700/50">
      {/* Mobile: Select Dropdown */}
      <div className="block md:hidden">
        <Select value={selectedCommodity} onValueChange={onSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select commodity" />
          </SelectTrigger>
          <SelectContent>
            {commodities.map((commodity) => (
              <SelectItem key={commodity.value} value={commodity.value}>
                {commodity.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Scrollable Tabs */}
      <div className="hidden md:block">
        <Tabs value={selectedCommodity} onValueChange={onSelect}>
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-auto flex-nowrap gap-2">
              {commodities.map((commodity) => (
                <TabsTrigger
                  key={commodity.value}
                  value={commodity.value}
                  className="whitespace-nowrap"
                >
                  {commodity.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

interface COTChartProps {
  data: CotDataPoint[];
  isLoading: boolean;
  lineColor: string;
  yAxisDomain: [number, number];
  selectedCommodity: string;
}

function COTChart({
  data,
  isLoading,
  lineColor,
  yAxisDomain,
  selectedCommodity,
}: COTChartProps) {
  if (isLoading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-slate-500" />
        <p className="text-muted-foreground">
          No data available for {selectedCommodity}
        </p>
        <p className="text-xs text-slate-500">
          Upload COT-CFTC data in the admin panel to see positions here
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 p-4 outline-none focus:outline-none [&>*]:outline-none [&>*]:focus:outline-none"
      style={{ height: '400px' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            domain={yAxisDomain}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), 'Net Position']}
            labelFormatter={(value) => `Date: ${value}`}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#ffffff',
            }}
          />
          <Line
            type="linear"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={3}
            dot={{ r: 0 }}
            activeDot={{ r: 5, fill: lineColor }}
            name={selectedCommodity}
            label={{
              position: 'top',
              content: ({ x, y, value }: any) => (
                <g>
                  <rect
                    x={x - 25}
                    y={y - 20}
                    width={50}
                    height={16}
                    fill={lineColor}
                    rx={3}
                  />
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    fill="#000000"
                    fontSize={10}
                    fontWeight="bold"
                  >
                    {value.toLocaleString()}
                  </text>
                </g>
              ),
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function COTFooter() {
  return (
    <div className="p-4 border-t border-slate-700/50">
      <p className="text-xs text-muted-foreground">
        Net positions from funds in commodity futures markets. Data updated weekly
        (7-day cadence). Values represent net long/short positions in number of
        contracts.
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        COT = Commitment of Traders | CFTC = Commodities Futures Trading Commission
      </p>
    </div>
  );
}
