"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockCOTData } from '@/lib/mockData';
import { PanelHeader } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';
import { calculateYAxisRange } from '@/lib/chartUtils';
import { colorForCommodity } from '@/lib/commodityColors';
import { cotCftcApi, type CotCftcPair, type Exchange, type Commodity } from '@/lib/api/cotCftc';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

interface COTPanelProps {
  className?: string;
}

// Mapping between frontend display values and backend API values
const COT_COMMODITIES = [
  { value: 'CBOT Wheat', label: 'CFTC CME WHEAT', exchange: 'CBOT' as Exchange, commodity: 'WHEAT' as Commodity },
  { value: 'CBOT Corn', label: 'CFTC CME CORN', exchange: 'CBOT' as Exchange, commodity: 'CORN' as Commodity },
  { value: 'CBOT Soybean', label: 'CFTC CME SOYBEANS', exchange: 'CBOT' as Exchange, commodity: 'SOY' as Commodity },
  { value: 'CBOT Soy Oil', label: 'CFTC CME SOY OIL', exchange: 'CBOT' as Exchange, commodity: 'SOY' as Commodity },
  { value: 'Euronext Wheat', label: 'COT EUR WHEAT', exchange: 'EURONEXT' as Exchange, commodity: 'WHEAT' as Commodity },
  { value: 'Euronext Corn', label: 'COT EUR CORN', exchange: 'EURONEXT' as Exchange, commodity: 'CORN' as Commodity },
  { value: 'Euronext RPS', label: 'COT EUR RPS', exchange: 'EURONEXT' as Exchange, commodity: 'RPS' as Commodity },
];

export function COTPanel({ className }: COTPanelProps) {
  const [selectedCommodity, setSelectedCommodity] = useState('CBOT Wheat');
  const [cotData, setCotData] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const data = useMockData ? (mockCOTData[selectedCommodity] || []) : (cotData[selectedCommodity] || []);
  const lineColor = useMemo(() => colorForCommodity(selectedCommodity), [selectedCommodity]);

  // Fetch data from API
  useEffect(() => {
    const fetchCotData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await cotCftcApi.getLatest({ limit: 7 });

        // Handle empty response (no data uploaded yet)
        if (!response || response.length === 0) {
          console.log('No COT-CFTC data available yet. Using demo data.');
          setUseMockData(true);
          setIsLoading(false);
          return;
        }

        // Transform API response to match the existing data structure
        const transformedData: Record<string, any[]> = {};

        response.forEach((pair: CotCftcPair) => {
          // Find the matching frontend commodity key
          const commodityConfig = COT_COMMODITIES.find(
            c => c.exchange === pair.exchange && c.commodity === pair.commodity
          );

          if (commodityConfig) {
            // Transform positions to the expected format
            transformedData[commodityConfig.value] = pair.positions.map(pos => ({
              date: pos.date,
              price: pos.value, // Backend uses "value", frontend expects "price"
            }));
          }
        });

        setCotData(transformedData);
        setUseMockData(false);
      } catch (err: any) {
        console.error('Failed to fetch COT data:', err);
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          message: err.response?.data?.message,
          data: err.response?.data,
          url: err.config?.url,
          fullError: err,
        });

        // If it's a 500 error with no data, just use mock data silently
        if (err.response?.status === 500) {
          console.log('Backend error (likely no data uploaded yet). Using demo data.');
          setUseMockData(true);
          setError(null); // Don't show error to user
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load COT data');
          setUseMockData(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCotData();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await cotCftcApi.getLatest({ limit: 7 });

      // Handle empty response (no data uploaded yet)
      if (!response || response.length === 0) {
        console.log('No COT-CFTC data available yet. Using demo data.');
        setUseMockData(true);
        setIsLoading(false);
        return;
      }

      const transformedData: Record<string, any[]> = {};

      response.forEach((pair: CotCftcPair) => {
        const commodityConfig = COT_COMMODITIES.find(
          c => c.exchange === pair.exchange && c.commodity === pair.commodity
        );

        if (commodityConfig) {
          transformedData[commodityConfig.value] = pair.positions.map(pos => ({
            date: pos.date,
            price: pos.value,
          }));
        }
      });

      setCotData(transformedData);
      setUseMockData(false);
    } catch (err: any) {
      console.error('Failed to refresh COT data:', err);

      // If it's a 500 error, likely no data exists yet
      if (err.response?.status === 500) {
        console.log('Backend error (likely no data uploaded yet). Using demo data.');
        setUseMockData(true);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to refresh COT data');
        setUseMockData(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">FUNDS NET POSITION</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8"
            title="Refresh data"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
        {useMockData && (
          <p className="text-xs text-slate-400 mt-1">
            Using demo data • Upload COT-CFTC data in admin panel to see real positions
          </p>
        )}
        {error && (
          <p className="text-xs text-red-400 mt-1">
            {error}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {/* Commodity Selection */}
        <div className="p-4 border-b border-slate-700/50">
          {/* Mobile: Select Dropdown */}
          <div className="block md:hidden">
            <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                {COT_COMMODITIES.map((commodity) => (
                  <SelectItem key={commodity.value} value={commodity.value}>
                    {commodity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Scrollable Tabs */}
          <div className="hidden md:block">
            <Tabs value={selectedCommodity} onValueChange={setSelectedCommodity}>
              <div className="overflow-x-auto">
                <TabsList className="inline-flex w-auto flex-nowrap gap-2">
                  {COT_COMMODITIES.map((commodity) => (
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


        {/* Debug Info */}
        {/* Removed debug block for production styling */}

        {/* Chart */}
        <div className="flex-1 p-4 outline-none focus:outline-none [&>*]:outline-none [&>*]:focus:outline-none">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <AlertCircle className="h-12 w-12 text-slate-500" />
              <p className="text-muted-foreground">No data available for {selectedCommodity}</p>
              <p className="text-xs text-slate-500">Upload COT-CFTC data in the admin panel to see positions here</p>
            </div>
          ) : (
            <div className="outline-none focus:outline-none [&>*]:outline-none [&>*]:focus:outline-none" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    color: '#ffffff'
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
                    )
                  }}
                />
              </LineChart>
              </ResponsiveContainer>
            </div>
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
