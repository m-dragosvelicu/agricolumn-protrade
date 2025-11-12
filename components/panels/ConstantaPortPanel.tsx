"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Filter,
  Search,
  Settings,
  X,
} from "lucide-react";
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

import { PanelHeader } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseDepartureLocation } from "@/lib/countryMappings";
import { cn } from "@/lib/utils";
import { VesselData } from "@/types";
import { colorForCommodity } from "@/lib/commodityColors";
import { vesselsApi, Vessel } from "@/lib/api/vessels";
import { Loader2, AlertCircle } from "lucide-react";

interface ConstantaPortPanelProps {
  className?: string;
}

type SortField = keyof VesselData;
type SortDirection = "asc" | "desc";

interface ColumnConfig {
  key: SortField;
  label: string;
  visible: boolean;
  customRender?: (row: VesselData) => string;
}

// Fixed commodity order for tabs
const COMMODITY_ORDER = [
  { key: "WHEAT", label: "WHEAT", dataValues: ["Wheat"] },
  { key: "CORN", label: "CORN", dataValues: ["Corn"] },
  { key: "BARLEY", label: "BARLEY", dataValues: ["Barley"] },
  { key: "RPS", label: "RPS", dataValues: ["Rapeseed", "Rapeseeds"] },
  { key: "SFS", label: "SFS", dataValues: ["Sunflower Seeds"] },
  {
    key: "RPS_MEAL",
    label: "RPS MEAL",
    dataValues: ["Rapeseed Meal", "Rapeseeds meal", "Rapeseeds Meal"],
  },
  {
    key: "SFS_MEAL",
    label: "SFS MEAL",
    dataValues: [
      "Sunflower Meal",
      "Sunflower seeds meal",
      "Sunflower Seeds Meal",
    ],
  },
  {
    key: "RPS_OIL",
    label: "RPS OIL",
    dataValues: ["Rapeseed Oil", "Rapeseeds Oil"],
  },
  {
    key: "SFS_OIL",
    label: "SFS OIL",
    dataValues: ["Sunflower Oil", "Sunflower seeds oil", "Sunflower Seeds Oil"],
  },
];

/**
 * Normalize commodity description to match database format
 * This ensures we filter by the normalized values stored in the database
 */
const normalizeCommodityForFilter = (description: string): string => {
  if (!description) return description;
  
  const normalized = String(description).trim().toUpperCase();
  
  // Sunflower Seeds variants
  if (/SUNFLOWER\s*SEEDS?\s*MEAL/i.test(description)) {
    return 'SFS MEAL';
  }
  if (/SUNFLOWER\s*SEEDS?\s*OIL/i.test(description)) {
    return 'SFS OIL';
  }
  if (/SUNFLOWER\s*SEEDS?/i.test(description) && !/MEAL|OIL/i.test(description)) {
    return 'SFS';
  }
  
  // Rapeseed/Canola variants
  if (/(CANOLA|RAPESEED)\s*MEAL/i.test(description)) {
    return 'RPS MEAL';
  }
  if (/(CANOLA|RAPESEED)\s*OIL/i.test(description)) {
    return 'RPS OIL';
  }
  if (/(CANOLA|RAPESEED)/i.test(description) && !/MEAL|OIL/i.test(description)) {
    return 'RPS';
  }
  
  // Corn/Maize normalization
  if (/CORN|MAIZE/i.test(description)) {
    return 'CORN';
  }
  
  // Return original if no match (preserve other commodities like Wheat, Barley, etc.)
  return String(description).trim();
};

/**
 * Get commodity values for a selected commodity filter
 * EXACT MATCHING ONLY - no variants for parent commodities
 * - If selecting "RPS", returns only "RPS" (not "RPS OIL" or "RPS MEAL")
 * - If selecting "SFS", returns only "SFS" (not "SFS OIL" or "SFS MEAL")
 * - Handles both keys (like "WHEAT") and dataValues (like "Wheat")
 */
const getCommodityFilterValues = (selectedCommodity: string): string[] => {
  if (selectedCommodity === "all") {
    return [];
  }

  // First, try to find by key (e.g., "WHEAT", "SFS", "RPS_MEAL")
  let commodityConfig = COMMODITY_ORDER.find(c => c.key === selectedCommodity);
  
  // If not found by key, try to find by dataValue (e.g., "Wheat", "Sunflower Seeds")
  if (!commodityConfig) {
    commodityConfig = COMMODITY_ORDER.find(c => 
      c.dataValues.some(v => v.toLowerCase() === selectedCommodity.toLowerCase())
    );
  }

  if (!commodityConfig) {
    // Fallback: normalize and return the selected value as exact match
    return [normalizeCommodityForFilter(selectedCommodity)];
  }

  // EXACT MATCHING: Return only the exact commodity values, no variants
  // Normalize values to match database format
  const normalized = commodityConfig.dataValues.map(v => normalizeCommodityForFilter(v));
  // Return unique values (both original and normalized for backward compatibility)
  return [...new Set([...commodityConfig.dataValues, ...normalized])];
};

const STATUS_ORDER = [
  "ETA",
  "Awaiting Berth",
  "Loading",
  "Loading/Discharging",
  "Loaded",
  "Sailed",
  "In Transit",
  "Discharged",
  "Completed",
];

const STATUS_STYLES: Record<string, string> = {
  eta: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  "awaiting berth": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  loading: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "loading/discharging": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  loaded: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  sailed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "in transit": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  discharged: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  completed: "bg-green-500/20 text-green-300 border-green-500/30",
  delayed: "bg-red-500/20 text-red-300 border-red-500/30",
};

// Commodity display mapping
const getCommodityLabel = (commodity: string): string => {
  const mappings: Record<string, string> = {
    Wheat: "WHEAT",
    Corn: "CORN",
    Barley: "BARLEY",
    Rapeseed: "RPS",
    Rapeseeds: "RPS",
    "Sunflower Seeds": "SFS",
    "Rapeseed Oil": "RPS OIL",
    "Rapeseeds Oil": "RPS OIL",
    "Sunflower Oil": "SFS OIL",
    "Sunflower seeds oil": "SFS OIL",
    "Sunflower Seeds Oil": "SFS OIL",
    "Rapeseed Meal": "RPS MEAL",
    "Rapeseeds meal": "RPS MEAL",
    "Rapeseeds Meal": "RPS MEAL",
    "Sunflower Meal": "SFS MEAL",
    "Sunflower seeds meal": "SFS MEAL",
    "Sunflower Seeds Meal": "SFS MEAL",
    Fertilizers: "FERTILIZERS",
  };
  return mappings[commodity] || commodity.toUpperCase();
};

const getQuantityLabel = (filter: string): string => {
  const mappings: Record<string, string> = {
    "<5000": "< 5,000 mt",
    "5000-10000": "5,000 - 10,000 mt",
    ">10000": "> 10,000 mt",
  };

  return mappings[filter] || "All quantities";
};

const numberFormatter = new Intl.NumberFormat("en-GB");

const formatQuantity = (value: number | null | undefined): string => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return numberFormatter.format(value);
};

const formatOperationDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const parts = value.split("-");
  if (parts.length === 3) {
    const [year, month, dayRaw] = parts;
    const day = dayRaw?.split("T")[0] ?? "";
    if (year && month && day) {
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }
  }
  return value;
};

const columns: ColumnConfig[] = [
  {
    key: "commodity_description" as SortField,
    label: "Commodity",
    visible: true,
  },
  { key: "quantity" as SortField, label: "Quantity (mt)", visible: true },
  { key: "shipper" as SortField, label: "Shipper", visible: true },
  {
    key: "destination_country" as SortField,
    label: "Destination Country",
    visible: true,
  },
  {
    key: "departure_location" as SortField,
    label: "Departure Location",
    visible: true,
    customRender: (row: VesselData) => {
      const parsed = parseDepartureLocation(row.departure_location);
      return parsed ? `${parsed.countryCode}-${parsed.port}` : "—";
    },
  },
  {
    key: "departure_terminal" as SortField,
    label: "Departure Terminal",
    visible: true,
  },
  { key: "vessel_name" as SortField, label: "Vessel Name", visible: true },
  { key: "status" as SortField, label: "Status", visible: true },
];

// Transform backend Vessel to frontend VesselData format
const transformVesselToVesselData = (vessel: Vessel, index: number): VesselData => {
  // Convert quantity to number (PostgreSQL decimal returns as string)
  let quantity: number | null = null;
  if (vessel.quantity !== null && vessel.quantity !== undefined) {
    if (typeof vessel.quantity === 'string') {
      const parsed = parseFloat(vessel.quantity);
      quantity = isNaN(parsed) ? null : parsed;
    } else if (typeof vessel.quantity === 'number') {
      quantity = vessel.quantity;
    }
  }

  return {
    id: index,
    vessel_name: vessel.vesselName,
    status: vessel.status,
    departure_location: vessel.departureLocation,
    departure_terminal: vessel.departureTerminal || "",
    destination_country: vessel.destinationCountry || "",
    operation_type: vessel.operationType,
    operation_completed: vessel.operationCompleted || "",
    commodity_description: vessel.commodityDescription,
    quantity: quantity ?? 0,
    shipper: vessel.shipper || "",
    cargo_origin_1: vessel.cargoOrigin1 || "",
    cargo_origin_2: vessel.cargoOrigin2 || "",
  };
};

export function ConstantaPortPanel({ className }: ConstantaPortPanelProps) {
  const [data, setData] = useState<VesselData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("operation_completed");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce(
      (acc, col) => ({ ...acc, [col.key]: col.visible }),
      {} as Record<string, boolean>
    )
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [commodityFilter, setCommodityFilter] = useState("all");
  const [operationTypeFilter, setOperationTypeFilter] = useState("all");
  const [quantityFilter, setQuantityFilter] = useState("all");
  const [shipperFilter, setShipperFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [vesselNameFilter, setVesselNameFilter] = useState("all");
  const [terminalFilter, setTerminalFilter] = useState("all");
  const [operationStatusFilter, setOperationStatusFilter] = useState<string[]>(
    []
  );

  // Chart view states
  const [selectedChartCommodity, setSelectedChartCommodity] = useState("WHEAT");
  const [selectedDestinationCountries, setSelectedDestinationCountries] =
    useState<string[]>([]); // Will be set to all countries when loaded
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [chartData, setChartData] = useState<Array<{ shipper: string; quantity: number }>>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [uniqueDestinations, setUniqueDestinations] = useState<string[]>([]);
  
  // Filter metadata from backend (industry standard approach)
  const [filterMetadata, setFilterMetadata] = useState<{
    operationTypes: string[];
    statuses: string[];
    commodityGroups: string[];
    commodityDescriptions: string[];
    shippers: string[];
    departureTerminals: string[];
    destinationCountries: string[];
  } | null>(null);

  // Handle responsive chart sizing
  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Map frontend sort field to backend sort field
  const mapSortField = (field: SortField): string => {
    const mapping: Record<string, string> = {
      vessel_name: 'vesselName',
      operation_completed: 'operationCompleted',
      operation_commenced: 'operationCommenced',
      commodity_description: 'commodityDescription',
      destination_country: 'destinationCountry',
      departure_location: 'departureLocation',
      departure_terminal: 'departureTerminal',
      operation_type: 'operationType',
      quantity: 'quantity',
      status: 'status',
    };
    return mapping[field] || 'operationCommenced';
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const queryParams: any = {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          sortBy: mapSortField(sortField),
          sortOrder: sortDirection.toUpperCase() as 'ASC' | 'DESC',
        };

        // Add search
        if (searchTerm) {
          queryParams.search = searchTerm;
        }

        // Add filters
        if (commodityFilter !== "all") {
          const commodityValues = getCommodityFilterValues(commodityFilter);
          if (commodityValues.length > 0) {
            // Use commodityDescriptions array for filtering multiple values
            queryParams.commodityDescriptions = commodityValues;
          }
        }
        if (operationTypeFilter !== "all") {
          queryParams.operationType = operationTypeFilter;
        }
        if (shipperFilter !== "all") {
          queryParams.shipper = shipperFilter;
        }
        if (destinationFilter !== "all") {
          queryParams.destinationCountry = destinationFilter;
        }
        if (vesselNameFilter !== "all") {
          queryParams.vesselName = vesselNameFilter;
        }
        if (terminalFilter !== "all") {
          queryParams.departureTerminal = terminalFilter;
        }
        if (operationStatusFilter.length > 0) {
          queryParams.statuses = operationStatusFilter;
        }

        // Quantity filter
        if (quantityFilter !== "all") {
          if (quantityFilter === "<5000") {
            queryParams.maxQuantity = 4999;
          } else if (quantityFilter === "5000-10000") {
            queryParams.minQuantity = 5000;
            queryParams.maxQuantity = 10000;
          } else if (quantityFilter === ">10000") {
            queryParams.minQuantity = 10001;
          }
        }

        const response = await vesselsApi.getVessels(queryParams);
        const transformedData = response.data.map((vessel, index) =>
          transformVesselToVesselData(vessel, index)
        );
        
        setData(transformedData);
        setTotalCount(response.total);
      } catch (err: any) {
        console.error('Failed to fetch vessels:', err);
        setError(err.response?.data?.message || 'Failed to load vessel data');
        setData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    currentPage,
    pageSize,
    searchTerm,
    sortField,
    sortDirection,
    commodityFilter,
    operationTypeFilter,
    quantityFilter,
    shipperFilter,
    destinationFilter,
    vesselNameFilter,
    terminalFilter,
    operationStatusFilter,
  ]);

  // Use data directly (already paginated and filtered by backend)
  const paginatedData = data;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Reset to first page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    commodityFilter,
    operationTypeFilter,
    quantityFilter,
    shipperFilter,
    destinationFilter,
    vesselNameFilter,
    terminalFilter,
    operationStatusFilter,
  ]);

  // Clamp current page if total pages shrink below current
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Fetch unique values for filters (we'll need to fetch all data or create a separate endpoint)
  // For now, we'll use a simple approach: fetch distinct values from current data
  const getUniqueValues = (field: keyof VesselData) => {
    return Array.from(
      new Set(data.map((row) => row[field]).filter(Boolean))
    ).map(String);
  };

  const getStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase?.() ?? "";
    return (
      STATUS_STYLES[normalized] ||
      "bg-slate-500/20 text-slate-300 border-slate-500/30"
    );
  };

  const statusOptions = useMemo(() => {
    const uniqueStatuses = new Set<string>();
    data.forEach((row) => {
      if (row.status) uniqueStatuses.add(row.status);
    });
    operationStatusFilter.forEach((status) => uniqueStatuses.add(status));

    const orderLookup = new Map(
      STATUS_ORDER.map((status, index) => [status.toLowerCase(), index])
    );

    return Array.from(uniqueStatuses).sort((a, b) => {
      const orderA = orderLookup.get(a.toLowerCase()) ?? STATUS_ORDER.length;
      const orderB = orderLookup.get(b.toLowerCase()) ?? STATUS_ORDER.length;
      if (orderA === orderB) {
        return a.localeCompare(b);
      }
      return orderA - orderB;
    });
  }, [data, operationStatusFilter]);

  const clearFilters = () => {
    setCommodityFilter("all");
    setOperationTypeFilter("all");
    setQuantityFilter("all");
    setShipperFilter("all");
    setDestinationFilter("all");
    setVesselNameFilter("all");
    setTerminalFilter("all");
    setOperationStatusFilter([]);
    setSearchTerm("");
  };

  const activeFiltersCount =
    (commodityFilter !== "all" ? 1 : 0) +
    (operationTypeFilter !== "all" ? 1 : 0) +
    (quantityFilter !== "all" ? 1 : 0) +
    (shipperFilter !== "all" ? 1 : 0) +
    (destinationFilter !== "all" ? 1 : 0) +
    (vesselNameFilter !== "all" ? 1 : 0) +
    (terminalFilter !== "all" ? 1 : 0) +
    (operationStatusFilter.length > 0 ? 1 : 0);

  const exportCSV = () => {
    const visibleCols = columns.filter((col) => visibleColumns[col.key]);
    const headers = visibleCols.map((col) => col.label).join(",");
    const rows = data
      .map((row) =>
        visibleCols
          .map((col) => {
            const value = col.customRender
              ? col.customRender(row)
              : row[col.key] || "";
            // Escape commas and quotes for CSV
            return typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(",")
      )
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "constanta-port-data.csv";
    a.click();
  };

  const getPageList = () => {
    const pages: Array<number | string> = [];
    const maxButtons = 7; // including first/last and ellipses
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const showLeftEllipsis = currentPage > 4;
    const showRightEllipsis = currentPage < totalPages - 3;

    pages.push(1);
    if (showLeftEllipsis) pages.push("…");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (showRightEllipsis) pages.push("…");
    pages.push(totalPages);

    return pages;
  };

  // Fetch unique destinations on mount and set all as selected by default
  // Fetch filter metadata and unique destinations (industry standard approach)
  useEffect(() => {
    const fetchFilterMetadata = async () => {
      try {
        const metadata = await vesselsApi.getFilterMetadata();
        setFilterMetadata(metadata);
        setUniqueDestinations(metadata.destinationCountries);
        // Set all countries as selected by default (only if not already set)
        setSelectedDestinationCountries(prev => {
          if (prev.length === 0 && metadata.destinationCountries.length > 0) {
            return metadata.destinationCountries;
          }
          return prev;
        });
      } catch (err) {
        console.error('Failed to fetch filter metadata:', err);
        // Fallback: fetch unique destinations only
        try {
          const destinations = await vesselsApi.getUniqueDestinations();
          setUniqueDestinations(destinations);
          setSelectedDestinationCountries(prev => {
            if (prev.length === 0 && destinations.length > 0) {
              return destinations;
            }
            return prev;
          });
        } catch (destErr) {
          console.error('Failed to fetch unique destinations:', destErr);
        }
      }
    };
    fetchFilterMetadata();
  }, []);

  // Fetch chart data from backend (computed from ALL data, not just paginated)
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        const commodityConfig = COMMODITY_ORDER.find(
          (c) => c.key === selectedChartCommodity
        );
        if (!commodityConfig) {
          setChartData([]);
          return;
        }

        // Get all commodity values for this commodity (handles parent commodities like SFS, RPS)
        const commodityValues = getCommodityFilterValues(commodityConfig.dataValues[0]);
        
        // If all countries are selected (or empty array), don't filter by countries (get all)
        // Otherwise, filter by selected countries
        const destinationCountries = 
          selectedDestinationCountries.length === 0 || 
          selectedDestinationCountries.length === uniqueDestinations.length
            ? undefined // All countries selected, don't filter
            : selectedDestinationCountries;
        
        // For chart data, send all commodity values as an array
        const response = await vesselsApi.getChartData({
          commodity: commodityValues[0], // Primary commodity for backward compatibility
          commodityDescriptions: commodityValues.length > 1 ? commodityValues : undefined, // All variants if multiple
          destinationCountries,
          operationType: 'Export',
        });

        setChartData(response.data);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, [selectedChartCommodity, selectedDestinationCountries]);

  // Filtered countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearchTerm) return uniqueDestinations;
    return uniqueDestinations.filter((country) =>
      country.toLowerCase().includes(countrySearchTerm.toLowerCase())
    );
  }, [uniqueDestinations, countrySearchTerm]);

  return (
    <Card
      className={cn(
        "flex flex-col bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden",
        className
      )}
    >
      <PanelHeader
        title="Constanta Port"
        lastUpdated="2 minutes ago"
        onExport={exportCSV}
        onFullscreen={() => {}}
      />

      <CardContent className="p-0 overflow-hidden">
        {/* Chart View */}
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            EXPORT OVERVIEW
          </h3>

          {/* Commodity Selection */}
          {/* Mobile: Select Dropdown */}
          <div className="block md:hidden mb-3">
            <Select
              value={selectedChartCommodity}
              onValueChange={setSelectedChartCommodity}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                {COMMODITY_ORDER.map((commodity) => (
                  <SelectItem key={commodity.key} value={commodity.key}>
                    {commodity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Scrollable Tabs */}
          <div className="hidden md:block">
            <Tabs
              value={selectedChartCommodity}
              onValueChange={setSelectedChartCommodity}
            >
              <div className="overflow-x-auto mb-3">
                <TabsList className="inline-flex w-auto flex-nowrap gap-2">
                  {COMMODITY_ORDER.map((commodity) => (
                    <TabsTrigger
                      key={commodity.key}
                      value={commodity.key}
                      className="whitespace-nowrap"
                    >
                      {commodity.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          </div>

          {/* Destination Country Selector */}
          <div className="mb-4">
            <Label className="text-sm text-slate-400 mb-2 block">
              Destination Countries
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="text-sm">
                    {selectedDestinationCountries.length === 0
                      ? "Select countries..."
                      : selectedDestinationCountries.length === uniqueDestinations.length && uniqueDestinations.length > 0
                      ? "All countries"
                      : `${selectedDestinationCountries.length} ${
                          selectedDestinationCountries.length === 1
                            ? "country"
                            : "countries"
                        } selected`}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="border-b border-slate-700/50 bg-slate-800/60">
                  {/* Search Box */}
                  <div className="p-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search countries..."
                        value={countrySearchTerm}
                        onChange={(e) => setCountrySearchTerm(e.target.value)}
                        className="pl-8 h-9"
                      />
                    </div>
                  </div>

                  {/* Select All / Clear All Header */}
                  <div className="flex items-center justify-between px-3 pb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-countries"
                        checked={
                          selectedDestinationCountries.length ===
                            uniqueDestinations.length &&
                          uniqueDestinations.length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDestinationCountries([
                              ...uniqueDestinations,
                            ]);
                          } else {
                            setSelectedDestinationCountries([]);
                          }
                        }}
                      />
                      <Label
                        htmlFor="select-all-countries"
                        className="text-xs font-medium text-slate-300 cursor-pointer"
                      >
                        Select All
                      </Label>
                    </div>
                    {selectedDestinationCountries.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDestinationCountries([])}
                        className="h-6 text-xs px-2"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Scrollable Country List */}
                <div className="max-h-[250px] overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <div
                          key={country}
                          className="flex items-center space-x-2 hover:bg-slate-700/30 p-2 rounded transition-colors cursor-pointer"
                          onClick={() => {
                            if (
                              selectedDestinationCountries.includes(country)
                            ) {
                              setSelectedDestinationCountries(
                                selectedDestinationCountries.filter(
                                  (c) => c !== country
                                )
                              );
                            } else {
                              setSelectedDestinationCountries([
                                ...selectedDestinationCountries,
                                country,
                              ]);
                            }
                          }}
                        >
                          <Checkbox
                            id={`dest-${country}`}
                            checked={selectedDestinationCountries.includes(
                              country
                            )}
                            onClick={(e) => e.stopPropagation()}
                            className="pointer-events-none"
                          />
                          <span className="text-sm text-slate-300 flex-1">
                            {country}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-400">
                        No countries found
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Chart */}
          <div
            className="outline-none focus:outline-none [&>*]:outline-none [&>*]:focus:outline-none"
            style={{ height: "300px" }}
          >
            {!isMounted || chartLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-700 text-sm text-slate-400">
                No export data available for this selection.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 0 : 20,
                    bottom: isMobile ? 60 : 40,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="shipper"
                    fontSize={isMobile ? 10 : 12}
                    stroke="#9ca3af"
                    angle={-45}
                    textAnchor="end"
                    height={isMobile ? 80 : 60}
                  />
                  <YAxis
                    fontSize={isMobile ? 10 : 12}
                    tickFormatter={(value) => numberFormatter.format(value)}
                    stroke="#9ca3af"
                    label={{
                      value: "QTY (tonnes)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#9ca3af", fontSize: isMobile ? 10 : 12 },
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${numberFormatter.format(value)} tonnes`,
                      "Quantity",
                    ]}
                    labelFormatter={(label) => `Shipper: ${label}`}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Bar
                    dataKey="quantity"
                    fill={colorForCommodity(selectedChartCommodity)}
                    name="Quantity"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-slate-700/50 space-y-4">
          {/* Main Filter Row - Desktop */}
          <div className="hidden lg:flex lg:flex-wrap lg:items-end lg:gap-3">
            {/* Commodity Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Commodity
              </Label>
              <Select
                value={commodityFilter}
                onValueChange={setCommodityFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Commodities</SelectItem>
                  {COMMODITY_ORDER.map((commodity) => (
                    <SelectItem key={commodity.key} value={commodity.dataValues[0]}>
                      {commodity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operation Type Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Operation Type
              </Label>
              <Select
                value={operationTypeFilter}
                onValueChange={setOperationTypeFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {(filterMetadata?.operationTypes || ['Export', 'Import', 'Transit']).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Quantity
              </Label>
              <Select value={quantityFilter} onValueChange={setQuantityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quantities</SelectItem>
                  <SelectItem value="<5000">{"< 5,000 mt"}</SelectItem>
                  <SelectItem value="5000-10000">5,000 - 10,000 mt</SelectItem>
                  <SelectItem value=">10000">{"> 10,000 mt"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Shipper/Exporter Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Exporter / Importer
              </Label>
              <Select value={shipperFilter} onValueChange={setShipperFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shippers</SelectItem>
                  {(filterMetadata?.shippers || getUniqueValues("shipper")).map((shipper) => (
                    <SelectItem key={shipper} value={shipper}>
                      {shipper}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destination Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Destination
              </Label>
              <Select
                value={destinationFilter}
                onValueChange={setDestinationFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  {(filterMetadata?.destinationCountries || getUniqueValues("destination_country")).map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vessel Name Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Vessel Name
              </Label>
              <Select
                value={vesselNameFilter}
                onValueChange={setVesselNameFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessels</SelectItem>
                  {getUniqueValues("vessel_name").map((vessel) => (
                    <SelectItem key={vessel} value={vessel}>
                      {vessel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Terminal Filter */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Terminal
              </Label>
              <Select value={terminalFilter} onValueChange={setTerminalFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terminals</SelectItem>
                  {(filterMetadata?.departureTerminals || getUniqueValues("departure_terminal")).map((terminal) => (
                    <SelectItem key={terminal} value={terminal}>
                      {terminal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operation Status - Multi-select */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Operation Status
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[160px] justify-between h-10"
                  >
                    <span className="text-sm">
                      {operationStatusFilter.length === 0
                        ? "All"
                        : `${operationStatusFilter.length} selected`}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <div className="p-2 space-y-1">
                    {statusOptions.length > 0 ? (
                      statusOptions.map((status) => (
                        <div
                          key={status}
                          className="flex items-center space-x-2 hover:bg-slate-700/30 p-2 rounded transition-colors cursor-pointer"
                          onClick={() => {
                            if (operationStatusFilter.includes(status)) {
                              setOperationStatusFilter(
                                operationStatusFilter.filter(
                                  (s) => s !== status
                                )
                              );
                            } else {
                              setOperationStatusFilter([
                                ...operationStatusFilter,
                                status,
                              ]);
                            }
                          }}
                        >
                          <Checkbox
                            id={`status-${status}`}
                            checked={operationStatusFilter.includes(status)}
                            onClick={(e) => e.stopPropagation()}
                            className="pointer-events-none"
                          />
                          <span className="text-sm text-slate-300 flex-1">
                            {status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="py-2 text-sm text-slate-400 text-center">
                        No status data available
                      </p>
                    )}
                    {operationStatusFilter.length > 0 && (
                      <div className="pt-2 border-t border-slate-700/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOperationStatusFilter([]);
                          }}
                          className="w-full text-xs"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Mobile: Filters Dialog */}
          <div className="lg:hidden">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Filter Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Commodity Filter */}
                  <div>
                    <Label className="text-sm font-medium">Commodity</Label>
                    <Select
                      value={commodityFilter}
                      onValueChange={setCommodityFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All commodities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Commodities</SelectItem>
                        {COMMODITY_ORDER.map((commodity) => (
                          <SelectItem key={commodity.key} value={commodity.dataValues[0]}>
                            {commodity.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operation Type Filter */}
                  <div>
                    <Label className="text-sm font-medium">
                      Operation Type
                    </Label>
                    <Select
                      value={operationTypeFilter}
                      onValueChange={setOperationTypeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {(filterMetadata?.operationTypes || ['Export', 'Import', 'Transit']).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity Filter */}
                  <div>
                    <Label className="text-sm font-medium">Quantity</Label>
                    <Select
                      value={quantityFilter}
                      onValueChange={setQuantityFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All quantities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Quantities</SelectItem>
                        <SelectItem value="<5000">{"< 5,000 mt"}</SelectItem>
                        <SelectItem value="5000-10000">
                          5,000 - 10,000 mt
                        </SelectItem>
                        <SelectItem value=">10000">{"> 10,000 mt"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Shipper Filter */}
                  <div>
                    <Label className="text-sm font-medium">
                      Exporter/Importer
                    </Label>
                    <Select
                      value={shipperFilter}
                      onValueChange={setShipperFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All shippers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Shippers</SelectItem>
                        {getUniqueValues("shipper").map((shipper) => (
                          <SelectItem key={shipper} value={shipper}>
                            {shipper}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Destination Filter */}
                  <div>
                    <Label className="text-sm font-medium">Destination</Label>
                    <Select
                      value={destinationFilter}
                      onValueChange={setDestinationFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All destinations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Destinations</SelectItem>
                        {getUniqueValues("destination_country").map((dest) => (
                          <SelectItem key={dest} value={dest}>
                            {dest}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vessel Name Filter */}
                  <div>
                    <Label className="text-sm font-medium">Vessel Name</Label>
                    <Select
                      value={vesselNameFilter}
                      onValueChange={setVesselNameFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All vessels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Vessels</SelectItem>
                        {getUniqueValues("vessel_name").map((vessel) => (
                          <SelectItem key={vessel} value={vessel}>
                            {vessel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Terminal Filter */}
                  <div>
                    <Label className="text-sm font-medium">Terminal</Label>
                    <Select
                      value={terminalFilter}
                      onValueChange={setTerminalFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All terminals" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Terminals</SelectItem>
                        {getUniqueValues("departure_terminal").map(
                          (terminal) => (
                            <SelectItem key={terminal} value={terminal}>
                              {terminal}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operation Status Multi-select */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Operation Status
                    </Label>
                    <div className="space-y-2 border border-slate-700/50 rounded-md p-3">
                      {statusOptions.length > 0 ? (
                        statusOptions.map((status) => (
                          <div
                            key={status}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`mobile-status-${status}`}
                              checked={operationStatusFilter.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setOperationStatusFilter([
                                    ...operationStatusFilter,
                                    status,
                                  ]);
                                } else {
                                  setOperationStatusFilter(
                                    operationStatusFilter.filter(
                                      (s) => s !== status
                                    )
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`mobile-status-${status}`}
                              className="text-sm cursor-pointer"
                            >
                              {status}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 text-center">
                          No status data available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar and Columns - Second Row */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Columns Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Manage Columns</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={column.key}
                        checked={visibleColumns[column.key]}
                        onCheckedChange={(checked) => {
                          setVisibleColumns({
                            ...visibleColumns,
                            [column.key]: !!checked,
                          });
                        }}
                      />
                      <Label htmlFor={column.key} className="text-sm">
                        {column.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {commodityFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Commodity: {(() => {
                    const commodityConfig = COMMODITY_ORDER.find(
                      c => c.dataValues.includes(commodityFilter)
                    );
                    return commodityConfig ? commodityConfig.label : getCommodityLabel(commodityFilter);
                  })()}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setCommodityFilter("all")}
                  />
                </Badge>
              )}
              {operationTypeFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Operation: {operationTypeFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setOperationTypeFilter("all")}
                  />
                </Badge>
              )}
              {quantityFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Quantity: {getQuantityLabel(quantityFilter)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setQuantityFilter("all")}
                  />
                </Badge>
              )}
              {shipperFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Shipper: {shipperFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setShipperFilter("all")}
                  />
                </Badge>
              )}
              {destinationFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Destination: {destinationFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setDestinationFilter("all")}
                  />
                </Badge>
              )}
              {vesselNameFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Vessel: {vesselNameFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setVesselNameFilter("all")}
                  />
                </Badge>
              )}
              {terminalFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Terminal: {terminalFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setTerminalFilter("all")}
                  />
                </Badge>
              )}
              {operationStatusFilter.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  Status: {operationStatusFilter.length} selected
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setOperationStatusFilter([])}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-slate-400">Loading vessel data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                <p className="text-red-400 mb-4">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    setCurrentPage((prev) => prev);
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No vessels found</p>
              </div>
            ) : (
              paginatedData.map((row) => (
              <Card
                key={row.id}
                className="bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 transition-all duration-200"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-base truncate">
                        {row.vessel_name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {getCommodityLabel(row.commodity_description)}
                      </p>
                    </div>
                    <Badge
                      className={`border ${getStatusBadge(
                        row.status
                      )} pointer-events-none whitespace-nowrap flex-shrink-0`}
                    >
                      {row.status}
                    </Badge>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Operation
                      </p>
                      <p className="text-slate-300 font-medium">
                        {row.operation_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Quantity
                      </p>
                      <p className="text-slate-300 font-medium">
                        {formatQuantity(row.quantity)} mt
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Terminal
                      </p>
                      <p className="text-slate-300 font-medium">
                        {row.departure_terminal}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Destination
                      </p>
                      <p className="text-slate-300 font-medium truncate">
                        {row.destination_country}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Completed
                      </p>
                      <p className="text-slate-300 font-medium">
                        {row.operation_completed
                          ? new Date(
                              row.operation_completed
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Footer Row */}
                  <div className="pt-2 border-t border-slate-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{row.shipper}</span>
                      <span className="text-slate-500">
                        {(() => {
                          const parsed = parseDepartureLocation(
                            row.departure_location
                          );
                          return parsed
                            ? `${parsed.countryCode}-${parsed.port}`
                            : "—";
                        })()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
          </div>

          {/* Mobile Pagination */}
          <div className="px-4 pb-4 border-t border-slate-700/50">
            <div className="pt-4 space-y-3">
              {/* Results info */}
              <div className="text-xs text-slate-400 text-center">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalCount)}{" "}
                of {totalCount}
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex-1 mr-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm text-slate-400 px-3 whitespace-nowrap">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex-1 ml-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-slate-700/50">
                {columns
                  .filter((col) => visibleColumns[col.key])
                  .map((column) => (
                    <TableHead
                      key={column.key}
                      className="text-slate-400 font-semibold cursor-pointer hover:bg-slate-700/30 whitespace-nowrap"
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {sortField === column.key &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.filter((col) => visibleColumns[col.key]).length}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-slate-400">Loading vessel data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.filter((col) => visibleColumns[col.key]).length}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                      <p className="text-red-400">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setError(null);
                          // Trigger refetch by updating a dependency
                          setCurrentPage((prev) => prev);
                        }}
                        className="mt-2"
                      >
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.filter((col) => visibleColumns[col.key]).length}
                    className="text-center py-12"
                  >
                    <p className="text-slate-400">No vessels found</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b-slate-800 hover:bg-slate-700/10 transition-colors duration-200"
                  >
                  {columns
                    .filter((col) => visibleColumns[col.key])
                    .map((column) => (
                      <TableCell
                        key={`${column.key}-${column.label}`}
                        className="text-slate-300 whitespace-nowrap"
                      >
                        {column.customRender ? (
                          column.customRender(row)
                        ) : column.key === "vessel_name" ? (
                          <span className="font-medium text-white">
                            {row.vessel_name}
                          </span>
                        ) : column.key === "status" ? (
                          <Badge
                            className={`border ${getStatusBadge(
                              row.status
                            )} pointer-events-none whitespace-nowrap`}
                          >
                            {row.status}
                          </Badge>
                        ) : column.key === "operation_completed" ? (
                          formatOperationDate(row.operation_completed)
                        ) : column.key === "commodity_description" ? (
                          getCommodityLabel(row[column.key] || "")
                        ) : column.key === "quantity" ? (
                          <span className="font-medium">
                            {formatQuantity(row.quantity)}
                          </span>
                        ) : (
                          row[column.key] || "—"
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>

            {/* Table Footer with Pagination */}
            <TableFooter className="bg-slate-800/40 border-t border-slate-700/50">
              <tr>
                <td
                  colSpan={
                    columns.filter((col) => visibleColumns[col.key]).length
                  }
                  className="p-0"
                >
                  <div className="px-4 py-3">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      {/* Results info */}
                      <div className="text-sm text-slate-400">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(
                          currentPage * pageSize,
                          totalCount
                        )}{" "}
                        of {totalCount} results
                      </div>

                      {/* Pagination controls */}
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                        {/* Page size selector */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-400 whitespace-nowrap">
                            Rows per page:
                          </span>
                          <Select
                            value={pageSize.toString()}
                            onValueChange={(value) =>
                              setPageSize(Number(value))
                            }
                          >
                            <SelectTrigger className="w-[80px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                              <SelectItem value="150">150</SelectItem>
                              <SelectItem value="200">200</SelectItem>
                              <SelectItem value="250">250</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Page info */}
                        <div className="text-sm text-slate-400 text-center sm:text-left">
                          Page {currentPage} of {totalPages}
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          {/* Page numbers - responsive */}
                          <div className="hidden lg:flex items-center space-x-1">
                            {getPageList().map((p, idx) =>
                              typeof p === "number" ? (
                                <Button
                                  key={`${p}-${idx}`}
                                  variant={
                                    p === currentPage ? "default" : "outline"
                                  }
                                  size="sm"
                                  onClick={() => setCurrentPage(p)}
                                  className="h-8 min-w-[2rem] text-xs"
                                >
                                  {p}
                                </Button>
                              ) : (
                                <span
                                  key={`ellipsis-${idx}`}
                                  className="px-1 text-xs text-slate-400"
                                >
                                  {p}
                                </span>
                              )
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage(
                                Math.min(totalPages, currentPage + 1)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
