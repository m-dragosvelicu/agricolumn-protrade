'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { LightweightChart } from '@/components/charts/LightweightChart';
import { cn } from '@/lib/utils';
import {
  useDailyPricesViewModel,
  COMMODITIES,
  type CommodityOption,
  type PriceChange,
  type ChartDataPoint,
} from '@/hooks/viewModels';

interface DailyPricesPanelProps {
  className?: string;
}

/**
 * DailyPricesPanel - View Component
 * Pure presentational component that renders UI based on ViewModel state
 */
export function DailyPricesPanel({ className }: DailyPricesPanelProps) {
  const vm = useDailyPricesViewModel();

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}>
      {/* Commodity Selector - First on mobile, right side on desktop */}
      <CommoditySelector
        commodities={COMMODITIES}
        selectedInstrument={vm.selectedInstrument}
        onSelect={vm.setSelectedInstrument}
      />

      {/* Chart - Second on mobile, left side on desktop */}
      <ChartSection
        isLoading={vm.isLoading}
        error={vm.error}
        chartData={vm.chartData}
        selectedColor={vm.selectedColor}
        selectedUnit={vm.selectedUnit}
        priceChange={vm.priceChange}
        commodityName={vm.selectedCommodity?.name}
      />
    </div>
  );
}

// --- Sub-components (pure presentational) ---

interface CommoditySelectorProps {
  commodities: CommodityOption[];
  selectedInstrument: string;
  onSelect: (id: string) => void;
}

function CommoditySelector({
  commodities,
  selectedInstrument,
  onSelect,
}: CommoditySelectorProps) {
  return (
    <div className="order-1 lg:order-2">
      <Card className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Select Commodity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {commodities.map((commodity) => (
            <Button
              key={commodity.id}
              variant={selectedInstrument === commodity.id ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-between text-left font-medium transition-all duration-200',
                selectedInstrument === commodity.id
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              )}
              onClick={() => onSelect(commodity.id)}
            >
              <span>{commodity.name}</span>
              <span className="text-sm opacity-75">{commodity.currency}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface ChartSectionProps {
  isLoading: boolean;
  error: string | null;
  chartData: ChartDataPoint[];
  selectedColor: string;
  selectedUnit: string;
  priceChange: PriceChange;
  commodityName?: string;
}

function ChartSection({
  isLoading,
  error,
  chartData,
  selectedColor,
  selectedUnit,
  priceChange,
  commodityName,
}: ChartSectionProps) {
  return (
    <div className="order-2 lg:order-1 lg:col-span-2">
      <Card className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-500" />
            DAILY PRICES CPT CONSTANTA
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Chart Header */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300">
              {commodityName} Price Chart
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Drag to pan • Scroll to zoom • Showing {chartData.length} data points
            </p>
          </div>

          {/* Chart Content */}
          <ChartContent
            isLoading={isLoading}
            error={error}
            chartData={chartData}
            selectedColor={selectedColor}
            selectedUnit={selectedUnit}
          />

          {/* Price Summary */}
          {!isLoading && chartData.length > 0 && (
            <PriceSummary priceChange={priceChange} selectedUnit={selectedUnit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ChartContentProps {
  isLoading: boolean;
  error: string | null;
  chartData: ChartDataPoint[];
  selectedColor: string;
  selectedUnit: string;
}

function ChartContent({
  isLoading,
  error,
  chartData,
  selectedColor,
  selectedUnit,
}: ChartContentProps) {
  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-sm text-slate-400">
        <p>No daily price data available from the backend for this commodity.</p>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <LightweightChart
      data={chartData}
      color={selectedColor}
      height={384}
      unit={selectedUnit}
    />
  );
}

interface PriceSummaryProps {
  priceChange: PriceChange;
  selectedUnit: string;
}

function PriceSummary({ priceChange, selectedUnit }: PriceSummaryProps) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-md border border-slate-700/60 bg-slate-800/40 px-4 py-3 text-sm">
      <div className="text-slate-300">
        <div className="text-xs uppercase tracking-wide text-slate-400">
          Latest Price
        </div>
        <div className="text-lg font-semibold text-white">
          {priceChange.current?.toFixed(2)} {selectedUnit}
        </div>
      </div>
      <div className={`${priceChange.colorClass} font-semibold`}>
        {priceChange.label} {Math.abs(priceChange.change).toFixed(2)} {selectedUnit}
        <span className="ml-2 text-xs text-slate-400">
          ({priceChange.changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}
