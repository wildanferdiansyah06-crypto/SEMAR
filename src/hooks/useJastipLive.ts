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
  const apiKey = process.env.NEXT_PUBLIC_SHEETS_API_KEY || '';

  const loadData = useCallback(async (showRefreshing = true) => {
    if (!sheetsId) return;
    if (showRefreshing) setIsRefreshing(true);
    try {
      const data = await fetchLiveJastipSheetData(sheetsId, apiKey);
      if (data && data.length > 0) {
        setOrders(data);
        setLastUpdated(new Date().toISOString());
        setError(null);
      }
    } catch (err: unknown) {
      console.warn('Sheets fetch error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menyinkronkan data Google Sheets';
      setError(msg);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [sheetsId, apiKey]);

  useEffect(() => {
    let active = true;
    if (sheetsId) {
      fetchLiveJastipSheetData(sheetsId, apiKey)
        .then((data) => {
          if (active && data && data.length > 0) {
            setOrders(data);
            setLastUpdated(new Date().toISOString());
            setError(null);
          }
        })
        .catch((err: unknown) => {
          if (active) {
            console.warn('Sheets fetch error:', err);
            const msg = err instanceof Error ? err.message : 'Gagal menyinkronkan data Google Sheets';
            setError(msg);
          }
        });
    }

    const intervalSeconds = Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL) || 30;
    const timer = setInterval(() => {
      loadData(true);
    }, intervalSeconds * 1000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [sheetsId, apiKey, loadData]);

  return {
    orders,
    isLoading,
    isRefreshing,
    lastUpdated,
    error,
    refetch: () => loadData(true),
  };
}
