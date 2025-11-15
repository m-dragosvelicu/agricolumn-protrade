"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
import { cn } from "@/lib/utils";
import { colorForCommodity } from "@/lib/commodityColors";
import {
  dgAgriApi,
  DGAgriMetadata,
  DGAgriTradeType,
  DGAgriWeeklySummaryResponse,
} from "@/lib/api/dgAgri";

interface EUWeeklyTradePanelProps {
  className?: string;
}

const withAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const calculatePercentChange = (current: number | null, previous: number | null) => {
  if (current === null || previous === null || previous === 0) {
    return 0;
  }
  return ((current - previous) / previous) * 100;
};

export function EUWeeklyTradePanel({ className }: EUWeeklyTradePanelProps) {
  const [metadata, setMetadata] = useState<DGAgriMetadata | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [commodity, setCommodity] = useState<string | null>(null);
  const [tradeType, setTradeType] = useState<DGAgriTradeType>("Export");
  const [summary, setSummary] = useState<DGAgriWeeklySummaryResponse | null>(
    null,
  );
  const [isMetadataLoading, setMetadataLoading] = useState(true);
  const [isSummaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      setMetadataLoading(true);
      setMetadataError(null);
      try {
        const response = await dgAgriApi.getMetadata();
        setMetadata(response);
        if (response.commodities.length > 0) {
          const defaultCommodity = response.commodities[0];
          setCommodity(defaultCommodity.id);
          if (defaultCommodity.tradeTypes.includes("Export")) {
            setTradeType("Export");
          } else {
            setTradeType(defaultCommodity.tradeTypes[0]);
          }
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load DG AGRI metadata.";
        setMetadataError(message);
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  useEffect(() => {
    if (!commodity || !metadata) return;
    const selected = metadata.commodities.find((comm) => comm.id === commodity);
    if (selected && !selected.tradeTypes.includes(tradeType)) {
      setTradeType(selected.tradeTypes[0]);
    }
  }, [commodity, metadata, tradeType]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!commodity) return;
      setSummaryLoading(true);
      setSummaryError(null);

      try {
        const response = await dgAgriApi.getWeeklySummary({
          commodity,
          tradeType,
        });
        setSummary(response);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load DG AGRI weekly summary.";
        setSummaryError(message);
        setSummary(null);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [commodity, tradeType]);

  const commodityOptions = metadata?.commodities ?? [];
  const baseCommodityForColor = commodity ?? "WHEAT";
  const baseColor = useMemo(
    () => colorForCommodity(baseCommodityForColor),
    [baseCommodityForColor],
  );
  const lastYearColor = useMemo(
    () => withAlpha(baseColor, 0.45),
    [baseColor],
  );
  const chartData =
    summary && summary.thisYearVolume !== null
      ? [
          {
            category: summary.marketingYear ?? "This Year",
            value: summary.thisYearVolume ?? 0,
            label: "This Year",
            fill: baseColor,
          },
          ...(summary.lastYearVolume !== null
            ? [
                {
                  category:
                    summary.previousMarketingYear ??
                    (summary.marketingYear
                      ? `${summary.marketingYear} (prev)`
                      : "Last Year"),
                  value: summary.lastYearVolume ?? 0,
                  label: "Last Year",
                  fill: lastYearColor,
                },
              ]
            : []),
        ]
      : [];

  const maxValue = chartData.length
    ? Math.max(...chartData.map((item) => item.value))
    : 0;
  const roundedMax = Math.ceil(maxValue / 10000) * 10000;
  const xAxisMax = roundedMax + 40000;
  const percentChange = calculatePercentChange(
    summary?.thisYearVolume ?? null,
    summary?.lastYearVolume ?? null,
  );

  return (
    <Card
      className={cn(
        "h-full flex flex-col bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50",
        className,
      )}
    >
      <CardHeader className="border-b border-slate-700/50 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-white">
              EU Weekly Trade Comparison
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Current marketing week vs same week last year
            </p>
            {summary?.weekLabel && (
              <p className="text-xs text-slate-400 mt-2">
                {summary.weekLabel}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-700/50">
          <Tabs
            value={tradeType}
            onValueChange={(value) => {
              const next = value as DGAgriTradeType;
              setTradeType(next);
              const currentCommodity = commodityOptions.find(
                (comm) => comm.id === commodity,
              );
              if (
                !currentCommodity ||
                !currentCommodity.tradeTypes.includes(next)
              ) {
                const fallback = commodityOptions.find((comm) =>
                  comm.tradeTypes.includes(next),
                );
                if (fallback) {
                  setCommodity(fallback.id);
                }
              }
            }}
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

        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="block md:hidden">
            <Select
              value={commodity ?? undefined}
              onValueChange={(value) => setCommodity(value)}
            >
              <SelectTrigger
                className="w-full"
                disabled={isMetadataLoading || !commodityOptions.length}
              >
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                {commodityOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            <div className="flex gap-2 min-w-max">
              {commodityOptions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCommodity(c.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    commodity === c.id
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          {isMetadataLoading || isSummaryLoading ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Loading weekly trade data…
            </div>
          ) : metadataError ? (
            <div className="flex items-center justify-center h-full text-red-300 text-sm text-center px-4">
              {metadataError}
            </div>
          ) : summaryError ? (
            <div className="flex items-center justify-center h-full text-red-300 text-sm text-center px-4">
              {summaryError}
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm text-center px-4">
              No weekly data available for this selection.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  {summary?.weekLabel ?? "Current week"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">YoY Change:</span>
                  <span
                    className={cn(
                      "font-semibold",
                      percentChange > 0
                        ? "text-green-400"
                        : percentChange < 0
                          ? "text-red-400"
                          : "text-slate-400",
                    )}
                  >
                    {percentChange > 0 ? "+" : ""}
                    {percentChange.toFixed(1)}%
                  </span>
                </div>
              </div>

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
                      formatter: (value: any) =>
                        typeof value === "number"
                          ? value.toLocaleString()
                          : value,
                      fontSize: 12,
                    }}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.category} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
