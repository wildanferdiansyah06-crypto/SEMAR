'use client';

import { useState, useEffect, useCallback } from 'react';
import { JastipOrder } from '@/types/jastip';
import { fetchLiveJastipSheetData } from '@/lib/sheets';
import { INITIAL_ORDERS } from '@/lib/jastipData';

export function useJastipLive() {
  const [orders, setOrders] = useState<JastipOrder[]>(INITIAL_ORDERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [error, setError] = useState<string | null>(null);

  const sheetsId = process.env.NEXT_PUBLIC_SHEETS_ID || '';

  const loadData = useCallback(async (showRefreshing = true) => {
    if (!sheetsId) return;
    if (showRefreshing) setIsRefreshing(true);
    try {
      const data = await fetchLiveJastipSheetData(sheetsId);
      if (data && data.length > 0) {
        setOrders(data);
        setLastUpdated(new Date().toISOString());
        setError(null);
      }
    } catch (err: any) {
      console.warn('Sheets fetch error:', err);
      setError(err?.message || 'Gagal menyinkronkan data Google Sheets');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [sheetsId]);

  useEffect(() => {
    loadData(false);
    const intervalSeconds = Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL) || 30;
    const timer = setInterval(() => {
      loadData(true);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [loadData]);

  return {
    orders,
    isLoading,
    isRefreshing,
    lastUpdated,
    error,
    refetch: () => loadData(true),
  };
}
