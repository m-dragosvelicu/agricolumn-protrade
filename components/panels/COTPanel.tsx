"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockCOTData } from '@/lib/mockData';
import { PanelHeader } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

interface COTPanelProps {
  className?: string;
}

export function COTPanel({ className }: COTPanelProps) {
  const [selectedCommodity, setSelectedCommodity] = useState('CBOT Wheat');
  const data = mockCOTData[selectedCommodity] || [];

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
        <CardTitle className="text-white">Futures Prices</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {/* Commodity Tabs */}
        <div className="p-4 border-b border-slate-700/50">
          <Tabs value={selectedCommodity} onValueChange={setSelectedCommodity}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="CBOT Wheat">CBOT Wheat</TabsTrigger>
              <TabsTrigger value="CBOT Corn">CBOT Corn</TabsTrigger>
              <TabsTrigger value="CBOT Soybean">CBOT Soy</TabsTrigger>
              <TabsTrigger value="Euronext Wheat">EUR Wheat</TabsTrigger>
              <TabsTrigger value="Euronext Corn">EUR Corn</TabsTrigger>
              <TabsTrigger value="Euronext RPS">EUR RPS</TabsTrigger>
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
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(2), 'Price']}
                  labelFormatter={(value) => `Date: ${value}`}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                  name={selectedCommodity}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Note */}
        <div className="p-4 border-t border-slate-700/50">
          <p className="text-xs text-muted-foreground">
            Futures prices for CBOT and Euronext commodities. 
            Data updated weekly. Prices shown in cents per bushel for grains and USD per metric ton for others.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}