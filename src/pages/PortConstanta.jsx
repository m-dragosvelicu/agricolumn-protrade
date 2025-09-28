import React, { useState, useEffect, useCallback } from "react";
import { PortConstanta } from "@/entities/PortConstanta";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import FilterBar from "@/components/port-constanta/FilterBar";

export default function PortConstantaPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [operationTypeFilter, setOperationTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const filterData = useCallback(() => {
    let filtered = data;

    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (operationTypeFilter !== "all") {
      filtered = filtered.filter(item => item.operation_type === operationTypeFilter);
    }

    setFilteredData(filtered);
  }, [data, statusFilter, operationTypeFilter]);

  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    filterData();
  }, [filterData]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await PortConstanta.list("-operation_completed", 100);
      setData(result);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const getStatusBadge = (status) => {
    const colors = {
      "Loading": "bg-blue-500/20 text-blue-300 border-blue-500/30",
      "Loaded": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", 
      "In Transit": "bg-purple-500/20 text-purple-300 border-purple-500/30",
      "Discharged": "bg-orange-500/20 text-orange-300 border-orange-500/30",
      "Completed": "bg-green-500/20 text-green-300 border-green-500/30"
    };
    return colors[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <div className="space-y-6">
      <FilterBar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        operationTypeFilter={operationTypeFilter}
        onOperationTypeChange={setOperationTypeFilter}
      />
      
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-slate-700/50">
                <TableHead className="text-slate-400 font-semibold">Vessel Name</TableHead>
                <TableHead className="text-slate-400 font-semibold">Status</TableHead>
                <TableHead className="text-slate-400 font-semibold">Departure Country</TableHead>
                <TableHead className="text-slate-400 font-semibold">Departure Port</TableHead>
                <TableHead className="text-slate-400 font-semibold">Departure Terminal</TableHead>
                <TableHead className="text-slate-400 font-semibold">Destination Country</TableHead>
                <TableHead className="text-slate-400 font-semibold">Operation Type</TableHead>
                <TableHead className="text-slate-400 font-semibold">Completed Date</TableHead>
                <TableHead className="text-slate-400 font-semibold">Commodity</TableHead>
                <TableHead className="text-slate-400 font-semibold">Shipper</TableHead>
                <TableHead className="text-slate-400 font-semibold">Origin 1</TableHead>
                <TableHead className="text-slate-400 font-semibold">Origin 2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-b-slate-800">
                    {Array(12).fill(0).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-slate-700/50 rounded animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                filteredData.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="border-b-slate-800 hover:bg-slate-700/10 transition-colors duration-200"
                  >
                    <TableCell className="font-medium text-white">{item.vessel_name}</TableCell>
                    <TableCell>
                      <Badge className={`border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{item.departure_country}</TableCell>
                    <TableCell className="text-slate-300">{item.departure_port}</TableCell>
                    <TableCell className="text-slate-300">{item.departure_terminal}</TableCell>
                    <TableCell className="text-slate-300">{item.destination_country}</TableCell>
                    <TableCell className="text-slate-300">{item.operation_type}</TableCell>
                    <TableCell className="text-slate-300">
                      {item.operation_completed ? format(new Date(item.operation_completed), "dd.MM.yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-slate-300">{item.commodity_description}</TableCell>
                    <TableCell className="text-slate-300">{item.shipper}</TableCell>
                    <TableCell className="text-slate-300">{item.cargo_origin_1}</TableCell>
                    <TableCell className="text-slate-300">{item.cargo_origin_2}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
