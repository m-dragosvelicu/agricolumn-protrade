import React from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Package, Columns } from "lucide-react";

const selectClass =
  "bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500";

const FilterButton = ({ children, icon: Icon }) => (
  <Button
    variant="outline"
    className="flex items-center gap-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
  >
    {Icon && <Icon className="w-4 h-4 text-slate-400" />}
    {children}
  </Button>
);

export default function FilterBar({
  statusFilter,
  onStatusChange,
  operationTypeFilter,
  onOperationTypeChange,
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <span className="sr-only">Status Filter</span>
          <select
            className={selectClass}
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Loading">Loading</option>
            <option value="Loaded">Loaded</option>
            <option value="In Transit">In Transit</option>
            <option value="Discharged">Discharged</option>
            <option value="Completed">Completed</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-400">
          <span className="sr-only">Operation Type Filter</span>
          <select
            className={selectClass}
            value={operationTypeFilter}
            onChange={(event) => onOperationTypeChange(event.target.value)}
          >
            <option value="all">All Operation Types</option>
            <option value="Export">Export</option>
            <option value="Import">Import</option>
            <option value="Transit">Transit</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <FilterButton icon={Package}>Commodity</FilterButton>
        <FilterButton icon={SlidersHorizontal}>Filter</FilterButton>
        <FilterButton icon={Columns}>Columns</FilterButton>
      </div>
    </div>
  );
}
