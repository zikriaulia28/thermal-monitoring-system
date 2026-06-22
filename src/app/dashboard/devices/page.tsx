"use client";

import { useEffect, useState, useMemo } from "react";

import DeviceSummary from "@/components/devices/DeviceSummary";
import DeviceGrid from "@/components/devices/DeviceGrid";
import DeviceFilter from "@/components/devices/DeviceFilter";

import { Device } from "@/types/device";
import { getDevices } from "@/services/deviceService";

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [sortBy, setSortBy] = useState<"name" | "status" | "temperature" | "lastSeen">("name");

  useEffect(() => {
    async function loadDevices() {
      try {
        const data = await getDevices();
        setDevices(data);
      } catch (error) {
        console.error("Failed to load devices:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDevices();

    // Changed from 5000ms to 30000ms (30 seconds)
    const interval = setInterval(loadDevices, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter and Sort Logic
  const filteredAndSortedDevices = useMemo(() => {
    let result = [...devices];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (device) =>
          device.location.toLowerCase().includes(query) ||
          device.id.toLowerCase().includes(query) ||
          device.name.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((device) => device.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        
        case "status":
          // Online first, then offline
          if (a.status === b.status) return 0;
          return a.status === "online" ? -1 : 1;
        
        case "temperature":
          const tempA = a.readings.at(-1)?.temperature ?? -999;
          const tempB = b.readings.at(-1)?.temperature ?? -999;
          return tempB - tempA; // Descending (hottest first)
        
        case "lastSeen":
          const timeA = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
          const timeB = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
          return timeB - timeA; // Most recent first
        
        default:
          return 0;
      }
    });

    return result;
  }, [devices, searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Devices
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage and monitor all IoT sensor nodes
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Device Summary */}
          <DeviceSummary devices={devices} />

          {/* Filter & Search */}
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

          {/* Device Grid */}
          {filteredAndSortedDevices.length > 0 ? (
            <DeviceGrid devices={filteredAndSortedDevices} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No devices found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters or search query"
                  : "No devices are currently registered"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
