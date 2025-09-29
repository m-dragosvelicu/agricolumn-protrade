"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Settings,
  ChevronUp,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { mockVesselData } from '@/lib/mockData';
import { VesselData } from '@/types';
import { PanelHeader } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

interface ConstantaPortPanelProps {
  className?: string;
}

type SortField = keyof VesselData;
type SortDirection = 'asc' | 'desc';

const columns = [
  { key: 'vessel_name' as SortField, label: 'Vessel Name', visible: true },
  { key: 'status' as SortField, label: 'Status', visible: true },
  { key: 'departure_country' as SortField, label: 'Departure Country', visible: true },
  { key: 'departure_port' as SortField, label: 'Departure Port', visible: true },
  { key: 'departure_terminal' as SortField, label: 'Departure Terminal', visible: true },
  { key: 'destination_country' as SortField, label: 'Destination Country', visible: true },
  { key: 'operation_type' as SortField, label: 'Operation Type', visible: true },
  { key: 'operation_completed' as SortField, label: 'Completed Date', visible: true },
  { key: 'commodity_description' as SortField, label: 'Commodity', visible: true },
  { key: 'shipper' as SortField, label: 'Shipper', visible: true },
  { key: 'cargo_origin_1' as SortField, label: 'Origin 1', visible: false },
  { key: 'cargo_origin_2' as SortField, label: 'Origin 2', visible: false },
];

export function ConstantaPortPanel({ className }: ConstantaPortPanelProps) {
  const [data] = useState<VesselData[]>(mockVesselData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('operation_completed');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: col.visible }), {} as Record<string, boolean>)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [statusFilter, setStatusFilter] = useState('all');
  const [operationTypeFilter, setOperationTypeFilter] = useState('all');
  const [commodityFilter, setCommodityFilter] = useState('all');

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(row => {
      const matchesSearch = Object.values(row).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      const matchesOperationType = operationTypeFilter === 'all' || row.operation_type === operationTypeFilter;
      const matchesCommodity = commodityFilter === 'all' || row.commodity_description === commodityFilter;

      return matchesSearch && matchesStatus && matchesOperationType && matchesCommodity;
    });

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? 
          aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection, statusFilter, operationTypeFilter, commodityFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / pageSize));

  // Reset to first page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, operationTypeFilter, commodityFilter]);

  // Clamp current page if total pages shrink below current
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getUniqueValues = (field: keyof VesselData) => {
    return Array.from(new Set(data.map(row => row[field]).filter(Boolean))).map(String);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      "Loading": "bg-blue-500/20 text-blue-300 border-blue-500/30",
      "Loaded": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      "In Transit": "bg-purple-500/20 text-purple-300 border-purple-500/30",
      "Discharged": "bg-orange-500/20 text-orange-300 border-orange-500/30",
      "Completed": "bg-green-500/20 text-green-300 border-green-500/30"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setOperationTypeFilter('all');
    setCommodityFilter('all');
    setSearchTerm('');
  };

  const activeFiltersCount = (statusFilter !== 'all' ? 1 : 0) + (operationTypeFilter !== 'all' ? 1 : 0) + (commodityFilter !== 'all' ? 1 : 0);

  const exportCSV = () => {
    const visibleCols = columns.filter(col => visibleColumns[col.key]);
    const headers = visibleCols.map(col => col.label).join(',');
    const rows = filteredAndSortedData.map(row => 
      visibleCols.map(col => row[col.key] || '').join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'constanta-port-data.csv';
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
    if (showLeftEllipsis) pages.push('…');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (showRightEllipsis) pages.push('…');
    pages.push(totalPages);

    return pages;
  };

  return (
    <Card className={cn('flex flex-col bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50', className)}>
      <PanelHeader
        title="Constanta Port"
        lastUpdated="2 minutes ago"
        onExport={exportCSV}
        onFullscreen={() => {}}
      />
      
      <CardContent className="p-0">
        {/* Controls */}
        <div className="p-4 border-b border-slate-700/50 space-y-4">
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Filter Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Status Filter */}
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {getUniqueValues('status').map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operation Type Filter */}
                  <div>
                    <Label className="text-sm font-medium">Operation Type</Label>
                    <Select value={operationTypeFilter} onValueChange={setOperationTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {getUniqueValues('operation_type').map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Commodity Filter */}
                  <div>
                    <Label className="text-sm font-medium">Commodity</Label>
                    <Select value={commodityFilter} onValueChange={setCommodityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All commodities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Commodities</SelectItem>
                        {getUniqueValues('commodity_description').map(commodity => (
                          <SelectItem key={commodity} value={commodity}>{commodity}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

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
                  {columns.map(column => (
                    <div key={column.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.key}
                        checked={visibleColumns[column.key]}
                        onCheckedChange={(checked) => {
                          setVisibleColumns({
                            ...visibleColumns,
                            [column.key]: !!checked
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
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setStatusFilter('all')}
                  />
                </Badge>
              )}
              {operationTypeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Operation: {operationTypeFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setOperationTypeFilter('all')}
                  />
                </Badge>
              )}
              {commodityFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Commodity: {commodityFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setCommodityFilter('all')}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div>
          <Table>
            <TableHeader>
              <TableRow className="border-b-slate-700/50">
                {columns.filter(col => visibleColumns[col.key]).map(column => (
                  <TableHead
                    key={column.key}
                    className="text-slate-400 font-semibold cursor-pointer hover:bg-slate-700/30"
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortField === column.key && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={row.id} className="border-b-slate-800 hover:bg-slate-700/10 transition-colors duration-200">
                  {columns.filter(col => visibleColumns[col.key]).map(column => (
                    <TableCell key={column.key} className="text-slate-300">
                      {column.key === 'vessel_name' ? (
                        <span className="font-medium text-white">
                          {row.vessel_name}
                        </span>
                      ) : column.key === 'status' ? (
                        <Badge className={`border ${getStatusBadge(row.status)} pointer-events-none whitespace-nowrap`}>
                          {row.status}
                        </Badge>
                      ) : column.key === 'operation_completed' ? (
                        row.operation_completed ? new Date(row.operation_completed).toLocaleDateString() : '—'
                      ) : (
                        row[column.key] || '—'
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            
            {/* Table Footer with Pagination */}
            <TableFooter className="bg-slate-800/40 border-t border-slate-700/50">
              <tr>
                <td colSpan={columns.filter(col => visibleColumns[col.key]).length} className="p-0">
                  <div className="px-4 py-3">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      {/* Results info */}
                      <div className="text-sm text-slate-400">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
                      </div>
                      
                      {/* Pagination controls */}
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
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
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          {/* Page numbers - responsive */}
                          <div className="hidden lg:flex items-center space-x-1">
                            {getPageList().map((p, idx) => (
                              typeof p === 'number' ? (
                                <Button
                                  key={`${p}-${idx}`}
                                  variant={p === currentPage ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setCurrentPage(p)}
                                  className="h-8 min-w-[2rem] text-xs"
                                >
                                  {p}
                                </Button>
                              ) : (
                                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">{p}</span>
                              )
                            ))}
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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