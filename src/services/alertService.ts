import { Alert } from "@/types/alert";

export interface AlertFilters {
  search?: string;
  severity?: string;
  status?: string;
}

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

export async function getAlerts(
  page = 1,
  limit = 10,
  filters?: AlertFilters,
): Promise<AlertsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (filters?.search) {
    params.set("search", filters.search);
  }
  if (filters?.severity) {
    params.set("severity", filters.severity);
  }
  if (filters?.status) {
    params.set("status", filters.status);
  }

  const response = await fetch(`/api/dashboard/alerts?${params.toString()}`, {
    cache: "force-cache",
    next: { revalidate: 30 },
  });

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
