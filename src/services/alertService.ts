import { Alert } from "@/types/alert";

export interface AlertsResponse {
  data: Alert[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    total: number;
    active: number;
    ack: number;
    critical: number;
  };
}

export async function getAlerts(page = 1, limit = 10): Promise<AlertsResponse> {
  const response = await fetch(
    `/api/dashboard/alerts?page=${page}&limit=${limit}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch alerts");
  }

  return response.json();
}

export async function acknowledgeAlert(id: string): Promise<void> {
  const response = await fetch("/api/dashboard/alerts", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error("Failed to acknowledge alert");
  }
}
