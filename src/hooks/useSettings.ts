import useSWR from 'swr';
import { Settings } from '@/types/settings';

const settingsFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
};

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Settings }>(
    '/api/settings',
    settingsFetcher,
    { revalidateOnFocus: false }
  );

  return {
    settings: data?.data,
    isLoading,
    error,
    mutate,
  };
}

export function useUpdateSettings() {
  const { mutate } = useSettings();

  const updateSettings = async (updates: Partial<Settings>) => {
    try {
      const response = await fetch('/api/settings/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.fieldErrors || 'Failed to update settings');
      }

      const result = await response.json();
      mutate({ success: true, data: result.data });
      return result;
    } catch (error) {
      throw error;
    }
  };

  return { updateSettings };
}
