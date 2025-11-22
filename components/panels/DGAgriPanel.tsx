'use client';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDGAgriViewModel, type DGAgriChartDataPoint } from '@/hooks/viewModels';
import type { DGAgriTradeType, DGAgriMetadata } from '@/lib/api/dgAgri';

interface DGAgriPanelProps {
  className?: string;
}

/**
 * DGAgriPanel - View Component
 * Pure presentational component that renders UI based on ViewModel state
 */
export function DGAgriPanel({ className }: DGAgriPanelProps) {
  const vm = useDGAgriViewModel();

  return (
    <Card
      className={cn(
        'h-full flex flex-col bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50',
        className
      )}
    >
      {/* Header */}
      <DGAgriHeader
        metadata={vm.metadata}
        countryData={vm.countryData}
        canExport={vm.canExport}
        onExport={vm.exportToCsv}
      />

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
        <DGAgriChart
          chartData={vm.chartData}
          isLoading={vm.isMetadataLoading || vm.isDataLoading}
          metadataError={vm.metadataError}
          dataError={vm.dataError}
          baseColor={vm.baseColor}
          yAxisMax={vm.yAxisMax}
        />

        {/* Footer */}
        <DGAgriFooter />
      </CardContent>
    </Card>
  );
}

// --- Sub-components (pure presentational) ---

interface DGAgriHeaderProps {
  metadata: DGAgriMetadata | null;
  countryData: { periodLabel?: string | null } | null;
  canExport: boolean;
  onExport: () => void;
}

function DGAgriHeader({
  metadata,
  countryData,
  canExport,
  onExport,
}: DGAgriHeaderProps) {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle className="text-white">DG AGRI Trade Data (YTD)</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            EU country-level trade volumes for the current marketing year
          </p>
          {metadata && (
            <p className="text-xs text-slate-400 mt-2">
              Marketing year:{' '}
              <span className="text-slate-200">
                {metadata.marketingYear ?? '—'}
              </span>
              {countryData?.periodLabel && (
                <>
                  {' '}
                  · Period:{' '}
                  <span className="text-slate-200">
                    {countryData.periodLabel}
                  </span>
                </>
              )}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={!canExport}
          className="border-slate-600 text-slate-200 hover:bg-slate-700/40"
        >
          Export CSV
        </Button>
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
    <div className="p-4 border-b border-slate-700/50">
      <Tabs
        value={tradeType}
        onValueChange={(value) => onTradeTypeChange(value as DGAgriTradeType)}
      >
        <TabsList className="w-full flex justify-center gap-2">
          <TabsTrigger value="Export">Export</TabsTrigger>
          <TabsTrigger value="Import">Import</TabsTrigger>
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
    <div className="p-4 border-b border-slate-700/50">
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
            {commodityOptions.map((comm) => (
              <SelectItem key={comm.id} value={comm.id}>
                {comm.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Scrollable Tabs */}
      <div className="hidden md:block">
        <Tabs value={commodity ?? undefined} onValueChange={onCommodityChange}>
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-auto flex-nowrap gap-2">
              {commodityOptions.map((comm) => (
                <TabsTrigger
                  key={comm.id}
                  value={comm.id}
                  className="whitespace-nowrap"
                >
                  {comm.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

interface DGAgriChartProps {
  chartData: DGAgriChartDataPoint[];
  isLoading: boolean;
  metadataError: string | null;
  dataError: string | null;
  baseColor: string;
  yAxisMax: number;
}

function DGAgriChart({
  chartData,
  isLoading,
  metadataError,
  dataError,
  baseColor,
  yAxisMax,
}: DGAgriChartProps) {
  if (isLoading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-slate-400 text-sm">
        Loading DG AGRI data…
      </div>
    );
  }

  if (metadataError) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-red-300 text-sm text-center">
        {metadataError}
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-red-300 text-sm text-center px-4">
        {dataError}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-slate-400 text-sm text-center px-4">
        No DG AGRI data found for this selection.
      </div>
    );
  }

  return (
    <div
      className="flex-1 p-4 outline-none focus:outline-none [&>*]:outline-none [&>*]:focus:outline-none"
      style={{ height: '380px' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="country"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#9ca3af"
          />
          <YAxis
            fontSize={12}
            tickFormatter={(value) => value.toLocaleString()}
            stroke="#9ca3af"
            domain={[0, yAxisMax]}
          />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), 'Tonnes']}
            labelFormatter={(label) => `Country: ${label}`}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#ffffff',
            }}
          />
          <Bar
            dataKey="value"
            fill={baseColor}
            name="YTD Volume"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DGAgriFooter() {
  return (
    <div className="p-4 border-t border-slate-700/50">
      <p className="text-xs text-muted-foreground">
        DG AGRI official reports · Values in metric tonnes · Cached data refreshes
        when new files are imported.
      </p>
    </div>
  );
}
