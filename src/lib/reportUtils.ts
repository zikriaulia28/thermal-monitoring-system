import { ReportSummary, DetailedLogReport } from '@/types/reports';

interface RawLogEntry {
  createdAt: string | Date;
  device?: { deviceId: string; location: string };
  temperature: number;
  humidity: number;
}

interface SensorReading {
  temperature: number;
  humidity: number;
  createdAt: Date;
}

export function calculateStats(readings: SensorReading[]) {
  if (readings.length === 0) {
    return {
      tempAvg: 0,
      tempMin: 0,
      tempMax: 0,
      humidityAvg: 0,
      humidityMin: 0,
      humidityMax: 0,
    };
  }

  const temps = readings.map((r) => r.temperature);
  const humidities = readings.map((r) => r.humidity);

  return {
    tempAvg: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 100) / 100,
    tempMin: Math.min(...temps),
    tempMax: Math.max(...temps),
    humidityAvg: Math.round((humidities.reduce((a, b) => a + b, 0) / humidities.length) * 100) / 100,
    humidityMin: Math.min(...humidities),
    humidityMax: Math.max(...humidities),
  };
}

export function groupReadingsByDay(
  readings: (SensorReading & { location: string; deviceId: string })[],
) {
  const groups: Record<string, (SensorReading & { location: string; deviceId: string })[]> = {};

  readings.forEach((reading) => {
    const date = new Date(reading.createdAt).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(reading);
  });

  return groups;
}

export function summarizeByDay(
  readings: (SensorReading & { location: string; deviceId: string })[],
): ReportSummary[] {
  const grouped = groupReadingsByDay(readings);
  const summaries: ReportSummary[] = [];

  Object.entries(grouped).forEach(([date, dayReadings]) => {
    const locationGroups: Record<string, typeof dayReadings> = {};

    dayReadings.forEach((reading) => {
      if (!locationGroups[reading.location]) {
        locationGroups[reading.location] = [];
      }
      locationGroups[reading.location].push(reading);
    });

    Object.entries(locationGroups).forEach(([location, locationReadings]) => {
      const stats = calculateStats(locationReadings);
      summaries.push({
        date,
        location,
        ...stats,
        alertCount: 0, // Will be filled from alerts data
      });
    });
  });

  return summaries;
}

export function formatReportData(
  data: (RawLogEntry | DetailedLogReport)[],
  reportType: string,
): DetailedLogReport[] {
  if (reportType === 'detailed') {
    return data.map((item) => ({
      time: new Date((item as RawLogEntry).createdAt).toLocaleString('id-ID'),
      device: (item as RawLogEntry).device?.deviceId || 'Unknown',
      location: (item as RawLogEntry).device?.location || 'Unknown',
      temperature: item.temperature,
      humidity: item.humidity,
    }));
  }

  return data as DetailedLogReport[];
}
