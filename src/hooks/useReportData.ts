import useSWR from 'swr';
import { ReportResponse, ReportType } from '@/types/reports';

interface ReportParams {
  type: ReportType;
  startDate: string;
  endDate: string;
  deviceId?: string;
  location?: string;
  severity?: string;
  page?: number;
  limit?: number;
}

const reportFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
};

export function useReportData(params: ReportParams) {
  const queryString = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    ...(params.deviceId && { deviceId: params.deviceId }),
    ...(params.location && { location: params.location }),
    ...(params.severity && { severity: params.severity }),
    ...(params.page && { page: params.page.toString() }),
    ...(params.limit && { limit: params.limit.toString() }),
  }).toString();

  const url = getReportEndpoint(params.type, queryString);

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: any[]; summary: any }>(
    url,
    reportFetcher,
    { revalidateOnFocus: false }
  );

  return {
    data: data?.data || [],
    summary: data?.summary,
    isLoading,
    error,
    mutate,
  };
}

function getReportEndpoint(type: ReportType, queryString: string): string {
  const baseUrl = `/api/reports`;

  switch (type) {
    case 'summary':
      return `${baseUrl}/summary?${queryString}`;
    case 'detailed':
      return `${baseUrl}/logs?${queryString}`;
    case 'alerts':
      return `${baseUrl}/alerts?${queryString}`;
    default:
      return `${baseUrl}/summary?${queryString}`;
  }
}
