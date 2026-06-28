"use client";

import { useState } from "react";
import { Calendar, ChevronDown, Clock, BarChart3, TrendingUp } from "lucide-react";
import { TimeRange, TIME_RANGE_OPTIONS } from "@/types/filter";
import DateRangePicker from "@/components/filters/DateRangePicker";

interface ModalTimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange, customFrom?: Date, customTo?: Date) => void;
  className?: string;
}

const RANGE_ICONS: Record<TimeRange, React.ReactNode> = {
  realtime: <Clock className="w-3.5 h-3.5" />,
  "1d": <BarChart3 className="w-3.5 h-3.5" />,
  "7d": <TrendingUp className="w-3.5 h-3.5" />,
  "30d": <Calendar className="w-3.5 h-3.5" />,
  "90d": <Calendar className="w-3.5 h-3.5" />,
  custom: <Calendar className="w-3.5 h-3.5" />,
};

export default function ModalTimeRangeSelector({
  value,
  onChange,
  className = "",
}: ModalTimeRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);

  const selectedOption = TIME_RANGE_OPTIONS.find((opt) => opt.value === value);

  const handleSelect = (range: TimeRange) => {
    if (range === "custom") {
      setShowDatePicker(true);
      setIsOpen(false);
    } else {
      onChange(range);
      setIsOpen(false);
    }
  };

  const handleCustomDateSelect = (from: Date, to: Date) => {
    setCustomFrom(from);
    setCustomTo(to);
    onChange("custom", from, to);
  };

  const getDisplayText = () => {
    if (value === "custom" && customFrom && customTo) {
      return `${customFrom.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "short" })} - ${customTo.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "short" })}`;
    }
    return selectedOption?.label || "Select Range";
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="text-slate-600 dark:text-slate-400">
            {RANGE_ICONS[value]}
          </div>
          <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            {getDisplayText()}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                {TIME_RANGE_OPTIONS.map((option) => {
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
                            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {RANGE_ICONS[option.value]}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold">
                          {option.label}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {option.description}
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

      {showDatePicker && (
        <DateRangePicker
          from={customFrom}
          to={customTo}
          onSelect={handleCustomDateSelect}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </>
  );
}
