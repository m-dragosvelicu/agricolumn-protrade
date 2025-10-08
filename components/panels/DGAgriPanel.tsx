"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockDGAgriData, mockDGAgriDataLastYear } from '@/lib/mockData';
import { PanelHeader } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

interface DGAgriPanelProps {
  className?: string;
}

export function DGAgriPanel({ className }: DGAgriPanelProps) {
  const [tradeType, setTradeType] = useState<'Export' | 'Import'>('Export');
  const [commodity, setCommodity] = useState('WHEAT');
  const [selectedCategory, setSelectedCategory] = useState('EU Wheat Export');
  const [compareToLastYear, setCompareToLastYear] = useState(false);

  const commodities = [
    { id: 'WHEAT', label: 'Wheat', exportKey: 'EU Wheat Export', importKey: 'Wheat Import' },
    { id: 'BARLEY', label: 'Barley', exportKey: 'Barley Export', importKey: 'Barley Import' },
    { id: 'CORN', label: 'Corn', exportKey: 'EU Grains Export', importKey: 'Corn Import' },
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
  const lastYearData = mockDGAgriDataLastYear[selectedCategory] || [];

  // Merge current year and last year data
  const chartData = currentYearData.map((current) => {
    const lastYear = lastYearData.find((ly) => ly.country === current.country);
    return {
      country: current.country,
      thisYear: current.value,
      lastYear: lastYear ? lastYear.value : 0,
      period: current.period,
    };
  });

  const categories = Object.keys(mockDGAgriData);

  const exportData = () => {
    const csv = [
      'Country/Item,This Year,Last Year,Period',
      ...chartData.map(row => `${row.country},${row.thisYear},${row.lastYear},${row.period}`)
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
        <CardTitle className="text-white">DG AGRI Trade Data</CardTitle>
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

        {/* Commodity Tabs */}
        <div className="p-4 border-b border-slate-700/50">
          <Tabs value={commodity} onValueChange={setCommodity}>
            <TabsList className="w-full flex flex-wrap gap-2">
              {commodities.map((comm) => (
                <TabsTrigger key={comm.id} value={comm.id}>
                  {comm.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Compare Checkbox */}
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="compare-last-year"
              checked={compareToLastYear}
              onCheckedChange={(checked) => setCompareToLastYear(!!checked)}
            />
            <Label
              htmlFor="compare-last-year"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Compare to last year
            </Label>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4" style={{ height: '400px' }}>
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
                {compareToLastYear && (
                  <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="square"
                  />
                )}

                <Bar
                  dataKey="thisYear"
                  fill="#eab308"
                  name="This Year"
                  radius={[4, 4, 0, 0]}
                />
                {compareToLastYear && (
                  <Bar
                    dataKey="lastYear"
                    fill="#6b7280"
                    name="Last Year"
                    radius={[4, 4, 0, 0]}
                  />
                )}
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