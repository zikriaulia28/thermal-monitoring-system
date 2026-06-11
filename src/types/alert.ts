export interface Alert {
  id: string;
  deviceId: string;
  location: string;
  type: string;
  message: string;
  severity: "WARNING" | "CRITICAL";
  createdAt: string;
  acknowledged: boolean;
}
