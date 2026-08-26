'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import {
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Settings as SettingsIcon,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import MetricCard from '@/components/MetricCard';
import LookerEmbed from '@/components/LookerEmbed';
import FilterBar from '@/components/FilterBar';
import RefreshIndicator from '@/components/RefreshIndicator';
import { useSheetData } from '@/hooks/useSheetData';
import { getConfig } from '@/lib/sheets';
import { FilterState } from '@/types';

const METRIC_ICONS = [
  <DollarSign key="dollar" size={16} />,
  <ShoppingCart key="cart" size={16} />,
  <Users key="users" size={16} />,
  <TrendingUp key="trend" size={16} />,
];

const METRIC_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'];

const DEFAULT_FILTERS: FilterState = {
  dateFrom: (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  })(),
  dateTo: new Date().toISOString().split('T')[0],
  category: '',
};

export default function DashboardPage() {
  const { data, isLoading, isRefreshing, error, countdown, refetch } = useSheetData();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const config = getConfig();

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <LayoutDashboard size={20} style={{ color: 'var(--accent-primary-light)' }} />
            <h1 className="page-title">Dashboard</h1>
          </div>
          <p className="page-subtitle">
            {config.reportName || 'DataVision'} — data realtime dari Google Sheets
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <RefreshIndicator
            isRefreshing={isRefreshing}
            countdown={countdown}
            lastUpdated={data.lastUpdated}
            error={error}
            onRefresh={refetch}
          />
          <Link href="/settings" className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            <SettingsIcon size={14} />
            Pengaturan
          </Link>
        </div>
      </div>

      <div className="page-wrapper">
        {/* Error banner */}
        {error && (
          <div
            className="slide-up"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '14px 18px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
            }}
          >
            <AlertCircle size={16} style={{ color: 'var(--accent-danger)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--accent-danger)', marginBottom: 2 }}>
                Gagal memuat data dari Google Sheets
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {error} — Menampilkan data demo. Cek{' '}
                <Link href="/settings" style={{ color: 'var(--accent-primary-light)' }}>
                  Pengaturan
                </Link>{' '}
                untuk konfigurasi API Key dan Sheets ID.
              </div>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="metric-grid section-gap slide-up">
          {(isLoading ? Array(4).fill(null) : data.metrics).map((metric, i) => (
            <MetricCard
              key={i}
              metric={metric ?? { label: '', value: 0 }}
              icon={METRIC_ICONS[i % METRIC_ICONS.length]}
              color={METRIC_COLORS[i % METRIC_COLORS.length]}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          categories={['Produk A', 'Produk B', 'Produk C', 'Layanan']}
        />

        {/* Looker Studio Embed */}
        <div className="slide-up">
          <LookerEmbed
            url={config.lookerEmbedUrl}
            filters={filters}
            height={640}
            title={config.reportName || 'Looker Studio Report'}
          />
        </div>

        {/* Footer note */}
        <div
          style={{
            marginTop: 20,
            padding: '12px 16px',
            background: 'var(--bg-glass)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <AlertCircle size={12} />
          Looker Studio refresh otomatis setiap ~15 menit. Metric cards diperbarui setiap{' '}
          {config.refreshInterval || 30} detik via Google Sheets API.
        </div>
      </div>
    </div>
  );
}
