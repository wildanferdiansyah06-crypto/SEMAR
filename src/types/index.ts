// Type definitions for the dashboard application

export interface SheetMetric {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  prefix?: string;
  suffix?: string;
}

export interface SheetData {
  metrics: SheetMetric[];
  rows: Record<string, string | number>[];
  headers: string[];
  lastUpdated: string;
}

export interface DashboardConfig {
  lookerEmbedUrl: string;
  sheetsId: string;
  apiKey: string;
  sheetsRange: string;
  refreshInterval: number; // seconds
  reportName: string;
}

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  category: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
  value3?: number;
}
