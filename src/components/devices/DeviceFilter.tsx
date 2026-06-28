"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";
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

const sortOptions = [
  { value: "name" as const, label: "Nama (A-Z)" },
  { value: "status" as const, label: "Status" },
  { value: "temperature" as const, label: "Temperature" },
  { value: "lastSeen" as const, label: "Terakhir Dilihat" },
];

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

  const hasActiveFilter = statusFilter !== "all";

  return (
    <div className="rounded-xl border bg-white shadow-sm dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
      {/* ── Search Bar ──────────────────────────────────── */}
      <div className="p-4 sm:p-5 pb-3 sm:pb-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari device atau lokasi..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600
                       bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white
                       placeholder:text-slate-400 dark:placeholder:text-slate-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       focus:bg-white dark:focus:bg-slate-800
                       text-sm min-h-[44px] transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 
                         hover:bg-slate-200 dark:hover:bg-slate-700 
                         rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Sort Dropdown - Desktop */}
          <div className="hidden sm:block">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as typeof sortBy)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600
                       bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-sm min-h-[44px] appearance-none cursor-pointer
                       transition-all duration-200 pr-8"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Toggle - Mobile */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5
                     border border-slate-300 dark:border-slate-600 rounded-lg
                     text-sm font-medium text-slate-600 dark:text-slate-400
                     hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilter && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </button>
        </div>
      </div>

      {/* ── Filter Panel ────────────────────────────────── */}
      <div
        className={`
          ${isFilterOpen ? "block" : "hidden"} sm:block
          border-t border-slate-100 dark:border-slate-700
          px-4 pb-4 pt-3 sm:px-5 sm:pb-5
        `}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          {/* Status Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterPill
                label="All"
                active={statusFilter === "all"}
                onClick={() => onStatusFilterChange("all")}
                activeColor="bg-slate-700 text-white ring-2 ring-offset-1 ring-slate-500"
                inactiveColor="bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              />
              <FilterPill
                label="Online"
                active={statusFilter === "online"}
                onClick={() => onStatusFilterChange("online")}
                activeColor="bg-green-100 text-green-700 ring-2 ring-offset-1 ring-green-500 dark:bg-green-900/30 dark:text-green-400"
                inactiveColor="bg-white border border-slate-200 text-slate-600 hover:bg-green-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-green-900/20"
              />
              <FilterPill
                label="Offline"
                active={statusFilter === "offline"}
                onClick={() => onStatusFilterChange("offline")}
                activeColor="bg-red-100 text-red-700 ring-2 ring-offset-1 ring-red-500 dark:bg-red-900/30 dark:text-red-400"
                inactiveColor="bg-white border border-slate-200 text-slate-600 hover:bg-red-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-red-900/20"
              />
            </div>
          </div>

          {/* Sort - Mobile */}
          <div className="sm:hidden">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Urutkan
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as typeof sortBy)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count + Clear */}
          <div className="flex items-center gap-3 sm:pb-0.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredCount}</span>
              {" / "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{totalDevices}</span>
              {" devices"}
            </span>
            {(searchQuery || hasActiveFilter) && (
              <button
                onClick={() => {
                  onSearchChange("");
                  onStatusFilterChange("all");
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-700
                         dark:text-blue-400 dark:hover:text-blue-300
                         hover:underline transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  activeColor,
  inactiveColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  activeColor: string;
  inactiveColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 ${
        active ? activeColor : inactiveColor
      }`}
    >
      {label}
    </button>
  );
}
