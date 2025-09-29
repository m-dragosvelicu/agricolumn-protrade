"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockDGAgriData } from '@/lib/mockData';
import { PanelHeader } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

interface DGAgriPanelProps {
  className?: string;
}

export function DGAgriPanel({ className }: DGAgriPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState('EU Wheat Export');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('chart');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data = mockDGAgriData[selectedCategory] || [];
  const categories = Object.keys(mockDGAgriData);

  const exportData = () => {
    const csv = [
      'Country/Item,Value,Period',
      ...data.map(row => `${row.country},${row.value},${row.period}`)
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
        {/* Category Tabs */}
        <div className="p-4 border-b border-slate-700/50">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full flex flex-wrap gap-2">
              {(() => {
                const base = [
                  'EU Wheat Export',
                  'Wheat Import',
                  'Corn Import',
                  'Romania Export',
                  'EU Grains Export',
                ];
                const rest = categories.filter((c) => !base.includes(c));
                const ordered = [...base, ...rest];
                return ordered.map((cat) => (
                  <TabsTrigger key={cat} value={cat}>
                    {cat}
                  </TabsTrigger>
                ));
              })()}
            </TabsList>
          </Tabs>
        </div>

        {/* View Mode Toggle */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'chart' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('chart')}
            >
              Chart View
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table View
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'table' ? (
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{selectedCategory}</h3>
                <p className="text-sm text-muted-foreground">
                  Period: {data[0]?.period || 'N/A'}
                </p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country/Item</TableHead>
                    <TableHead className="text-right">Value (tonnes)</TableHead>
                    <TableHead>Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index} className="hover:bg-transparent">
                      <TableCell className="font-medium">{row.country}</TableCell>
                      <TableCell className="text-right">
                        {row.value.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {row.period}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-4" style={{ height: '400px' }}>
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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

                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      name="Volume (tonnes)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-slate-400">Loading chart...</div>
                </div>
              )}
            </div>
          )}
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