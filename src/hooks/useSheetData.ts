'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchSheetData, getConfig, getMockData } from '@/lib/sheets';
import { SheetData } from '@/types';

interface UseSheetDataOptions {
  enabled?: boolean;
}

export function useSheetData(options: UseSheetDataOptions = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState<SheetData>(getMockData());
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = async (silent = false) => {
    const config = getConfig();
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const result = await fetchSheetData(
        config.sheetsId,
        config.sheetsRange,
        config.apiKey
      );
      setData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengambil data';
      setError(msg);
      // Keep last known data on error
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const startCountdown = (interval: number) => {
    setCountdown(interval);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return interval;
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (!enabled) return;

    const config = getConfig();
    const interval = config.refreshInterval || 30;

    // Initial fetch
    fetchData(false);

    // Setup polling
    intervalRef.current = setInterval(() => {
      fetchData(true);
    }, interval * 1000);

    startCountdown(interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const refetch = () => {
    fetchData(false);
    const config = getConfig();
    startCountdown(config.refreshInterval || 30);
  };

  return { data, isLoading, isRefreshing, error, countdown, refetch };
}
