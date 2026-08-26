'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { BarChart3, ArrowUpDown, Search } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import RefreshIndicator from '@/components/RefreshIndicator';
import { useSheetData } from '@/hooks/useSheetData';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const CustomTooltipStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.8rem',
  padding: '10px 14px',
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={CustomTooltipStyle}>
      <div style={{ marginBottom: 6, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span>{p.name}: <strong>{Number(p.value).toLocaleString('id-ID')}</strong></span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading, isRefreshing, countdown, error, refetch } = useSheetData();
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

  const chartData = useMemo(() => {
    return data.rows.slice(0, 12).map((row) => {
      const obj: Record<string, string | number> = {};
      data.headers.forEach((h) => { obj[h] = row[h]; });
      return obj;
    });
  }, [data]);

  const pieData = useMemo(() => {
    const numericCol = data.headers.find((h) => typeof data.rows[0]?.[h] === 'number');
    if (!numericCol) return [];
    return data.rows.slice(0, 5).map((row, i) => ({
      name: String(row[data.headers[0]] ?? `Item ${i + 1}`),
      value: Number(row[numericCol]) || 0,
    }));
  }, [data]);

  const filteredRows = useMemo(() => {
    let rows = [...data.rows];
    if (search) {
      rows = rows.filter((row) =>
        Object.values(row).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av;
        }
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [data.rows, search, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const numericHeaders = data.headers.filter((h) => typeof data.rows[0]?.[h] === 'number');
  const firstHeader = data.headers[0] || 'Name';

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <BarChart3 size={20} style={{ color: 'var(--accent-secondary)' }} />
            <h1 className="page-title">Analitik</h1>
          </div>
          <p className="page-subtitle">Visualisasi chart langsung dari Google Sheets</p>
        </div>
        <RefreshIndicator
          isRefreshing={isRefreshing}
          countdown={countdown}
          lastUpdated={data.lastUpdated}
          error={error}
          onRefresh={refetch}
        />
      </div>

      <div className="page-wrapper">
        {/* Metric summary */}
        <div className="metric-grid section-gap">
          {data.metrics.slice(0, 4).map((m, i) => (
            <MetricCard key={i} metric={m} isLoading={isLoading} color={COLORS[i]} />
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Area chart */}
          <div className="card chart-container">
            <div className="chart-title">Tren Data</div>
            <div className="chart-subtitle">Dari Google Sheets — {numericHeaders[0] || 'Nilai'}</div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={firstHeader} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {numericHeaders.slice(0, 2).map((h, i) => (
                  <Area
                    key={h}
                    type="monotone"
                    dataKey={h}
                    stroke={COLORS[i]}
                    fill={`url(#grad${i + 1})`}
                    strokeWidth={2}
                    dot={{ fill: COLORS[i], r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="card chart-container">
            <div className="chart-title">Perbandingan</div>
            <div className="chart-subtitle">Distribusi per periode</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey={firstHeader} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {numericHeaders.slice(0, 3).map((h, i) => (
                  <Bar key={h} dataKey={h} fill={COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie + Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, marginBottom: 24 }}>
          {/* Pie */}
          <div className="card chart-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="chart-title" style={{ alignSelf: 'flex-start' }}>Distribusi</div>
            <div className="chart-subtitle" style={{ alignSelf: 'flex-start' }}>Top 5 data</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              {pieData.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{item.name}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.value.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div className="chart-title">Tabel Data</div>
                <div className="chart-subtitle" style={{ marginBottom: 0 }}>
                  {filteredRows.length} baris dari Google Sheets
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="filter-input"
                  placeholder="Cari data..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: 32, width: 180 }}
                />
              </div>
            </div>
            <div className="data-table-wrapper" style={{ borderRadius: 0, border: 'none', maxHeight: 300, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {data.headers.map((h) => (
                      <th key={h} onClick={() => handleSort(h)}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {h}
                          <ArrowUpDown size={10} style={{ opacity: sortKey === h ? 1 : 0.3 }} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => (
                    <tr key={i}>
                      {data.headers.map((h) => (
                        <td key={h}>
                          {typeof row[h] === 'number'
                            ? Number(row[h]).toLocaleString('id-ID')
                            : String(row[h])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
