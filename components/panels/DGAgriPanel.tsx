"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockDGAgriData } from '@/lib/mockData';
import { PanelHeader } from '@/components/layout/DashboardLayout';
import { colorForCommodity } from '@/lib/commodityColors';
import { cn } from '@/lib/utils';

interface DGAgriPanelProps {
  className?: string;
}

export function DGAgriPanel({ className }: DGAgriPanelProps) {
  const [tradeType, setTradeType] = useState<'Export' | 'Import'>('Export');
  const [commodity, setCommodity] = useState('WHEAT');
  const [selectedCategory, setSelectedCategory] = useState('Wheat Export');

  // Base commodity color for selected crop
  const baseColor = React.useMemo(() => colorForCommodity(commodity), [commodity]);

  const withAlpha = (hex: string, alpha: number) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) || 0;
    const g = parseInt(clean.substring(2, 4), 16) || 0;
    const b = parseInt(clean.substring(4, 6), 16) || 0;
    const a = Math.min(Math.max(alpha, 0), 1);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  const commodities = [
    { id: 'WHEAT', label: 'Wheat', exportKey: 'Wheat Export', importKey: 'Wheat Import' },
    { id: 'BARLEY', label: 'Barley', exportKey: 'Barley Export', importKey: 'Barley Import' },
    { id: 'CORN', label: 'Corn', exportKey: 'Corn Export', importKey: 'Corn Import' },
    { id: 'RAPESEED', label: 'Rapeseed', exportKey: 'Rapeseed Export', importKey: 'Rapeseed Import' },
    { id: 'SUNFLOWER', label: 'Sunflower Seeds', exportKey: 'Sunflower Export', importKey: 'Sunflower Import' },
    { id: 'RAPESEED_OIL', label: 'Rapeseed Oil', exportKey: 'Rapeseed Oil Export', importKey: 'Rapeseed Oil Import' },
    { id: 'SUNFLOWER_OIL', label: 'Sunflower Oil', exportKey: 'Sunflower Oil Export', importKey: 'Sunflower Oil Import' },
    { id: 'SOYBEANS', label: 'Soybeans', exportKey: 'Soybeans Export', importKey: 'Soybeans Import' },
    { id: 'SOY_OIL', label: 'Soy Oil', exportKey: 'Soy Oil Export', importKey: 'Soy Oil Import' },
    { id: 'RPS_MEAL', label: 'RPS Meal', exportKey: 'RPS Meal Export', importKey: 'RPS Meal Import' },
    { id: 'SFS_MEAL', label: 'SFS Meal', exportKey: 'SFS Meal Export', importKey: 'SFS Meal Import' },
    { id: 'SOY_MEAL', label: 'Soy Meal', exportKey: 'Soy Meal Export', importKey: 'Soy Meal Import' },
  ];

  // Update selected category when trade type or commodity changes
  useEffect(() => {
    const selectedCommodity = commodities.find(c => c.id === commodity);
    if (selectedCommodity) {
      const key = tradeType === 'Export' ? selectedCommodity.exportKey : selectedCommodity.importKey;
      setSelectedCategory(key);
    }
  }, [tradeType, commodity]);

  const currentYearData = mockDGAgriData[selectedCategory] || [];

  // Simplified chart data - YTD only (no year comparison)
  const chartData = currentYearData.map((current) => {
    return {
      country: current.country,
      value: current.value,
      period: current.period,
    };
  });

  // Calculate dynamic Y-axis domain for clean display
  const maxValue = Math.max(...chartData.map(d => d.value), 0);

  // Round maxValue up to nearest 10k, then add exactly 40k buffer
  const roundedMax = Math.ceil(maxValue / 10000) * 10000;
  const yAxisMax = roundedMax + 40000;

  const categories = Object.keys(mockDGAgriData);

  const exportData = () => {
    const csv = [
      'Country/Item,Value (Tonnes),Period',
      ...chartData.map(row => `${row.country},${row.value},${row.period}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCategory.toLowerCase().replace(' ', '-')}-data.csv`;
    a.click();
  };


  return (
    <Card className={cn('h-full flex flex-col bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-white">DG AGRI Trade Data (YTD)</CardTitle>
          <span
            className="text-xs text-slate-400 cursor-help border-b border-dashed border-slate-400"
            title="Year-to-Date: Cumulative trade volumes for the current marketing year"
          >
            ?
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          EU country-level trade volumes for the current marketing year
        </p>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {/* Trade Type Tabs */}
        <div className="p-4 border-b border-slate-700/50">
          <Tabs value={tradeType} onValueChange={(value) => setTradeType(value as 'Export' | 'Import')}>
            <TabsList className="w-full flex justify-center gap-2">
              <TabsTrigger value="Export">Export</TabsTrigger>
              <TabsTrigger value="Import">Import</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Commodity Selection */}
        <div className="p-4 border-b border-slate-700/50">
          {/* Mobile: Select Dropdown */}
          <div className="block md:hidden">
            <Select value={commodity} onValueChange={setCommodity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                {commodities.map((comm) => (
                  <SelectItem key={comm.id} value={comm.id}>
                    {comm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Scrollable Tabs */}
          <div className="hidden md:block">
            <Tabs value={commodity} onValueChange={setCommodity}>
              <div className="overflow-x-auto">
                <TabsList className="inline-flex w-auto flex-nowrap gap-2">
                  {commodities.map((comm) => (
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

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 outline-none focus:outline-none [&>*]:outline-none [&>*]:focus:outline-none" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                    color: '#ffffff'
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
        </div>

        {/* All categories are now in the TabsList above; removed extra section */}

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <p className="text-xs text-muted-foreground">
            EU Trade data from DG AGRI reports. Values in metric tonnes.
            Data covers import/export volumes for grains and oilseeds.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
