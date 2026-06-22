"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle, X, AlertTriangle, Info } from "lucide-react";

interface ToastProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose: () => void;
  duration?: number;
}

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const ICON_STYLES = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-yellow-600",
  info: "text-blue-600",
};

export default function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  const Icon = TOAST_ICONS[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[320px] max-w-md ${TOAST_STYLES[type]}`}>
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${ICON_STYLES[type]}`} />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-0.5 hover:bg-black/5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
