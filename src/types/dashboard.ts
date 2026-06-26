export interface DashboardOverview {
  online: number;
  offline: number;
  avgTemperature: number;
  avgHumidity: number;
}

export interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  criticalAlerts: number;
  avgTemperature: number;
  avgHumidity: number;
}

// ── Daily Stats ──

export interface DeviceDailyStat {
  deviceId: string;
  location: string;
  name: string;
  count: number;
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  minHum: number;
  maxHum: number;
  avgHum: number;
}

export interface HourlyReading {
  hour: string; // "08:00" format
  deviceId: string;
  location: string;
  count: number;
  minTemp: number | null;
  maxTemp: number | null;
  avgTemp: number | null;
  minHum: number | null;
  maxHum: number | null;
  avgHum: number | null;
}

export interface DailyStatsResponse {
  stats: DeviceDailyStat[];
  hourly: HourlyReading[];
}
