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
  ExternalLink,
  ChevronRight,
  Eye,
  Star,
  MapPin,
  Flame,
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
  BarChart,
  Bar,
} from 'recharts';
import MetricCard from '@/components/MetricCard';
import OrderDetailModal from '@/components/OrderDetailModal';
import DriverDetailModal from '@/components/DriverDetailModal';
import {
  INITIAL_DRIVERS,
  INITIAL_ORDERS,
  INITIAL_STORES,
  DAILY_TREND_DATA,
  CATEGORY_DISTRIBUTION,
  TIME_SLA_STAGES,
  getFinancialOverview,
  formatIDR,
  formatCompactIDR,
} from '@/lib/jastipData';
import { JastipOrder, DriverPerformance } from '@/types/jastip';

const CustomTooltipStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.8rem',
  padding: '10px 14px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
};

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={CustomTooltipStyle}>
      <div style={{ marginBottom: 6, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.75rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span>{p.name}: <strong>{formatIDR(Number(p.value))}</strong></span>
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
      <div style={{ fontSize: '0.75rem', marginTop: 4 }}>
        Pangsa Order: <strong>{data.value}%</strong>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Total Belanja: <strong>{formatIDR(data.revenue)}</strong>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [selectedOrder, setSelectedOrder] = useState<JastipOrder | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DriverPerformance | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');

  const finance = getFinancialOverview();
  const orders = INITIAL_ORDERS;
  const drivers = INITIAL_DRIVERS;
  const stores = INITIAL_STORES;

  // Order status counts
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div className="sidebar-logo-icon" style={{ width: 28, height: 28 }}>
              <Flame size={16} color="white" />
            </div>
            <h1 className="page-title">Executive ERP Dashboard Jastip</h1>
          </div>
          <p className="page-subtitle">
            Ringkasan operasional real-time personal shopper, driver, talangan kas & performa UMKM
          </p>
        </div>

        {/* Time Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              7 Hari Terakhir
            </button>
            <button
              className={`erp-tab-btn ${timeRange === '30days' ? 'active' : ''}`}
              onClick={() => setTimeRange('30days')}
            >
              Bulan Ini
            </button>
          </div>
        </div>
      </div>

      <div className="page-wrapper">
        {/* KPI Cards Grid */}
        <div className="metric-grid section-gap">
          <MetricCard
            metric={{
              label: 'Total Nilai Belanja (GMV)',
              value: formatCompactIDR(timeRange === 'today' ? 42100000 : finance.totalGMV),
              delta: 14.8,
              deltaLabel: 'vs kemarin',
              subtext: 'Modal barang titipan',
            }}
            icon={<ShoppingBag size={18} />}
            color="#6366f1"
          />

          <MetricCard
            metric={{
              label: 'Pendapatan Bersih (Fee Jastip)',
              value: formatCompactIDR(timeRange === 'today' ? 7410000 : finance.totalJastipFee),
              delta: 17.3,
              deltaLabel: 'margin laba',
              subtext: 'Fee jasa titip toko',
            }}
            icon={<DollarSign size={18} />}
            color="#10b981"
          />

          <MetricCard
            metric={{
              label: 'Dana Talangan Berjalan',
              value: formatCompactIDR(finance.activeTalanganCash),
              delta: -5.2,
              deltaLabel: 'uang kas luar',
              subtext: `${finance.unsettledInvoicesCount} invoice pending pelunasan`,
            }}
            icon={<TrendingUp size={18} />}
            color="#f59e0b"
          />

          <MetricCard
            metric={{
              label: 'Ketepatan Waktu (On-Time SLA)',
              value: '96.8%',
              delta: 2.1,
              deltaLabel: 'kecepatan',
              subtext: 'Rata-rata 1j 45m / order',
            }}
            icon={<Clock size={18} />}
            color="#06b6d4"
          />
        </div>

        {/* Live Operational Status Kanban Strip */}
        <div
          className="card section-gap"
          style={{
            padding: '16px 20px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="refresh-dot" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Status Alur Operasional Pesanan Hari Ini
              </span>
            </div>
            <Link href="/orders" className="text-accent" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              Kelola Semua Pesanan <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #f59e0b' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Menunggu Konfirmasi</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{pendingCount} Pesanan</div>
              <div style={{ fontSize: '0.675rem', color: '#f59e0b' }}>Verifikasi DP / Kuota</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #06b6d4' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sedang Dibelanjakan</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{shoppingCount} Pesanan</div>
              <div style={{ fontSize: '0.675rem', color: '#06b6d4' }}>Shopper di Toko / Pasar</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #818cf8' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sedang Dikirim (Kurir)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{deliveringCount} Pesanan</div>
              <div style={{ fontSize: '0.675rem', color: '#818cf8' }}>Menuju Lokasi Pelanggan</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #10b981' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Selesai & Diterima</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{deliveredCount} Pesanan</div>
              <div style={{ fontSize: '0.675rem', color: '#10b981' }}>Struk Valid & Lunas</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #ef4444' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Perlu Tindakan</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{issueCount} Pesanan</div>
              <div style={{ fontSize: '0.675rem', color: '#ef4444' }}>Stok Habis / Beda Harga</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Daily Revenue & GMV Trend */}
          <div className="card chart-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div className="chart-title">Tren Nilai Belanja (GMV) vs Fee Jastip Bersih</div>
                <div className="chart-subtitle">Evaluasi perputaran modal dan margin keuntungan harian</div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6366f1' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} /> GMV Belanja
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Fee Jastip
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={270}>
              <AreaChart data={DAILY_TREND_DATA}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
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
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="jastipFee"
                  name="Fee Jastip Bersih"
                  stroke="#10b981"
                  fill="url(#feeGrad)"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution Donut */}
          <div className="card chart-container" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="chart-title">Distribusi Kategori Barang Jastip</div>
            <div className="chart-subtitle">Pangsa permintaan pasar & belanja UMKM</div>

            <div style={{ flex: 1, minHeight: 180 }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={CATEGORY_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {CATEGORY_DISTRIBUTION.slice(0, 4).map((cat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: cat.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.value}%</span>
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
              <Link href="/drivers" className="text-accent" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
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
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {driver.name}
                      </div>
                      <span className="badge-status badge-delivered" style={{ fontSize: '0.675rem' }}>
                        ⭐ {driver.rating.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      <span>Speed Belanja: <strong style={{ color: 'var(--accent-primary-light)' }}>{driver.avgShoppingSpeedMins}m</strong></span>
                      <span>•</span>
                      <span>On-Time: <strong style={{ color: 'var(--accent-success)' }}>{driver.onTimeDeliveryRate}%</strong></span>
                      <span>•</span>
                      <span>Selesai: <strong style={{ color: 'var(--text-primary)' }}>{driver.ordersCompletedToday} order</strong></span>
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
                <div className="chart-title" style={{ marginBottom: 0 }}>Pasar & Toko Terfavorit</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tingkat Keberhasilan Stok</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stores.slice(0, 4).map((store) => (
                <div
                  key={store.id}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
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
                Data pesanan langsung dapat diklik untuk melihat rincian barang titipan & nota struk
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
                    <td className="font-mono" style={{ fontWeight: 600, color: 'var(--accent-primary-light)' }}>
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
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatIDR(order.totalAmount)}
                    </td>
                    <td>
                      <span style={{ color: order.isOnTime ? 'var(--accent-success)' : 'var(--accent-danger)', fontSize: '0.75rem' }}>
                        {order.totalCycleTimeMins} mnt ({order.isOnTime ? 'Tepat' : 'Terlambat'})
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={13} /> Rincian
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
