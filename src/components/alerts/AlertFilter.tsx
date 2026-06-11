"use client";

import { Search } from "lucide-react";

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
  return (
    <div className="rounded-xl border bg-white p-4 sm:p-5 shadow-sm dark:bg-slate-800 dark:border-slate-700">
      {/* ✅ Grid responsif: 1 kolom di mobile, 3 kolom di desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     text-sm min-h-[44px]"
          />
        </div>

        {/* Severity Filter */}
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600
                   bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   text-sm min-h-[44px]"
        >
          <option value="">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="WARNING">Warning</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600
                   bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   text-sm min-h-[44px] sm:col-span-2 lg:col-span-1"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="ack">Acknowledged</option>
        </select>
      </div>
    </div>
  );
}
