"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getWeeklyTradeData,
  calculateYearOverYearChange,
} from "@/lib/weeklyTradeData";
import { colorForCommodity } from "@/lib/commodityColors";

interface EUWeeklyTradePanelProps {
  className?: string;
}

// Commodity definitions matching DG AGRI
const commodities = [
  { id: "WHEAT", label: "Wheat" },
  { id: "BARLEY", label: "Barley" },
  { id: "CORN", label: "Corn" },
  { id: "RAPESEED", label: "Rapeseed" },
  { id: "SUNFLOWER", label: "Sunflower" },
  { id: "RAPESEED_OIL", label: "Rapeseed Oil" },
  { id: "SUNFLOWER_OIL", label: "Sunflower Oil" },
  { id: "SOYBEANS", label: "Soybeans" },
  { id: "SOY_OIL", label: "Soy Oil" },
  { id: "RPS_MEAL", label: "RPS Meal" },
  { id: "SFS_MEAL", label: "SFS Meal" },
  { id: "SOY_MEAL", label: "Soy Meal" },
];

// Helper to add alpha transparency to hex colors
const withAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function EUWeeklyTradePanel({ className }: EUWeeklyTradePanelProps) {
  const [tradeType, setTradeType] = useState<"Export" | "Import">("Export");
  const [commodity, setCommodity] = useState("WHEAT");

  // Get commodity color
  const baseColor = useMemo(() => colorForCommodity(commodity), [commodity]);
  const lastYearColor = useMemo(() => withAlpha(baseColor, 0.45), [baseColor]);

  // Get data for selected commodity and trade type
  const weeklyData = getWeeklyTradeData(commodity, tradeType);

  // Calculate percentage change
  const percentChange = weeklyData
    ? calculateYearOverYearChange(
        weeklyData.thisYearVolume,
        weeklyData.lastYearVolume
      )
    : 0;

  // Prepare chart data (horizontal bars)
  const chartData = weeklyData
    ? [
        {
          category: `${weeklyData.year}`,
          value: weeklyData.thisYearVolume,
          label: "This Year",
          fill: baseColor,
        },
        {
          category: `${weeklyData.year - 1}`,
          value: weeklyData.lastYearVolume,
          label: "Last Year",
          fill: lastYearColor,
        },
      ]
    : [];

  // Calculate dynamic X-axis domain for clean display (horizontal chart)
  const maxValue = weeklyData
    ? Math.max(weeklyData.thisYearVolume, weeklyData.lastYearVolume)
    : 0;
  const roundedMax = Math.ceil(maxValue / 10000) * 10000;
  const xAxisMax = roundedMax + 40000;

  return (
    <Card
      className={cn(
        "h-full flex flex-col bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50",
        className
      )}
    >
      <CardHeader className="border-b border-slate-700/50 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-white">
                EU Weekly Trade Comparison
              </CardTitle>
              <Badge
                variant="outline"
                className="border-amber-500/50 text-amber-400 bg-amber-500/10"
              >
                DEMO
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              EU-wide {tradeType.toLowerCase()} volumes: Current week vs same
              week last year
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        {/* Trade Type Toggle (Export/Import) */}
        <div className="px-4 py-3 border-b border-slate-700/50">
          <Tabs
            value={tradeType}
            onValueChange={(value) => setTradeType(value as "Export" | "Import")}
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

        {/* Commodity Selection */}
        <div className="px-4 py-3 border-b border-slate-700/50">
          {/* Mobile: Select dropdown */}
          <div className="block md:hidden">
            <Select value={commodity} onValueChange={setCommodity}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {commodities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Horizontal scrolling tabs */}
          <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            <div className="flex gap-2 min-w-max">
              {commodities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCommodity(c.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    commodity === c.id
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="flex-1 p-4">
          {weeklyData ? (
            <div className="space-y-3">
              {/* Week Label and Change Indicator */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{weeklyData.weekLabel}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">YoY Change:</span>
                  <span
                    className={cn(
                      "font-semibold",
                      percentChange > 0
                        ? "text-green-400"
                        : percentChange < 0
                          ? "text-red-400"
                          : "text-slate-400"
                    )}
                  >
                    {percentChange > 0 ? "+" : ""}
                    {percentChange.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Horizontal Bar Chart */}
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
                      value: "Tonnes",
                      position: "insideBottom",
                      offset: -5,
                      style: { fill: "#9ca3af", fontSize: 12 },
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
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "14px",
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString()} tonnes`,
                      "Volume",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    label={{
                      position: "right",
                      fill: "#ffffff",
                      formatter: (value: any) => typeof value === 'number' ? value.toLocaleString() : value,
                      fontSize: 12,
                    }}
                  />
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

              {/* Demo Data Notice */}
              <div className="text-center text-xs text-amber-400/60 pt-2">
                Demo data for visualization purposes
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
