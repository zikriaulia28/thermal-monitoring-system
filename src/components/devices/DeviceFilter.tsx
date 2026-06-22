"use client";

import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

interface DeviceFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: "all" | "online" | "offline";
  onStatusFilterChange: (status: "all" | "online" | "offline") => void;
  sortBy: "name" | "status" | "temperature" | "lastSeen";
  onSortChange: (sort: "name" | "status" | "temperature" | "lastSeen") => void;
  totalDevices: number;
  filteredCount: number;
}

export default function DeviceFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  totalDevices,
  filteredCount,
}: DeviceFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const statusOptions = [
    { value: "all" as const, label: "All Devices", color: "bg-slate-100 text-slate-700" },
    { value: "online" as const, label: "Online", color: "bg-green-100 text-green-700" },
    { value: "offline" as const, label: "Offline", color: "bg-red-100 text-red-700" },
  ];

  const sortOptions = [
    { value: "name" as const, label: "Name (A-Z)" },
    { value: "status" as const, label: "Status" },
    { value: "temperature" as const, label: "Temperature" },
    { value: "lastSeen" as const, label: "Last Seen" },
  ];

  return (
    <div className="space-y-3">
      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by location or device ID..."
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button - Mobile */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {statusFilter !== "all" && (
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          )}
        </button>

        {/* Sort Dropdown - Desktop */}
        <div className="hidden sm:block">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="w-full sm:w-auto px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Panel - Always visible on desktop, toggle on mobile */}
      <div
        className={`
          ${isFilterOpen ? "block" : "hidden"} sm:block
          p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3
        `}
      >
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Status Filter
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onStatusFilterChange(option.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${
                    statusFilter === option.value
                      ? `${option.color} ring-2 ring-offset-2 ring-blue-500`
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options - Mobile Only */}
        <div className="sm:hidden">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredCount}</span> of{" "}
            <span className="font-semibold text-slate-700">{totalDevices}</span> devices
          </span>
          {(searchQuery || statusFilter !== "all") && (
            <button
              onClick={() => {
                onSearchChange("");
                onStatusFilterChange("all");
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
