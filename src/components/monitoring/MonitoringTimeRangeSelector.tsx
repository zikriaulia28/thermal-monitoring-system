"use client";

import { useState } from "react";
import { Clock, CalendarDays, ChevronDown, History } from "lucide-react";
import { MonitoringTimeRange, MONITORING_TIME_RANGE_OPTIONS } from "@/types/monitoring";

interface Props {
  value: MonitoringTimeRange;
  onChange: (range: MonitoringTimeRange) => void;
}

const RANGE_ICONS: Record<MonitoringTimeRange, React.ReactNode> = {
  "1h": <Clock className="w-4 h-4" />,
  "6h": <History className="w-4 h-4" />,
  "12h": <CalendarDays className="w-4 h-4" />,
  "24h": <CalendarDays className="w-4 h-4" />,
};

export default function MonitoringTimeRangeSelector({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = MONITORING_TIME_RANGE_OPTIONS.find((opt) => opt.value === value);

  const handleSelect = (range: MonitoringTimeRange) => {
    onChange(range);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
      >
        <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
          {RANGE_ICONS[value]}
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          {selectedOption?.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2">
              {MONITORING_TIME_RANGE_OPTIONS.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {RANGE_ICONS[option.value]}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold">
                        {option.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Last {option.hours} hour{option.hours > 1 ? "s" : ""}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
