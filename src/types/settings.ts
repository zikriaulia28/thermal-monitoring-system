export interface Settings {
  id: string;
  thresholdTempMin: number;
  thresholdTempMax: number;
  thresholdHumidityMin: number;
  thresholdHumidityMax: number;
  dataRetentionDays: number;
  monitoringIntervalSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'> = {
  thresholdTempMin: 15,
  thresholdTempMax: 35,
  thresholdHumidityMin: 30,
  thresholdHumidityMax: 70,
  dataRetentionDays: 90,
  monitoringIntervalSeconds: 5,
};
