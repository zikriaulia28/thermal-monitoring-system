"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronRight, Calendar, Clock, Bell, RefreshCw, Wifi, WifiOff, Shield, ShieldOff } from "lucide-react";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { checkAdminAccess } from "@/lib/adminAccess";

interface Props {
  onMenu?: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overview sistem monitoring real-time",
  },
  "/dashboard/devices": {
    title: "Devices",
    subtitle: "Kelola perangkat IoT yang terhubung",
  },
  "/dashboard/monitoring": {
    title: "Monitoring",
    subtitle: "Pantau data sensor secara langsung",
  },
  "/dashboard/alerts": {
    title: "Alerts",
    subtitle: "Alarm dan notifikasi sistem",
  },
  "/dashboard/reports": {
    title: "Reports",
    subtitle: "Laporan dan analisis data",
  },
  "/dashboard/settings": {
    title: "Settings",
    subtitle: "Konfigurasi sistem dan preferensi",
  },
};

export default function Header({ onMenu }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [time, setTime] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { status } = useSystemStatus();

  useEffect(() => {
    setIsAdmin(checkAdminAccess());
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setTime(`${dateStr} • ${timeStr} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentPage = pageTitles[pathname] || {
    title: "Dashboard",
    subtitle: "Overview sistem monitoring real-time",
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
        {/* Left Section: Menu + Page Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            aria-label="Toggle menu"
          >
            <Menu size={20} className="text-slate-600 dark:text-slate-400" />
          </button>

          {/* Page Title & Breadcrumb */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">•••</span>
              {pathname !== "/dashboard" && (
                <>
                  <ChevronRight size={12} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {currentPage.title}
                  </span>
                </>
              )}
            </div>
            
            {/* Title */}
            <h1 className="text-base md:text-lg lg:text-xl font-bold text-slate-900 dark:text-white truncate">
              {currentPage.title}
            </h1>
            
            {/* Subtitle - Hidden on mobile */}
            <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
          {/* System Status - Tablet & Desktop */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            {status.onlineDevices > 0 ? (
              <Wifi size={14} className="text-green-500" />
            ) : (
              <WifiOff size={14} className="text-red-500" />
            )}
            <div className="text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                {status.onlineDevices}/{status.totalDevices}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Devices
              </div>
            </div>
          </div>

          {/* Time Display - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <Calendar size={14} className="text-slate-500 dark:text-slate-400" />
            <div className="text-xs">
              <div className="font-medium text-slate-700 dark:text-slate-300">
                {time.split(" • ")[0]}
              </div>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Clock size={10} />
                {time.split(" • ")[1]}
              </div>
            </div>
          </div>

          {/* Admin Badge */}
          {isAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Admin
              </span>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
            aria-label="Refresh data"
            title="Refresh"
          >
            <RefreshCw
              size={18}
              className={`text-slate-600 dark:text-slate-400 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => router.push("/dashboard/alerts")}
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
            aria-label="View alerts"
            title="Alerts"
          >
            <Bell size={18} className="text-slate-600 dark:text-slate-400" />
            {status.unacknowledgedAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                {status.unacknowledgedAlerts > 9 ? "9+" : status.unacknowledgedAlerts}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
