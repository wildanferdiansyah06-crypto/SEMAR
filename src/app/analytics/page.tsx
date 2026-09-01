'use client';

import {
  Clock,
  Hourglass,
  Store,
  Flame,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import MetricCard from '@/components/MetricCard';
import {
  TIME_SLA_STAGES,
  HOURLY_PATTERNS,
  INITIAL_STORES,
  formatIDR,
} from '@/lib/jastipData';

const CustomTooltipStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.8rem',
  padding: '10px 14px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
};

interface HourlyPayloadItem {
  value: number;
  payload: {
    isPeak: boolean;
    gmv: number;
  };
}

function HourlyTooltip({ active, payload, label }: { active?: boolean; payload?: HourlyPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const isPeak = payload[0].payload.isPeak;
  return (
    <div style={CustomTooltipStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontWeight: 700 }}>
        <span>Pukul {label}</span>
        {isPeak && (
          <span style={{ fontSize: '0.65rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '1px 6px', borderRadius: 4 }}>
            🔥 Jam Sibuk
          </span>
        )}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary-light)' }}>
        Masuk: <strong>{payload[0].value} Pesanan</strong>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
        Est. Belanja: <strong>{formatIDR(payload[0].payload.gmv)}</strong>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Clock size={20} style={{ color: 'var(--accent-secondary)' }} />
            <h1 className="page-title">Analitik Waktu & Efisiensi SLA Jastip</h1>
          </div>
          <p className="page-subtitle">
            Evaluasi kecepatan rantai operasional: verifikasi pesanan, durasi belanja di pasar/mall, packing, hingga waktu tempuh kurir
          </p>
        </div>
      </div>

      <div className="page-wrapper">
        {/* Metric Cards Grid */}
        <div className="metric-grid section-gap">
          <MetricCard
            metric={{
              label: 'Total Waktu Siklus (Cycle Time)',
              value: '1j 47m',
              delta: -12.0,
              deltaLabel: 'lebih efisien',
              subtext: 'Target batas SLA: 2j 30m',
            }}
            icon={<Hourglass size={18} />}
            color="#6366f1"
          />

          <MetricCard
            metric={{
              label: 'Waktu Verifikasi Order',
              value: '7.5',
              suffix: ' mnt',
              delta: -15.2,
              deltaLabel: 'respon cepat',
              subtext: 'Pengecekan instruksi & DP',
            }}
            icon={<Zap size={18} />}
            color="#06b6d4"
          />

          <MetricCard
            metric={{
              label: 'Waktu Belanja di Lokasi',
              value: '36.2',
              suffix: ' mnt',
              delta: -6.5,
              deltaLabel: 'speed belanja',
              subtext: 'Rata-rata 2.8 item / toko',
            }}
            icon={<Store size={18} />}
            color="#10b981"
          />

          <MetricCard
            metric={{
              label: 'Waktu Pengantaran Kurir',
              value: '27.8',
              suffix: ' mnt',
              delta: -4.1,
              deltaLabel: 'waktu tempuh',
              subtext: 'Kecepatan motor & rute optimal',
            }}
            icon={<Clock size={18} />}
            color="#f59e0b"
          />
        </div>

        {/* SLA Breakdown Funnel Cards */}
        <div className="section-gap">
          <div className="chart-title" style={{ marginBottom: 4 }}>
            Breakdown Target vs Waktu Aktual Tiap Tahap
          </div>
          <div className="chart-subtitle" style={{ marginBottom: 16 }}>
            Setiap tahap diawasi dengan toleransi deviasi otomatis untuk mencegah keterlambatan
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {TIME_SLA_STAGES.map((stage, idx) => {
              const percentOfTarget = Math.round((stage.actualMins / stage.targetMins) * 100);
              return (
                <div key={idx} className="sla-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {stage.stage}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>
                      Optimal
                    </span>
                  </div>

                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', minHeight: 32, marginBottom: 10 }}>
                    {stage.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Aktual: <strong style={{ color: 'var(--accent-primary-light)' }}>{stage.actualMins} mnt</strong>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Target: <strong>{stage.targetMins} mnt</strong>
                    </span>
                  </div>

                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(percentOfTarget, 100)}%`,
                        background: percentOfTarget < 85 ? 'var(--accent-success)' : 'var(--accent-warning)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Peak Hours Heatmap Chart */}
        <div className="card chart-container section-gap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="chart-title">Pola Waktu Jam Sibuk Masuknya Pesanan (07:00 - 20:00)</div>
              <div className="chart-subtitle">Distribusi jam masuk order untuk pengaturan penugasan shift driver & shopper</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#ef4444' }}>
              <Flame size={14} /> Peak: 09:00 - 11:00 & 15:00 - 17:00
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={HOURLY_PATTERNS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit=" ord" />
              <Tooltip content={<HourlyTooltip />} />
              <Bar
                dataKey="ordersCount"
                name="Jumlah Pesanan"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Store Shopping Efficiency & Fulfillment Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="chart-title">Efisiensi Belanja & Tingkat Keberhasilan Stok per Toko / Pasar</div>
            <div className="chart-subtitle" style={{ marginBottom: 0 }}>
              Evaluasi waktu yang dihabiskan shopper dan ketersediaan stok barang titipan
            </div>
          </div>

          <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Pasar / Toko</th>
                  <th>Kategori Barang</th>
                  <th>Lokasi</th>
                  <th>Total Pesanan Dititip</th>
                  <th>Rata-rata Waktu Belanja</th>
                  <th>Tingkat Sukses Stok (Fulfillment)</th>
                  <th>Barang Terpopuler</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_STORES.map((store) => (
                  <tr key={store.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{store.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-primary">{store.category}</span>
                    </td>
                    <td>{store.location}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{store.totalOrders} Titipan</td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                        {store.avgShoppingMins} Menit
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, color: 'var(--accent-success)' }}>
                          {store.fulfillmentRate}%
                        </span>
                        <div className="progress-bar-container" style={{ width: 60, height: 4, margin: 0 }}>
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${store.fulfillmentRate}%`, background: 'var(--accent-success)' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {store.popularItems.slice(0, 2).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
