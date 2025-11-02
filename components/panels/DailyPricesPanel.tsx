"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { LightweightChart } from '@/components/charts/LightweightChart';
import { mockPricesData, instrumentGroups } from '@/lib/mockData';
import { colorForCommodity } from '@/lib/commodityColors';
import { ChartInterval } from '@/types';
import { PanelHeader } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

interface DailyPricesPanelProps {
  className?: string;
}

const intervals: { value: ChartInterval; label: string }[] = [
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: 'YTD', label: 'YTD' },
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
  { value: 'MAX', label: 'MAX' },
];

export function DailyPricesPanel({ className }: DailyPricesPanelProps) {
  const [selectedInstrument, setSelectedInstrument] = useState('wheatBread');
  const [selectedInterval, setSelectedInterval] = useState<ChartInterval>('3M');
  const [searchTerm, setSearchTerm] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [comparedInstruments, setComparedInstruments] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['wheatBread', 'corn']);
  const [isLoading, setIsLoading] = useState(false);


  const commodities = [
    { id: "wheatBread", name: "Milling Wheat", currency: "EUR" },
    { id: "wheatFeed", name: "Feed Wheat", currency: "EUR" },
    { id: "barley", name: "Feed Barley", currency: "EUR" },
    { id: "corn", name: "Corn", currency: "EUR" },
    { id: "rapeseed", name: "Rapeseeds", currency: "EUR" },
    { id: "sunflower", name: "Sunflower Seeds", currency: "USD" },
    // { id: "SFS_FOB", name: "SFS FOB", currency: "USD" }
  ];

  const allInstruments = [
    ...instrumentGroups.grains,
    ...instrumentGroups.oilseeds,
    ...instrumentGroups.futures.CBOT,
    ...instrumentGroups.futures.MATIF,
  ];

  const getFilteredData = (symbol: string, interval: ChartInterval) => {
    const data = mockPricesData[symbol] || [];
    const now = new Date();
    let startDate = new Date();

    switch (interval) {
      case '1W':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'YTD':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case '5Y':
        startDate.setFullYear(now.getFullYear() - 5);
        break;
      case 'MAX':
        return data;
      default:
        startDate.setMonth(now.getMonth() - 3);
    }

    return data.filter(d => new Date(d.date) >= startDate);
  };

  // Get chart data for display
  const chartData = useMemo(() => {
    return getFilteredData(selectedInstrument, selectedInterval).map(item => ({
      date: item.date,
      price: item.close,
      volume: item.volume
    }));
  }, [selectedInstrument, selectedInterval]);

  const instrumentData = chartData.filter(item => item.price !== undefined).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const currentPrice = instrumentData.length > 0 ? instrumentData[instrumentData.length - 1].price : 0;
  const previousPrice = instrumentData.length > 1 ? instrumentData[instrumentData.length - 2].price : 0;
  const change = currentPrice - previousPrice;
  const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
  const priceChangeLabel = change > 0 ? "▲" : change < 0 ? "▼" : "";
  const priceChangeColor = change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-slate-400";

  const getInstrumentColor = (symbol: string, index: number = 0) => {
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
    return colors[index % colors.length];
  };

  const selectedCommodityData = commodities.find(c => c.id === selectedInstrument) || allInstruments.find(i => i.symbol === selectedInstrument);

  // Derive a display unit/currency label safely across different instrument shapes
  const selectedUnit = useMemo(() => {
    const direct = commodities.find(c => c.id === selectedInstrument);
    if (direct) return direct.currency;
    const instr = allInstruments.find(i => i.symbol === selectedInstrument) as any;
    const unitString: string | undefined = instr?.unit;
    if (unitString) {
      const currency = unitString.split('/')[0];
      return currency;
    }
    return '';
  }, [selectedInstrument, commodities, allInstruments]);
  
  // Derive a safe color to avoid accessing missing property on instrumentGroups entries
  const selectedColor = useMemo(() => {
    const direct = commodities.find(c => c.id === selectedInstrument);
    if (direct) return colorForCommodity(direct.id);
    return colorForCommodity(selectedInstrument);
  }, [selectedInstrument, commodities]);

  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Commodity Selector - First on mobile, right side on desktop */}
      <div className="order-1 lg:order-2">
        <Card className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Select Commodity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {commodities.map((commodity) => (
              <Button
                key={commodity.id}
                variant={selectedInstrument === commodity.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-between text-left font-medium transition-all duration-200",
                  selectedInstrument === commodity.id
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                )}
                onClick={() => setSelectedInstrument(commodity.id)}
              >
                <span>{commodity.name}</span>
                <span className="text-sm opacity-75">{commodity.currency}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Chart - Second on mobile, left side on desktop */}
      <div className="order-2 lg:order-1 lg:col-span-2">
        <Card className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              DAILY PRICES CPT CONSTANTA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-300">
                {selectedCommodityData?.name} Price Chart
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Drag to pan • Scroll to zoom • Showing {chartData.length} data points
              </p>
            </div>
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
              </div>
            ) : (
              <LightweightChart
                data={chartData}
                color={selectedColor}
                height={384}
                unit={selectedUnit}
              />
            )}

            {!isLoading && (
              <div className="mt-4 flex items-center justify-between rounded-md border border-slate-700/60 bg-slate-800/40 px-4 py-3 text-sm">
                <div className="text-slate-300">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Latest Price</div>
                  <div className="text-lg font-semibold text-white">
                    {currentPrice?.toFixed(2)} {selectedUnit}
                  </div>
                </div>
                <div className={`${priceChangeColor} font-semibold`}>
                  {priceChangeLabel} {Math.abs(change).toFixed(2)} {selectedUnit}
                  <span className="ml-2 text-xs text-slate-400">
                    ({changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface InstrumentRowProps {
  instrument: { symbol: string; name: string; type: string };
  isSelected: boolean;
  isFavorite: boolean;
  isCompared: boolean;
  compareMode: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onToggleCompare: () => void;
  currentPrice: number;
}

function InstrumentRow({
  instrument,
  isSelected,
  isFavorite,
  isCompared,
  compareMode,
  onSelect,
  onToggleFavorite,
  onToggleCompare,
  currentPrice,
}: InstrumentRowProps) {
  return (
    <div className={cn(
      'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors',
      isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
    )}>
      <div className="flex items-center space-x-2 flex-1" onClick={onSelect}>
        <div className="flex-1">
          <div className="font-medium text-sm">{instrument.name}</div>
          <div className="text-xs text-muted-foreground">{instrument.symbol}</div>
        </div>
        {currentPrice > 0 && (
          <div className="text-sm font-medium">
            {currentPrice.toFixed(2)}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="h-6 w-6 p-0"
        >
          <Star className={cn('h-3 w-3', isFavorite ? 'fill-warning text-warning' : '')} />
        </Button>
        
        {compareMode && (
          <Checkbox
            checked={isCompared}
            onCheckedChange={onToggleCompare}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </div>
  );
}
