'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Clock,
  Bike,
  Store,
  Users,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Eye,
  Star,
  MapPin,
  Flame,
  RefreshCw,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
import OrderDetailModal from '@/components/OrderDetailModal';
import DriverDetailModal from '@/components/DriverDetailModal';
import { useJastipLive } from '@/hooks/useJastipLive';
import {
  INITIAL_DRIVERS,
  INITIAL_STORES,
  DAILY_TREND_DATA,
  CATEGORY_DISTRIBUTION,
  getFinancialOverview,
  formatIDR,
  formatCompactIDR,
} from '@/lib/jastipData';
import { JastipOrder, DriverPerformance } from '@/types/jastip';

const CustomTooltipStyle = {
  background: 'rgba(11, 16, 29, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '10px',
  color: '#f8fafc',
  fontSize: '0.8rem',
  padding: '10px 14px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
  backdropFilter: 'blur(12px)',
};

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={CustomTooltipStyle}>
      <div style={{ marginBottom: 6, fontWeight: 700, color: '#ffffff' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.75rem', marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span>{p.name}: <strong style={{ color: '#ffffff' }}>{formatIDR(Number(p.value))}</strong></span>
        </div>
      ))}
    </div>
  );
}

function CategoryTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div style={CustomTooltipStyle}>
      <div style={{ fontWeight: 700, color: data.color }}>{data.name}</div>
      <div style={{ fontSize: '0.75rem', marginTop: 4, color: '#e2e8f0' }}>
        Pangsa Permintaan: <strong>{data.value}%</strong>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
        Total Belanja: <strong style={{ color: '#ffffff' }}>{formatIDR(data.revenue)}</strong>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { orders: liveOrders, isRefreshing, refetch, lastUpdated } = useJastipLive();
  const [selectedOrder, setSelectedOrder] = useState<JastipOrder | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DriverPerformance | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');

  const finance = getFinancialOverview();
  const orders = liveOrders && liveOrders.length > 0 ? liveOrders : [];
  const drivers = INITIAL_DRIVERS;
  const stores = INITIAL_STORES;

  // Status counts
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const shoppingCount = orders.filter((o) => o.status === 'shopping').length;
  const deliveringCount = orders.filter((o) => o.status === 'delivering').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const issueCount = orders.filter((o) => o.status === 'issue').length;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <h1 className="page-title">Executive ERP Dashboard Jastip</h1>
            <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>
              <span className="refresh-dot" style={{ width: 5, height: 5 }} /> Live Sync
            </span>
          </div>
          <p className="page-subtitle">
            Monitoring performa belanja personal shopper, durasi pengantaran kurir, dana talangan kas, dan CRM pelanggan
          </p>
        </div>

        {/* Top Actions: Time range & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="erp-tabs" style={{ marginBottom: 0 }}>
            <button
              className={`erp-tab-btn ${timeRange === 'today' ? 'active' : ''}`}
              onClick={() => setTimeRange('today')}
            >
              Hari Ini
            </button>
            <button
              className={`erp-tab-btn ${timeRange === '7days' ? 'active' : ''}`}
              onClick={() => setTimeRange('7days')}
            >
              7 Hari
            </button>
            <button
              className={`erp-tab-btn ${timeRange === '30days' ? 'active' : ''}`}
              onClick={() => setTimeRange('30days')}
            >
              Bulan Ini
            </button>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => refetch()}
            disabled={isRefreshing}
            style={{ padding: '7px 12px', fontSize: '0.775rem' }}
            title="Sinkronkan data Google Sheets"
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-pulse' : ''} />
            {isRefreshing ? 'Sync...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="page-wrapper">
        {/* Metric Cards Grid */}
        <div className="metric-grid section-gap">
          <MetricCard
            metric={{
              label: 'Total Belanja Titipan (GMV)',
              value: formatCompactIDR(timeRange === 'today' ? 42100000 : finance.totalGMV),
              delta: 14.8,
              deltaLabel: 'vs kemarin',
              subtext: 'Modal barang titipan',
            }}
            icon={<ShoppingBag size={17} />}
            color="#6366f1"
          />

          <MetricCard
            metric={{
              label: 'Laba Bersih (Fee Jastip)',
              value: formatCompactIDR(timeRange === 'today' ? 7410000 : finance.totalJastipFee),
              delta: 17.3,
              deltaLabel: 'margin laba',
              subtext: 'Fee jasa titip toko',
            }}
            icon={<DollarSign size={17} />}
            color="#10b981"
          />

          <MetricCard
            metric={{
              label: 'Dana Talangan Berjalan',
              value: formatCompactIDR(finance.activeTalanganCash),
              delta: -5.2,
              deltaLabel: 'uang kas luar',
              subtext: `${finance.unsettledInvoicesCount} invoice pending`,
            }}
            icon={<TrendingUp size={17} />}
            color="#f59e0b"
          />

          <MetricCard
            metric={{
              label: 'Ketepatan Waktu (On-Time SLA)',
              value: '96.8%',
              delta: 2.1,
              deltaLabel: 'kecepatan',
              subtext: 'Rata-rata 1j 47m / order',
            }}
            icon={<Clock size={17} />}
            color="#06b6d4"
          />
        </div>

        {/* Live Operational Status Ribbon */}
        <div
          className="card section-gap"
          style={{
            padding: '16px 20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="refresh-dot" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Status Alur Operasional Pesanan Hari Ini
              </span>
            </div>
            <Link href="/orders" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Buka Semua Pesanan <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #f59e0b' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Menunggu Konfirmasi</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: 2, fontFamily: 'JetBrains Mono' }}>
                {pendingCount} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Order</span>
              </div>
              <div style={{ fontSize: '0.675rem', color: '#f59e0b', marginTop: 2 }}>Verifikasi DP / Kuota</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #06b6d4' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sedang Dibelanjakan</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: 2, fontFamily: 'JetBrains Mono' }}>
                {shoppingCount} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Order</span>
              </div>
              <div style={{ fontSize: '0.675rem', color: '#22d3ee', marginTop: 2 }}>Shopper di Toko / Mall</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #818cf8' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sedang Dikirim</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: 2, fontFamily: 'JetBrains Mono' }}>
                {deliveringCount} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Order</span>
              </div>
              <div style={{ fontSize: '0.675rem', color: '#818cf8', marginTop: 2 }}>Kurir Menuju Customer</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #10b981' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Selesai & Diterima</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: 2, fontFamily: 'JetBrains Mono' }}>
                {deliveredCount} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Order</span>
              </div>
              <div style={{ fontSize: '0.675rem', color: '#34d399', marginTop: 2 }}>Struk Valid & Lunas</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #f43f5e' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Perlu Tindakan</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: 2, fontFamily: 'JetBrains Mono' }}>
                {issueCount} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Order</span>
              </div>
              <div style={{ fontSize: '0.675rem', color: '#fb7185', marginTop: 2 }}>Stok Habis / Beda Harga</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Daily Revenue & GMV Trend */}
          <div className="card chart-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div className="chart-title">Tren Nilai Belanja (GMV) vs Fee Jastip Bersih</div>
                <div className="chart-subtitle">Evaluasi perputaran modal dan margin keuntungan harian UMKM</div>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#818cf8', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} /> GMV Belanja
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#34d399', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Fee Jastip
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={DAILY_TREND_DATA}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip content={<TrendTooltip />} />
                <Area
                  type="monotone"
                  dataKey="gmv"
                  name="Nilai Belanja (GMV)"
                  stroke="#6366f1"
                  fill="url(#gmvGrad)"
                  strokeWidth={2.5}
                  dot={{ fill: '#6366f1', r: 3 }}
                  activeDot={{ r: 6, fill: '#818cf8' }}
                />
                <Area
                  type="monotone"
                  dataKey="jastipFee"
                  name="Fee Jastip Bersih"
                  stroke="#10b981"
                  fill="url(#feeGrad)"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', r: 3 }}
                  activeDot={{ r: 6, fill: '#34d399' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution Donut */}
          <div className="card chart-container" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="chart-title">Distribusi Kategori Barang Jastip</div>
            <div className="chart-subtitle">Pangsa permintaan pasar & belanja UMKM</div>

            <div style={{ flex: 1, minHeight: 160 }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={CATEGORY_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CATEGORY_DISTRIBUTION.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CategoryTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {CATEGORY_DISTRIBUTION.slice(0, 4).map((cat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: cat.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column: Driver Performance Quickboard & Top Stores */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Driver & Personal Shopper Leaderboard */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bike size={18} style={{ color: 'var(--accent-secondary)' }} />
                <div className="chart-title" style={{ marginBottom: 0 }}>Performa Personal Shopper & Driver</div>
              </div>
              <Link href="/drivers" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary-light)' }}>
                Lihat Semua ({drivers.length})
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {drivers.slice(0, 4).map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  className="driver-card"
                  style={{ padding: '12px 14px' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={driver.avatar} alt={driver.name} className="driver-avatar" style={{ width: 40, height: 40 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>
                        {driver.name}
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>
                        ⭐ {driver.rating.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      <span>Speed Belanja: <strong style={{ color: 'var(--accent-primary-light)' }}>{driver.avgShoppingSpeedMins}m</strong></span>
                      <span>•</span>
                      <span>On-Time: <strong style={{ color: 'var(--accent-success)' }}>{driver.onTimeDeliveryRate}%</strong></span>
                      <span>•</span>
                      <span>Selesai: <strong style={{ color: '#ffffff' }}>{driver.ordersCompletedToday} order</strong></span>
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Top Destination Stores & Markets */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Store size={18} style={{ color: 'var(--accent-primary-light)' }} />
                <div className="chart-title" style={{ marginBottom: 0 }}>Pasar & Toko Terpopuler</div>
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Tingkat Keberhasilan Stok</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stores.slice(0, 4).map((store) => (
                <div
                  key={store.id}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ffffff' }}>
                      {store.name}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                      {store.fulfillmentRate}% Sukses
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    <span>{store.category} • {store.location}</span>
                    <span style={{ color: 'var(--accent-primary-light)', fontWeight: 600 }}>{store.totalOrders} Titipan</span>
                  </div>
                  <div className="progress-bar-container" style={{ height: 4, marginTop: 6 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${store.fulfillmentRate}%`,
                        background: store.fulfillmentRate > 97 ? 'var(--accent-success)' : 'var(--accent-secondary)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Realtime Live Orders Stream Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div className="chart-title">Pesanan Jastip Berjalan & Terbaru</div>
              <div className="chart-subtitle" style={{ marginBottom: 0 }}>
                Data pesanan langsung tersinkron dari Google Sheets ({orders.length} pesanan)
              </div>
            </div>
            <Link href="/orders" className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>
              Lihat Seluruh Pesanan
            </Link>
          </div>

          <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No Invoice</th>
                  <th>Customer</th>
                  <th>Toko Asal</th>
                  <th>Shopper / Driver</th>
                  <th>Status</th>
                  <th>Total Tagihan</th>
                  <th>SLA Waktu</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-primary-light)' }}>
                      {order.invoiceNumber}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{order.district}</div>
                    </td>
                    <td>{order.storeName}</td>
                    <td>{order.driverName || <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                    <td>
                      <span className={`badge-status badge-${order.status}`}>
                        {order.status === 'shopping'
                          ? '🛒 Belanja'
                          : order.status === 'delivering'
                          ? '🛵 Kirim'
                          : order.status === 'delivered'
                          ? '✓ Selesai'
                          : order.status === 'issue'
                          ? '⚠️ Masalah'
                          : '⏳ Menunggu'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#ffffff' }}>
                      {formatIDR(order.totalAmount)}
                    </td>
                    <td>
                      <span style={{ color: order.isOnTime ? 'var(--accent-success)' : 'var(--accent-danger)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {order.totalCycleTimeMins} mnt ({order.isOnTime ? 'Tepat' : 'Terlambat'})
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.725rem' }}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={12} /> Rincian
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      <DriverDetailModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
    </div>
  );
}
