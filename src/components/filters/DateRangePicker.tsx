"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Toast from "@/components/ui/Toast";

interface DateRangePickerProps {
  from: Date | null;
  to: Date | null;
  onSelect: (from: Date, to: Date) => void;
  onClose: () => void;
}

export default function DateRangePicker({
  from,
  to,
  onSelect,
  onClose,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<string>(
    from ? from.toISOString().split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState<string>(
    to ? to.toISOString().split("T")[0] : ""
  );
  const [toast, setToast] = useState<{
    type: "error" | "warning" | "info";
    message: string;
  } | null>(null);

  const handleApply = () => {
    if (!startDate || !endDate) {
      setToast({
        type: "warning",
        message: "Harap pilih start date dan end date",
      });
      return;
    }

    const fromDate = new Date(startDate);
    const toDate = new Date(endDate);

    if (fromDate > toDate) {
      setToast({
        type: "error",
        message: "Start date harus lebih kecil atau sama dengan end date",
      });
      return;
    }

    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 180) {
      setToast({
        type: "warning",
        message: "Range maksimal adalah 180 hari (6 bulan)",
      });
      return;
    }

    if (daysDiff === 0) {
      setToast({
        type: "info",
        message: "Menampilkan data untuk 1 hari",
      });
    }

    onSelect(fromDate, toDate);
    onClose();
  };

  const today = new Date().toISOString().split("T")[0];
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Custom Date Range
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pilih range maksimal 6 bulan
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={minDateStr}
                max={today}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || minDateStr}
                max={today}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {startDate && endDate && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-medium text-blue-800">
                  Range: {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} hari
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!startDate || !endDate}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
