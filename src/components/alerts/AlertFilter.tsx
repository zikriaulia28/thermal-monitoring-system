"use client";

import { useState, useMemo } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import debounce from "lodash.debounce";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  severity: string;
  setSeverity: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
}

export default function AlertFilter({
  search,
  setSearch,
  severity,
  setSeverity,
  status,
  setStatus,
}: Props) {
  const [searchInput, setSearchInput] = useState(search);
  const [isExpanded, setIsExpanded] = useState(true);

  const debouncedSetSearch = useMemo(
    () => debounce((val: string) => setSearch(val), 300),
    [setSearch],
  );

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    debouncedSetSearch(val);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  const hasActiveFilters = severity !== "" || status !== "" || search !== "";

  const handleClearAll = () => {
    setSearchInput("");
    setSearch("");
    setSeverity("");
    setStatus("");
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
      {/* ── Search Bar ──────────────────────────────────── */}
      <div className="p-4 sm:p-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari device, lokasi, atau pesan..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600
                     bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     focus:bg-white dark:focus:bg-slate-800
                     text-sm min-h-[44px]
                     transition-all duration-200"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 
                       hover:bg-slate-200 dark:hover:bg-slate-700 
                       rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Toggle (Mobile) ──────────────────────── */}
      <div className="sm:hidden px-4 pb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg
                   border border-slate-200 dark:border-slate-600
                   text-sm font-medium text-slate-600 dark:text-slate-400
                   hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {(severity !== "" || status !== "") && (
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          )}
        </button>
      </div>

      {/* ── Filter Pills ────────────────────────────────── */}
      <div
        className={`
          ${isExpanded ? "block" : "hidden"} sm:block
          border-t border-slate-100 dark:border-slate-700
          px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-0
          sm:border-t-0 sm:pt-4
        `}
      >
        <div className="space-y-3">
          {/* Severity */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Severity
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterPill
                label="All"
                active={severity === ""}
                onClick={() => setSeverity("")}
                activeColor="bg-slate-700 text-white ring-2 ring-offset-1 ring-slate-500"
                inactiveColor="bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              />
              <FilterPill
                label="🔴 Critical"
                active={severity === "CRITICAL"}
                onClick={() => setSeverity("CRITICAL")}
                activeColor="bg-red-100 text-red-700 ring-2 ring-offset-1 ring-red-500 dark:bg-red-900/30 dark:text-red-400"
                inactiveColor="bg-white border border-slate-200 text-slate-600 hover:bg-red-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-red-900/20"
              />
              <FilterPill
                label="🟡 Warning"
                active={severity === "WARNING"}
                onClick={() => setSeverity("WARNING")}
                activeColor="bg-yellow-100 text-yellow-700 ring-2 ring-offset-1 ring-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400"
                inactiveColor="bg-white border border-slate-200 text-slate-600 hover:bg-yellow-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-yellow-900/20"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterPill
                label="All"
                active={status === ""}
                onClick={() => setStatus("")}
                activeColor="bg-slate-700 text-white ring-2 ring-offset-1 ring-slate-500"
                inactiveColor="bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              />
              <FilterPill
                label="🔴 Active"
                active={status === "active"}
                onClick={() => setStatus("active")}
                activeColor="bg-red-100 text-red-700 ring-2 ring-offset-1 ring-red-500 dark:bg-red-900/30 dark:text-red-400"
                inactiveColor="bg-white border border-slate-200 text-slate-600 hover:bg-red-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-red-900/20"
              />
              <FilterPill
                label="✅ Acknowledged"
                active={status === "ack"}
                onClick={() => setStatus("ack")}
                activeColor="bg-green-100 text-green-700 ring-2 ring-offset-1 ring-green-500 dark:bg-green-900/30 dark:text-green-400"
                inactiveColor="bg-white border border-slate-200 text-slate-600 hover:bg-green-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-green-900/20"
              />
            </div>
          </div>

          {/* Clear All */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-1">
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         text-xs font-medium text-blue-600 hover:text-blue-700
                         hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20
                         transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reusable Pill Button ──────────────────────────────────
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
      className={`
        px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
        ${active ? activeColor : inactiveColor}
        active:scale-95
      `}
    >
      {label}
    </button>
  );
}
