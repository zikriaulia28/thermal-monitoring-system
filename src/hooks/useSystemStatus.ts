"use client";

import { useSyncExternalStore } from "react";
import { subscribeStatus, getStatus, getServerStatus, refreshStatus } from "@/lib/statusStore";

export function useSystemStatus() {
  const s = useSyncExternalStore(subscribeStatus, getStatus, getServerStatus);
  return {
    status: {
      totalDevices: s.totalDevices,
      onlineDevices: s.onlineDevices,
      offlineDevices: s.offlineDevices,
      unacknowledgedAlerts: s.unacknowledgedAlerts,
    },
    isLoading: s.isLoading,
    refreshStatus,
  };
}
