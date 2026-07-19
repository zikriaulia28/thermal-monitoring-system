"use client";

import { useEffect, useState } from "react";

interface SystemStatus {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  unacknowledgedAlerts: number;
}

export function useSystemStatus(refreshInterval: number = 120000) {
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
          fetch("/api/dashboard/overview"),
          fetch("/api/dashboard/alerts?summary=true"),
        ]);

        if (overviewRes.ok && alertsRes.ok) {
          const overview = await overviewRes.json();
          const alerts = await alertsRes.json();

          setStatus({
            totalDevices: overview.online + overview.offline,
            onlineDevices: overview.online,
            offlineDevices: overview.offline,
            unacknowledgedAlerts: typeof alerts.active === "number" ? alerts.active : 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch system status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchStatus();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { status, isLoading };
}
