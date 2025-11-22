'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useEUWeeklyTradeViewModel, type EUWeeklyTradeChartDataPoint } from '@/hooks/viewModels';
import type { DGAgriMetadata, DGAgriTradeType } from '@/lib/api/dgAgri';

interface EUWeeklyTradePanelProps {
  className?: string;
}

/**
 * EUWeeklyTradePanel - View Component
 * Pure presentational component that renders UI based on ViewModel state
 */
export function EUWeeklyTradePanel({ className }: EUWeeklyTradePanelProps) {
  const vm = useEUWeeklyTradeViewModel();

  return (
    <Card
      className={cn(
        'h-full flex flex-col bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50',
        className
      )}
    >
      {/* Header */}
      <EUWeeklyTradeHeader weekLabel={vm.summary?.weekLabel} />

      <CardContent className="flex-1 p-0 flex flex-col">
        {/* Trade Type Selector */}
        <TradeTypeSelector
          tradeType={vm.tradeType}
          onTradeTypeChange={vm.setTradeType}
        />

        {/* Commodity Selector */}
        <CommoditySelector
          commodityOptions={vm.commodityOptions}
          commodity={vm.commodity}
          isLoading={vm.isMetadataLoading}
          onCommodityChange={vm.setCommodity}
        />

        {/* Chart */}
        <EUWeeklyTradeChart
          chartData={vm.chartData}
          isLoading={vm.isMetadataLoading || vm.isSummaryLoading}
          metadataError={vm.metadataError}
          summaryError={vm.summaryError}
          weekLabel={vm.summary?.weekLabel || 'Current week'}
          percentChange={vm.percentChange}
          xAxisMax={vm.xAxisMax}
          baseColor={vm.baseColor}
          lastYearColor={vm.lastYearColor}
        />
      </CardContent>
    </Card>
  );
}

// --- Sub-components (pure presentational) ---

interface EUWeeklyTradeHeaderProps {
  weekLabel?: string | null;
}

function EUWeeklyTradeHeader({ weekLabel }: EUWeeklyTradeHeaderProps) {
  return (
    <CardHeader className="border-b border-slate-700/50 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="text-white">
            EU Weekly Trade Comparison
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Current marketing week vs same week last year
          </p>
          {weekLabel && (
            <p className="text-xs text-slate-400 mt-2">{weekLabel}</p>
          )}
        </div>
      </div>
    </CardHeader>
  );
}

interface TradeTypeSelectorProps {
  tradeType: DGAgriTradeType;
  onTradeTypeChange: (tradeType: DGAgriTradeType) => void;
}

function TradeTypeSelector({
  tradeType,
  onTradeTypeChange,
}: TradeTypeSelectorProps) {
  return (
    <div className="px-4 py-3 border-b border-slate-700/50">
      <Tabs
        value={tradeType}
        onValueChange={(value) => onTradeTypeChange(value as DGAgriTradeType)}
      >
        <TabsList className="w-full flex justify-center gap-2">
          <TabsTrigger value="Export" className="flex-1">
            Export
          </TabsTrigger>
          <TabsTrigger value="Import" className="flex-1">
            Import
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

interface CommoditySelectorProps {
  commodityOptions: DGAgriMetadata['commodities'];
  commodity: string | null;
  isLoading: boolean;
  onCommodityChange: (commodity: string) => void;
}

function CommoditySelector({
  commodityOptions,
  commodity,
  isLoading,
  onCommodityChange,
}: CommoditySelectorProps) {
  return (
    <div className="px-4 py-3 border-b border-slate-700/50">
      {/* Mobile: Select Dropdown */}
      <div className="block md:hidden">
        <Select
          value={commodity ?? undefined}
          onValueChange={onCommodityChange}
        >
          <SelectTrigger
            className="w-full"
            disabled={isLoading || !commodityOptions.length}
          >
            <SelectValue placeholder="Select commodity" />
          </SelectTrigger>
          <SelectContent>
            {commodityOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Scrollable Button Group */}
      <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        <div className="flex gap-2 min-w-max">
          {commodityOptions.map((c) => (
            <button
              key={c.id}
              onClick={() => onCommodityChange(c.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                commodity === c.id
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface EUWeeklyTradeChartProps {
  chartData: EUWeeklyTradeChartDataPoint[];
  isLoading: boolean;
  metadataError: string | null;
  summaryError: string | null;
  weekLabel: string;
  percentChange: number;
  xAxisMax: number;
  baseColor: string;
  lastYearColor: string;
}

function EUWeeklyTradeChart({
  chartData,
  isLoading,
  metadataError,
  summaryError,
  weekLabel,
  percentChange,
  xAxisMax,
  baseColor,
  lastYearColor,
}: EUWeeklyTradeChartProps) {
  if (isLoading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-slate-400 text-sm">
        Loading weekly trade data…
      </div>
    );
  }

  if (metadataError) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-red-300 text-sm text-center px-4">
        {metadataError}
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-red-300 text-sm text-center px-4">
        {summaryError}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-slate-400 text-sm text-center px-4">
        No weekly data available for this selection.
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="space-y-3">
        {/* Week Label and YoY Change */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">{weekLabel}</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">YoY Change:</span>
            <span
              className={cn(
                'font-semibold',
                percentChange > 0
                  ? 'text-green-400'
                  : percentChange < 0
                    ? 'text-red-400'
                    : 'text-slate-400'
              )}
            >
              {percentChange > 0 ? '+' : ''}
              {percentChange.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="#9ca3af"
              domain={[0, xAxisMax]}
              tickFormatter={(value) => value.toLocaleString()}
              label={{
                value: 'Tonnes',
                position: 'insideBottom',
                offset: -5,
                style: { fill: '#9ca3af', fontSize: 12 },
              }}
            />
            <YAxis
              type="category"
              dataKey="category"
              stroke="#9ca3af"
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
              }}
              formatter={(value: number) => [
                `${value.toLocaleString()} tonnes`,
                'Volume',
              ]}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              label={{
                position: 'right',
                fill: '#ffffff',
                formatter: (value) =>
                  typeof value === 'number' ? value.toLocaleString() : String(value),
                fontSize: 12,
              }}
            >
              {chartData.map((entry) => (
                <Cell key={entry.category} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm pt-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: baseColor }}
            />
            <span className="text-slate-300">This Year</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: lastYearColor }}
            />
            <span className="text-slate-300">Last Year</span>
          </div>
        </div>
      </div>
    </div>
  );
}
