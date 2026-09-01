'use client';

import { useState } from 'react';
import {
  Bike,
  Star,
  Clock,
  Award,
  DollarSign,
  MapPin,
  Search,
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
import DriverDetailModal from '@/components/DriverDetailModal';
import { INITIAL_DRIVERS, formatIDR } from '@/lib/jastipData';
import { DriverPerformance } from '@/types/jastip';

const CustomTooltipStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.8rem',
  padding: '10px 14px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
};

interface SpeedPayloadItem {
  name: string;
  value: number;
  color: string;
}

function SpeedTooltip({ active, payload, label }: { active?: boolean; payload?: SpeedPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={CustomTooltipStyle}>
      <div style={{ marginBottom: 6, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.75rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span>{p.name}: <strong>{p.value} Menit</strong></span>
        </div>
      ))}
    </div>
  );
}

export default function DriversPage() {
  const [drivers] = useState<DriverPerformance[]>(INITIAL_DRIVERS);
  const [selectedDriver, setSelectedDriver] = useState<DriverPerformance | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'speed' | 'orders'>('rating');
  const [searchQuery, setSearchQuery] = useState('');

  const sortedDrivers = [...drivers]
    .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.currentLocation.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'speed') return a.avgShoppingSpeedMins - b.avgShoppingSpeedMins;
      return b.ordersCompletedToday - a.ordersCompletedToday;
    });

  const chartData = drivers.map((d) => ({
    name: d.name.split(' ')[0],
    shoppingSpeed: d.avgShoppingSpeedMins,
    deliverySpeed: d.avgDeliverySpeedMins,
  }));

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Bike size={20} style={{ color: 'var(--accent-secondary)' }} />
            <h1 className="page-title">Performa Personal Shopper & Driver</h1>
          </div>
          <p className="page-subtitle">
            Analisis kecepatan mencari barang di toko, durasi pengantaran, rating kepuasan pelanggan, dan komisi
          </p>
        </div>
      </div>

      <div className="page-wrapper">
        {/* Metric Cards Grid */}
        <div className="metric-grid section-gap">
          <MetricCard
            metric={{
              label: 'Shopper & Driver Siaga',
              value: '6 / 8',
              delta: 12.5,
              deltaLabel: 'keaktifan',
              subtext: '6 di lapangan belanja/antar',
            }}
            icon={<Bike size={18} />}
            color="#06b6d4"
          />

          <MetricCard
            metric={{
              label: 'Rata-rata Waktu Belanja',
              value: '33.6',
              suffix: ' mnt',
              delta: -8.4,
              deltaLabel: 'lebih cepat',
              subtext: 'Target SLA < 45 menit',
            }}
            icon={<Clock size={18} />}
            color="#6366f1"
          />

          <MetricCard
            metric={{
              label: 'On-Time Delivery Rate',
              value: '96.8%',
              delta: 3.2,
              deltaLabel: 'performa',
              subtext: 'Tepat waktu sampai tujuan',
            }}
            icon={<Award size={18} />}
            color="#10b981"
          />

          <MetricCard
            metric={{
              label: 'Total Komisi Driver Hari Ini',
              value: 'Rp 1,07 Jt',
              delta: 15.0,
              deltaLabel: 'dibagikan',
              subtext: 'Dari 49 trip pengiriman',
            }}
            icon={<DollarSign size={18} />}
            color="#f59e0b"
          />
        </div>

        {/* Speed Comparison Chart */}
        <div className="card chart-container section-gap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="chart-title">Komparasi Efisiensi Waktu Per Driver (Menit)</div>
              <div className="chart-subtitle">Perbandingan durasi mencari barang di toko vs durasi pengantaran ke rumah customer</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6366f1' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} /> Waktu Belanja di Toko
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#06b6d4' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} /> Waktu Antar Trip
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit=" m"
              />
              <Tooltip content={<SpeedTooltip />} />
              <Bar dataKey="shoppingSpeed" name="Waktu Belanja" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="deliverySpeed" name="Waktu Antar" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Filter & Sort */}
        <div className="filter-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="filter-input"
              placeholder="Cari driver atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: 36 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="filter-label">Urutkan:</span>
            <div className="erp-tabs" style={{ marginBottom: 0 }}>
              <button
                className={`erp-tab-btn ${sortBy === 'rating' ? 'active' : ''}`}
                onClick={() => setSortBy('rating')}
              >
                Rating Tertinggi
              </button>
              <button
                className={`erp-tab-btn ${sortBy === 'speed' ? 'active' : ''}`}
                onClick={() => setSortBy('speed')}
              >
                Belanja Tercepat
              </button>
              <button
                className={`erp-tab-btn ${sortBy === 'orders' ? 'active' : ''}`}
                onClick={() => setSortBy('orders')}
              >
                Order Terbanyak
              </button>
            </div>
          </div>
        </div>

        {/* Drivers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {sortedDrivers.map((driver) => (
            <div
              key={driver.id}
              className="card"
              style={{ padding: 20, cursor: 'pointer' }}
              onClick={() => setSelectedDriver(driver)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={driver.avatar} alt={driver.name} className="driver-avatar" />
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {driver.name}
                    </h3>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {driver.vehicle} • {driver.licensePlate}
                    </div>
                  </div>
                </div>

                <span className={`badge-status badge-${driver.status === 'off' ? 'issue' : driver.status === 'standby' ? 'pending' : driver.status === 'shopping' ? 'shopping' : 'delivering'}`}>
                  {driver.status === 'shopping' ? '🛒 Belanja' : driver.status === 'delivering' ? '🛵 Mengantar' : driver.status === 'standby' ? '⚡ Standby' : 'Istirahat'}
                </span>
              </div>

              {/* Location */}
              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--text-secondary)',
                  marginBottom: 14,
                }}
              >
                <MapPin size={13} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {driver.currentLocation}
                </span>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', marginBottom: 14 }}>
                <div style={{ background: 'var(--bg-glass)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Rating CSAT</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f59e0b', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <Star size={11} fill="#f59e0b" color="#f59e0b" /> {driver.rating.toFixed(2)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-glass)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Speed Belanja</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-primary-light)', marginTop: 2 }}>
                    {driver.avgShoppingSpeedMins} mnt
                  </div>
                </div>

                <div style={{ background: 'var(--bg-glass)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>On-Time Rate</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-success)', marginTop: 2 }}>
                    {driver.onTimeDeliveryRate}%
                  </div>
                </div>
              </div>

              {/* Bottom Financial & Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Komisi Hari Ini: </span>
                  <strong style={{ color: 'var(--accent-success)' }}>{formatIDR(driver.todayCommission)}</strong>
                </div>

                <span style={{ color: 'var(--accent-primary-light)', fontWeight: 600 }}>
                  Lihat Profil Detail →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Detail Modal */}
      <DriverDetailModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
    </div>
  );
}
