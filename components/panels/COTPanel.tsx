"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockCOTData } from '@/lib/mockData';
import { PanelHeader } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';
import { calculateYAxisRange } from '@/lib/chartUtils';

interface COTPanelProps {
  className?: string;
}

export function COTPanel({ className }: COTPanelProps) {
  const [selectedCommodity, setSelectedCommodity] = useState('CBOT Wheat');
  const data = mockCOTData[selectedCommodity] || [];

  // Calculate smart Y-axis range with 5% padding
  const yAxisDomain = useMemo(() => {
    const range = calculateYAxisRange(data, 'price', 0.05);
    return [range.min, range.max] as [number, number];
  }, [data]);

  const exportData = () => {
    const csv = [
      'Date,Price',
      ...data.map(row => 
        `${row.date},${row.price}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCommodity.toLowerCase().replace(' ', '-')}-prices.csv`;
    a.click();
  };

  return (
    <Card className={cn('h-full flex flex-col bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50', className)}>
      <CardHeader>
        <CardTitle className="text-white">FUNDS NET POSITION</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {/* Commodity Tabs */}
        <div className="p-4 border-b border-slate-700/50">
          <Tabs value={selectedCommodity} onValueChange={setSelectedCommodity}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="CBOT Wheat">CFTC CME WHEAT</TabsTrigger>
              <TabsTrigger value="CBOT Corn">CFTC CME CORN</TabsTrigger>
              <TabsTrigger value="CBOT Soybean">CFTC CME SOYBEANS</TabsTrigger>
              <TabsTrigger value="CBOT Soy Oil">CFTC CME SOY OIL</TabsTrigger>
              <TabsTrigger value="Euronext Wheat">COT EUR WHEAT</TabsTrigger>
              <TabsTrigger value="Euronext Corn">COT EUR CORN</TabsTrigger>
              <TabsTrigger value="Euronext RPS">COT EUR RPS</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>


        {/* Debug Info */}
        {/* Removed debug block for production styling */}

        {/* Chart */}
        <div className="flex-1 p-4">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No data available for {selectedCommodity}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString(), 'Net Position']}
                  labelFormatter={(value) => `Date: ${value}`}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Line
                  type="linear"
                  dataKey="price"
                  stroke="#eab308"
                  strokeWidth={3}
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, fill: '#eab308' }}
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
                          fill="#eab308"
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
                    )
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Note */}
        <div className="p-4 border-t border-slate-700/50">
          <p className="text-xs text-muted-foreground">
            Net positions from funds in commodity futures markets.
            Data updated weekly (7-day cadence). Values represent net long/short positions in number of contracts.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            COT = Commitment of Traders | CFTC = Commodities Futures Trading Commission
          </p>
        </div>
      </CardContent>
    </Card>
  );
}