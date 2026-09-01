'use client';

import { useState } from 'react';
import {
  Users,
  Star,
  ShoppingBag,
  TrendingUp,
  Search,
  Phone,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import MetricCard from '@/components/MetricCard';
import { INITIAL_CUSTOMERS, formatIDR } from '@/lib/jastipData';
import { CustomerProfile } from '@/types/jastip';

const DISTRICT_DATA = [
  { district: 'Jakarta Selatan', orders: 148, gmv: 48500000 },
  { district: 'Tangerang Selatan / BSD', orders: 92, gmv: 34200000 },
  { district: 'Jakarta Pusat (Menteng)', orders: 86, gmv: 29800000 },
  { district: 'Bandung & Sekitarnya', orders: 74, gmv: 24100000 },
  { district: 'Jakarta Barat (Puri)', orders: 62, gmv: 19500000 },
  { district: 'Jakarta Timur', orders: 45, gmv: 14200000 },
];

const PAYMENT_METHODS = [
  { name: 'QRIS Realtime', value: 58, color: '#6366f1' },
  { name: 'Transfer Bank (BCA/Mandiri)', value: 32, color: '#06b6d4' },
  { name: 'COD Talangan Driver', value: 10, color: '#f59e0b' },
];

const CustomTooltipStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.8rem',
  padding: '10px 14px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
};

interface DistrictPayloadItem {
  value: number;
  payload: {
    district: string;
    orders: number;
    gmv: number;
  };
}

function DistrictTooltip({ active, payload, label }: { active?: boolean; payload?: DistrictPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={CustomTooltipStyle}>
      <div style={{ marginBottom: 4, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>
        Total Titipan: <strong>{payload[0].value} Pesanan</strong>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary-light)', marginTop: 2 }}>
        Total Belanja: <strong>{formatIDR(payload[0].payload.gmv)}</strong>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);

    const matchTier = tierFilter === 'all' || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Users size={20} style={{ color: 'var(--accent-primary-light)' }} />
            <h1 className="page-title">Pelanggan & CRM Jastip UMKM</h1>
          </div>
          <p className="page-subtitle">
            Analisis preferensi belanja pelanggan, loyalitas repeat order, klaster wilayah pengantaran, dan kepuasan layanan
          </p>
        </div>
      </div>

      <div className="page-wrapper">
        {/* Metric Cards Grid */}
        <div className="metric-grid section-gap">
          <MetricCard
            metric={{
              label: 'Total Pelanggan Aktif',
              value: '1.240',
              delta: 8.5,
              deltaLabel: 'pertumbuhan',
              subtext: '34 pelanggan baru minggu ini',
            }}
            icon={<Users size={18} />}
            color="#6366f1"
          />

          <MetricCard
            metric={{
              label: 'Tingkat Repeat Order',
              value: '68.4%',
              delta: 4.2,
              deltaLabel: 'loyalitas',
              subtext: 'Memesan ulang > 2x / bulan',
            }}
            icon={<TrendingUp size={18} />}
            color="#10b981"
          />

          <MetricCard
            metric={{
              label: 'Rata-rata Belanja / Pelanggan',
              value: 'Rp 485 Rb',
              delta: 6.8,
              deltaLabel: 'basket size',
              subtext: 'Per transaksi titipan',
            }}
            icon={<ShoppingBag size={18} />}
            color="#06b6d4"
          />

          <MetricCard
            metric={{
              label: 'Kepuasan Layanan (CSAT)',
              value: '4.92 / 5.0',
              delta: 0.8,
              deltaLabel: 'rating',
              subtext: 'Berdasarkan 940 ulasan',
            }}
            icon={<Star size={18} />}
            color="#f59e0b"
          />
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* District Distribution Bar Chart */}
          <div className="card chart-container">
            <div className="chart-title">Sebaran Wilayah Tujuan Pengantaran Titipan</div>
            <div className="chart-subtitle">Konsentrasi pesanan pelanggan terbanyak berdasarkan area</div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={DISTRICT_DATA} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="district" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip content={<DistrictTooltip />} />
                <Bar dataKey="orders" name="Jumlah Order" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="card chart-container" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="chart-title">Metode Pembayaran Pilihan</div>
            <div className="chart-subtitle">Preferensi pelunasan belanja & talangan</div>

            <div style={{ flex: 1, minHeight: 160 }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={PAYMENT_METHODS}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {PAYMENT_METHODS.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {PAYMENT_METHODS.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top VIP Spenders Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div className="chart-title">Daftar Pelanggan VIP & Top Spender</div>
              <div className="chart-subtitle" style={{ marginBottom: 0 }}>
                Pelanggan dengan frekuensi dan total belanja titipan tertinggi
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative', width: 220 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Cari nama / nomor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: 32 }}
                />
              </div>

              <select
                className="filter-select"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
              >
                <option value="all">Semua Tier</option>
                <option value="VIP">VIP</option>
                <option value="Regular">Regular</option>
                <option value="New">Baru</option>
              </select>
            </div>
          </div>

          <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pelanggan</th>
                  <th>Tier</th>
                  <th>Wilayah Pengantaran</th>
                  <th>Total Transaksi</th>
                  <th>Total Belanja</th>
                  <th>Toko Favorit</th>
                  <th>Rating CSAT</th>
                  <th>Kontak</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customer.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${customer.tier === 'VIP' ? 'badge-primary' : customer.tier === 'Regular' ? 'badge-success' : 'badge-warning'}`}>
                        {customer.tier === 'VIP' ? '👑 VIP' : customer.tier}
                      </span>
                    </td>
                    <td>{customer.district}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customer.totalOrders}x Order</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary-light)' }}>{formatIDR(customer.totalSpent)}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {customer.favoriteStores.join(', ')}
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 600 }}>
                        <Star size={12} fill="#f59e0b" color="#f59e0b" /> {customer.csatRating.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                      >
                        <Phone size={12} /> WhatsApp
                      </a>
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
