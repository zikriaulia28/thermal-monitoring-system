"use client";

import { useEffect, useState } from "react";

interface SystemStatus {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  unacknowledgedAlerts: number;
}

export function useSystemStatus(refreshInterval: number = 30000) {
  const [status, setStatus] = useState<SystemStatus>({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    unacknowledgedAlerts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [overviewRes, alertsRes] = await Promise.all([
          fetch("/api/dashboard/overview", { cache: "no-store" }),
          fetch("/api/dashboard/alerts", { cache: "no-store" }),
        ]);

        if (overviewRes.ok && alertsRes.ok) {
          const overview = await overviewRes.json();
          const alerts = await alertsRes.json();

          const unacknowledged = Array.isArray(alerts)
            ? alerts.filter((alert: { acknowledged?: boolean }) => !alert.acknowledged).length
            : 0;

          setStatus({
            totalDevices: overview.online + overview.offline,
            onlineDevices: overview.online,
            offlineDevices: overview.offline,
            unacknowledgedAlerts: unacknowledged,
          });
        }
      } catch (error) {
        console.error("Failed to fetch system status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { status, isLoading };
}
