"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { colorForCommodity } from "@/lib/commodityColors";
import { cn } from "@/lib/utils";
import {
  dgAgriApi,
  DGAgriCountryDataResponse,
  DGAgriMetadata,
  DGAgriTradeType,
} from "@/lib/api/dgAgri";

interface DGAgriPanelProps {
  className?: string;
}

export function DGAgriPanel({ className }: DGAgriPanelProps) {
  const [metadata, setMetadata] = useState<DGAgriMetadata | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [commodity, setCommodity] = useState<string | null>(null);
  const [tradeType, setTradeType] = useState<DGAgriTradeType>("Export");
  const [countryData, setCountryData] =
    useState<DGAgriCountryDataResponse | null>(null);
  const [isMetadataLoading, setMetadataLoading] = useState(true);
  const [isDataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

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
    const fetchCountryData = async () => {
      if (!commodity) return;
      setDataLoading(true);
      setDataError(null);

      try {
        const response = await dgAgriApi.getCountryData({
          commodity,
          tradeType,
        });
        setCountryData(response);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load DG AGRI trade data.";
        setDataError(message);
        setCountryData(null);
      } finally {
        setDataLoading(false);
      }
    };

    fetchCountryData();
  }, [commodity, tradeType]);

  useEffect(() => {
    if (!commodity || !metadata) return;
    const selected = metadata.commodities.find((comm) => comm.id === commodity);
    if (selected && !selected.tradeTypes.includes(tradeType)) {
      setTradeType(selected.tradeTypes[0]);
    }
  }, [commodity, metadata, tradeType]);

  const commodityOptions = metadata?.commodities ?? [];

  const baseCommodityForColor = commodity ?? "WHEAT";
  const baseColor = useMemo(
    () => colorForCommodity(baseCommodityForColor),
    [baseCommodityForColor],
  );

  const chartData =
    countryData?.entries.map((entry) => ({
      country: entry.countryName ?? entry.countryCode,
      value: entry.value,
    })) ?? [];

  const maxValue = chartData.length
    ? Math.max(...chartData.map((d) => d.value))
    : 0;
  const yAxisMax =
    maxValue === 0 ? 10000 : Math.ceil(maxValue / 10000) * 10000 + 40000;

  const exportData = () => {
    if (!countryData || chartData.length === 0) return;
    const csv = [
      "Country,Value (Tonnes)",
      ...chartData.map(
        (row) => `${row.country.replace(/,/g, " ")},${row.value}`,
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const commoditySlug = (commodity ?? "commodity").toLowerCase();
    const tradeSlug = tradeType.toLowerCase();
    a.download = `dg-agri-${commoditySlug}-${tradeSlug}.csv`;
    a.click();
  };

  return (
    <Card
      className={cn(
        "h-full flex flex-col bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50",
        className,
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-white">
              DG AGRI Trade Data (YTD)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              EU country-level trade volumes for the current marketing year
            </p>
            {metadata && (
              <p className="text-xs text-slate-400 mt-2">
                Marketing year:{" "}
                <span className="text-slate-200">
                  {metadata.marketingYear ?? "—"}
                </span>
                {countryData?.periodLabel && (
                  <>
                    {" "}
                    · Period:{" "}
                    <span className="text-slate-200">
                      {countryData.periodLabel}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            disabled={!countryData || chartData.length === 0}
            className="border-slate-600 text-slate-200 hover:bg-slate-700/40"
          >
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        <div className="p-4 border-b border-slate-700/50">
          <Tabs
            value={tradeType}
            onValueChange={(value) => {
              const next = value as DGAgriTradeType;
              setTradeType(next);
              const currentCommodity = commodityOptions.find(
                (comm) => comm.id === commodity,
              );
              if (!currentCommodity || !currentCommodity.tradeTypes.includes(next)) {
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
              <TabsTrigger value="Export">Export</TabsTrigger>
              <TabsTrigger value="Import">Import</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4 border-b border-slate-700/50">
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
                {commodityOptions.map((comm) => (
                  <SelectItem key={comm.id} value={comm.id}>
                    {comm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden md:block">
            <Tabs
              value={commodity ?? undefined}
              onValueChange={(value) => setCommodity(value)}
            >
              <div className="overflow-x-auto">
                <TabsList className="inline-flex w-auto flex-nowrap gap-2">
                  {commodityOptions.map((comm) => (
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

        <div className="flex-1 p-4">
          {isMetadataLoading || isDataLoading ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Loading DG AGRI data…
            </div>
          ) : metadataError ? (
            <div className="flex items-center justify-center h-full text-red-300 text-sm text-center">
              {metadataError}
            </div>
          ) : dataError ? (
            <div className="flex items-center justify-center h-full text-red-300 text-sm text-center px-4">
              {dataError}
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm text-center px-4">
              No DG AGRI data found for this selection.
            </div>
          ) : (
            <div
              className="outline-none focus:outline-none [&>*]:outline-none [&>*]:focus:outline-none"
              style={{ height: "380px" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
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
                    formatter={(value: number) => [
                      value.toLocaleString(),
                      "Tonnes",
                    ]}
                    labelFormatter={(label) => `Country: ${label}`}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#ffffff",
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
          )}
        </div>

        <div className="p-4 border-t border-slate-700/50">
          <p className="text-xs text-muted-foreground">
            DG AGRI official reports · Values in metric tonnes · Cached data
            refreshes when new files are imported.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
