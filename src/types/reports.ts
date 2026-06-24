import { Prisma } from '@prisma/client';

export interface AlertReportItem {
  id: string;
  device: string;
  location: string;
  type: string;
  message: string;
  severity: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface ReportSummary {
  date: string;
  location: string;
  tempAvg: number;
  tempMin: number;
  tempMax: number;
  humidityAvg: number;
  humidityMin: number;
  humidityMax: number;
  alertCount: number;
}

export interface DetailedLogReport {
  time: string;
  device: string;
  location: string;
  temperature: number;
  humidity: number;
}

export interface DevicePerformance {
  device: string;
  deviceId: string;
  location: string;
  uptime: number;
  downtime: number;
  reliability: number;
  lastSeen: string;
  totalReadings: number;
}

export type ReportType = 'summary' | 'detailed' | 'alerts' | 'performance';

export interface ReportRequest {
  type: ReportType;
  startDate: string;
  endDate: string;
  deviceIds?: string[];
  locations?: string[];
  severity?: string[];
  page?: number;
  limit?: number;
}

export interface ReportResponse {
  type: ReportType;
  generatedAt: string;
  data: Array<AlertReportItem | ReportSummary | DetailedLogReport | DevicePerformance>;
  summary: {
    totalRecords: number;
    period: string;
    devices: number;
  };
}

// Export types
export interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  acknowledged: number;
  pending: number;
  period: string;
}
