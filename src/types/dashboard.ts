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
