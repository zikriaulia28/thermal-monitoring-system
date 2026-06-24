import { useSettings } from "./useSettings";
import { DEFAULT_SETTINGS } from "@/types/settings";

export function useThresholds() {
  const { settings, isLoading } = useSettings();

  const tempMin = settings?.thresholdTempMin ?? DEFAULT_SETTINGS.thresholdTempMin;
  const tempMax = settings?.thresholdTempMax ?? DEFAULT_SETTINGS.thresholdTempMax;
  const tempWarning = tempMin + (tempMax - tempMin) * 0.7; // 70% dari range

  const humMin = settings?.thresholdHumidityMin ?? DEFAULT_SETTINGS.thresholdHumidityMin;
  const humMax = settings?.thresholdHumidityMax ?? DEFAULT_SETTINGS.thresholdHumidityMax;

  return {
    tempMin,
    tempMax,
    tempWarning,
    humMin,
    humMax,
    isLoading,
  };
}
