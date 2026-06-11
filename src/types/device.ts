export interface SensorReading {
  time: string;
  temperature: number;
  humidity: number;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline";
  lastSeen: string | null;
  readings: SensorReading[];
}
