import { DashboardConfig, SheetData } from '@/types';

const DEFAULT_CONFIG: DashboardConfig = {
  lookerEmbedUrl: '',
  sheetsId: '',
  apiKey: '',
  sheetsRange: 'Sheet1!A1:Z100',
  refreshInterval: 30,
  reportName: 'My Dashboard',
};

// ─── Config helpers (localStorage) ────────────────────────────
export function getConfig(): DashboardConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const stored = localStorage.getItem('dashboard_config');
    if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_CONFIG;
}

export function saveConfig(config: Partial<DashboardConfig>): void {
  if (typeof window === 'undefined') return;
  const current = getConfig();
  localStorage.setItem('dashboard_config', JSON.stringify({ ...current, ...config }));
}

// ─── Google Sheets API ─────────────────────────────────────────
export async function fetchSheetData(
  sheetsId: string,
  range: string,
  apiKey: string
): Promise<SheetData> {
  if (!sheetsId || !apiKey) {
    return getMockData();
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Sheets API error: ${res.status}`);
  }

  const data = await res.json();
  return parseSheetResponse(data);
}

function parseSheetResponse(data: { values?: string[][] }): SheetData {
  const values = data.values || [];
  if (values.length === 0) return getMockData();

  const headers = values[0].map(String);
  const rows = values.slice(1).map((row) => {
    const obj: Record<string, string | number> = {};
    headers.forEach((h, i) => {
      const val = row[i] ?? '';
      obj[h] = isNaN(Number(val)) || val === '' ? val : Number(val);
    });
    return obj;
  });

  // Auto-detect metric rows (first 4 numeric columns)
  const metrics = headers.slice(0, 4).map((label, i) => {
    const colVals = rows.map((r) => Number(r[label]) || 0).filter(Boolean);
    const latest = colVals[colVals.length - 1] ?? 0;
    const prev = colVals[colVals.length - 2] ?? latest;
    const delta = prev !== 0 ? ((latest - prev) / prev) * 100 : 0;
    return {
      label,
      value: latest,
      delta: parseFloat(delta.toFixed(1)),
      deltaLabel: 'vs sebelumnya',
    };
  });

  return {
    metrics,
    rows,
    headers,
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Mock / Demo Data ──────────────────────────────────────────
export function getMockData(): SheetData {
  return {
    metrics: [
      { label: 'Total Penjualan', value: 'Rp 128,5 Jt', delta: 12.4, deltaLabel: 'vs bulan lalu', prefix: '' },
      { label: 'Transaksi', value: 3_847, delta: 8.1, deltaLabel: 'vs bulan lalu' },
      { label: 'Pelanggan Baru', value: 1_203, delta: -3.2, deltaLabel: 'vs bulan lalu' },
      { label: 'Rata-rata Order', value: 'Rp 334 K', delta: 5.7, deltaLabel: 'vs bulan lalu' },
    ],
    rows: [
      { Tanggal: '2024-01', Penjualan: 95000000, Transaksi: 2840, Pelanggan: 980 },
      { Tanggal: '2024-02', Penjualan: 102000000, Transaksi: 3100, Pelanggan: 1050 },
      { Tanggal: '2024-03', Penjualan: 118000000, Transaksi: 3350, Pelanggan: 1150 },
      { Tanggal: '2024-04', Penjualan: 111000000, Transaksi: 3200, Pelanggan: 1100 },
      { Tanggal: '2024-05', Penjualan: 125000000, Transaksi: 3600, Pelanggan: 1180 },
      { Tanggal: '2024-06', Penjualan: 128500000, Transaksi: 3847, Pelanggan: 1203 },
    ],
    headers: ['Tanggal', 'Penjualan', 'Transaksi', 'Pelanggan'],
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Looker Studio URL builder ─────────────────────────────────
export function buildLookerUrl(
  baseUrl: string,
  params: {
    dateFrom?: string;
    dateTo?: string;
    [key: string]: string | undefined;
  }
): string {
  if (!baseUrl) return '';
  try {
    const url = new URL(baseUrl);
    // Looker Studio supports params via "params" query string (JSON encoded)
    const lookerParams: Record<string, string> = {};
    if (params.dateFrom) lookerParams['df1'] = `EQ${params.dateFrom.replace(/-/g, '')}`;
    if (params.dateTo) lookerParams['df2'] = `EQ${params.dateTo.replace(/-/g, '')}`;
    // Extra custom params
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== 'dateFrom' && k !== 'dateTo') lookerParams[k] = v;
    });
    if (Object.keys(lookerParams).length > 0) {
      url.searchParams.set('params', JSON.stringify(lookerParams));
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}

// ─── Format helpers ────────────────────────────────────────────
export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatCurrency(n: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
