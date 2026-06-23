import useSWR from "swr";

interface Thresholds {
  tempMin: number;
  tempMax: number;
  tempWarning: number;
  humMin: number;
  humMax: number;
  refreshInterval: number;
}

interface SettingsResponse {
  id: string;
  thresholdTempMin: number;
  thresholdTempMax: number;
  thresholdHumidityMin: number;
  thresholdHumidityMax: number;
  dataRetentionDays: number;
  monitoringIntervalSeconds: number;
}

const DEFAULT_THRESHOLDS: Thresholds = {
  tempMin: 15,
  tempMax: 35,
  tempWarning: 28,
  humMin: 30,
  humMax: 70,
  refreshInterval: 30,
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
};

export function useThresholds(): Thresholds & { isLoading: boolean } {
  const { data, isLoading } = useSWR<{ success: boolean; data: SettingsResponse }>(
    "/api/settings",
    fetcher,
    {
      dedupingInterval: 10000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 60000,
    }
  );

  if (!data?.data) {
    return { ...DEFAULT_THRESHOLDS, isLoading };
  }

  const s = data.data;

  return {
    tempMin: s.thresholdTempMin ?? DEFAULT_THRESHOLDS.tempMin,
    tempMax: s.thresholdTempMax ?? DEFAULT_THRESHOLDS.tempMax,
    tempWarning: s.thresholdTempMax
      ? Math.round(s.thresholdTempMax - 5)
      : DEFAULT_THRESHOLDS.tempWarning,
    humMin: s.thresholdHumidityMin ?? DEFAULT_THRESHOLDS.humMin,
    humMax: s.thresholdHumidityMax ?? DEFAULT_THRESHOLDS.humMax,
    refreshInterval: s.monitoringIntervalSeconds ?? DEFAULT_THRESHOLDS.refreshInterval,
    isLoading: false,
  };
}
