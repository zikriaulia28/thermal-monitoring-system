import z from 'zod';
import { DEFAULT_SETTINGS } from '@/types/settings';

export const settingsSchema = z.object({
  thresholdTempMin: z.number().min(0).max(60),
  thresholdTempMax: z.number().min(0).max(60),
  thresholdHumidityMin: z.number().min(0).max(100),
  thresholdHumidityMax: z.number().min(0).max(100),
  dataRetentionDays: z.number().min(7).max(365),
  monitoringIntervalSeconds: z.number().min(5).max(3600),
}).refine(
  (data) => data.thresholdTempMin < data.thresholdTempMax,
  {
    message: 'Min temperature harus lebih kecil dari Max temperature',
    path: ['thresholdTempMin']
  }
).refine(
  (data) => data.thresholdHumidityMin < data.thresholdHumidityMax,
  {
    message: 'Min humidity harus lebih kecil dari Max humidity',
    path: ['thresholdHumidityMin']
  }
);

export function validateSettings(data: unknown) {
  return settingsSchema.safeParse(data);
}

export function getDefaultSettings() {
  return DEFAULT_SETTINGS;
}
