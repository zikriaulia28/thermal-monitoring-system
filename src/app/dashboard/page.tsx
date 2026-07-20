import DashboardClient from "@/components/dashboard/DashboardClient";
import { serverFetch } from "@/lib/serverFetch";
import type { Device } from "@/types/device";

interface Overview {
  online: number;
  offline: number;
  avgTemperature: number;
  avgHumidity: number;
}
interface AlertsSummary {
  active: number;
  critical: number;
}
interface RecentAlertsResp {
  data: import("@/components/tables/EventLog").AlertItem[];
}
interface DailyResp {
  stats: import("@/types/dashboard").DeviceDailyStat[];
}

// Server Component: preload data di server agar HTML langsung berisi angka
// -> LCP instan (tidak nunggu client fetch), CLS hilang (layout tidak shift).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [overview, devices, alertsSummary, recentAlerts, daily] = await Promise.all([
    serverFetch<Overview>("/api/dashboard/overview"),
    serverFetch<Device[]>("/api/dashboard/chart?range=realtime"),
    serverFetch<AlertsSummary>("/api/dashboard/alerts?summary=true"),
    serverFetch<RecentAlertsResp>("/api/dashboard/alerts?limit=5"),
    serverFetch<DailyResp>("/api/dashboard/daily-stats?range=realtime"),
  ]);

  return (
    <DashboardClient
      overview={overview}
      devices={devices}
      alertsSummary={alertsSummary}
      recentAlerts={recentAlerts}
      dailyStats={daily}
    />
  );
}
