"use client";

import { useEffect, useState, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Monitor, RefreshCw, Search } from "lucide-react";

import DeviceSummary from "@/components/devices/DeviceSummary";
import DeviceGrid from "@/components/devices/DeviceGrid";
import DeviceFilter from "@/components/devices/DeviceFilter";

import { Device } from "@/types/device";
import { getDevices } from "@/services/deviceService";

export default function DevicesPage() {
  usePageTitle("Devices");
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [sortBy, setSortBy] = useState<"name" | "status" | "temperature" | "lastSeen">("name");

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      const data = await getDevices();
      if (!cancelled) {
        setDevices(data);
        setIsLoading(false);
      }
    }
    fetchData();
        const interval = setInterval(fetchData, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = async () => {
    const data = await getDevices();
    setDevices(data);
  };

  const filteredAndSortedDevices = useMemo(() => {
    let result = [...devices];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.location.toLowerCase().includes(query) ||
          d.id.toLowerCase().includes(query) ||
          d.name.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return a.status === b.status ? 0 : a.status === "online" ? -1 : 1;
        case "temperature": {
          const tA = a.readings.at(-1)?.temperature ?? -999;
          const tB = b.readings.at(-1)?.temperature ?? -999;
          return tB - tA;
        }
        case "lastSeen": {
          const tA = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
          const tB = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
          return tB - tA;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [devices, searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-sm">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Devices
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Kelola dan pantau semua node sensor
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                   border border-border
                   text-sm font-medium text-foreground/80
                   hover:bg-muted
                   transition-colors min-h-[44px] shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          Muat Ulang
        </button>
      </div>

      {/* ── LOADING STATE ────────────────────────────────── */}
      {isLoading && devices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-border" />
            <div className="w-12 h-12 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin absolute inset-0" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Memuat devices...</p>
        </div>
      )}

      {/* ── CONTENT ──────────────────────────────────────── */}
      {(!isLoading || devices.length > 0) && (
        <>
          <DeviceSummary devices={devices} />

          <DeviceFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalDevices={devices.length}
            filteredCount={filteredAndSortedDevices.length}
          />

          {filteredAndSortedDevices.length > 0 ? (
            <DeviceGrid devices={filteredAndSortedDevices} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Tidak Ada Device Ditemukan
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {searchQuery || statusFilter !== "all"
                  ? "Coba ubah filter atau kata kunci pencarian Anda."
                  : "Belum ada device yang terdaftar dalam sistem."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
