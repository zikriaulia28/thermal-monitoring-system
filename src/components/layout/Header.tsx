"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ChevronRight, Calendar, Clock } from "lucide-react";

interface Props {
  onMenu?: () => void;
}

// Mapping untuk breadcrumb berdasarkan pathname
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
  const [time, setTime] = useState("");
  const [isDark, setIsDark] = useState(false);

  // Update waktu setiap detik
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

  // Dapatkan judul halaman saat ini
  const currentPage = pageTitles[pathname] || {
    title: "Dashboard",
    subtitle: "Overview sistem monitoring real-time",
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        {/* Left Section: Menu + Page Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} className="text-slate-600 dark:text-slate-400" />
          </button>

          {/* Page Title & Subtitle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              <span>Dashboard</span>
              {pathname !== "/dashboard" && (
                <>
                  <ChevronRight size={12} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {currentPage.title}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate">
              {currentPage.title}
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate">
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Time Display */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <Calendar
              size={14}
              className="text-slate-500 dark:text-slate-400"
            />
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
        </div>
      </div>
    </header>
  );
}
