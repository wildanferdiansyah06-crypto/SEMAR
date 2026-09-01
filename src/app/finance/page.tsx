'use client';

import {
  DollarSign,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Bike,
  Send,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import MetricCard from '@/components/MetricCard';
import {
  INITIAL_DRIVERS,
  INITIAL_ORDERS,
  getFinancialOverview,
  formatIDR,
} from '@/lib/jastipData';

const CASHFLOW_7DAYS = [
  { day: 'Sen (26/08)', talanganKeluar: 15200000, pelunasanMasuk: 14800000, feeBersih: 3120000 },
  { day: 'Sel (27/08)', talanganKeluar: 17800000, pelunasanMasuk: 18200000, feeBersih: 3680000 },
  { day: 'Rab (28/08)', talanganKeluar: 16400000, pelunasanMasuk: 15900000, feeBersih: 3340000 },
  { day: 'Kam (29/08)', talanganKeluar: 20100000, pelunasanMasuk: 19800000, feeBersih: 4150000 },
  { day: 'Jum (30/08)', talanganKeluar: 26200000, pelunasanMasuk: 25400000, feeBersih: 5420000 },
  { day: 'Sab (31/08)', talanganKeluar: 32000000, pelunasanMasuk: 31500000, feeBersih: 6850000 },
  { day: 'Min (01/09)', talanganKeluar: 34700000, pelunasanMasuk: 33900000, feeBersih: 7410000 },
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

interface CashflowPayloadItem {
  name: string;
  value: number;
  color: string;
}

function CashflowTooltip({ active, payload, label }: { active?: boolean; payload?: CashflowPayloadItem[]; label?: string }) {
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

export default function FinancePage() {
  const finance = getFinancialOverview();
  const drivers = INITIAL_DRIVERS;
  const unsettledOrders = INITIAL_ORDERS.filter((o) => o.outstandingAmount > 0);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <DollarSign size={20} style={{ color: 'var(--accent-success)' }} />
            <h1 className="page-title">Keuangan & Manajemen Dana Talangan UMKM</h1>
          </div>
          <p className="page-subtitle">
            Monitoring arus modal belanja di toko (dana talangan), pelunasan dari pelanggan, kas yang dipegang driver, dan keuntungan bersih
          </p>
        </div>
      </div>

      <div className="page-wrapper">
        {/* Metric Cards Grid */}
        <div className="metric-grid section-gap">
          <MetricCard
            metric={{
              label: 'Dana Talangan Toko Keluar (Hari Ini)',
              value: 'Rp 34,7 Jt',
              delta: 14.5,
              deltaLabel: 'modal keluar',
              subtext: 'Uang belanja barang titipan',
            }}
            icon={<ArrowUpRight size={18} />}
            color="#f59e0b"
          />

          <MetricCard
            metric={{
              label: 'Pelunasan Diterima Masuk',
              value: 'Rp 33,9 Jt',
              delta: 12.2,
              deltaLabel: 'pelunasan',
              subtext: 'QRIS & Transfer customer',
            }}
            icon={<ArrowDownLeft size={18} />}
            color="#06b6d4"
          />

          <MetricCard
            metric={{
              label: 'Piutang Talangan Pending',
              value: formatIDR(finance.unsettledAmount),
              delta: -8.0,
              deltaLabel: 'sisa invoice',
              subtext: 'Menunggu struk / bayar COD',
            }}
            icon={<Clock size={18} />}
            color="#ef4444"
          />

          <MetricCard
            metric={{
              label: 'Keuntungan Bersih (Fee Jastip)',
              value: 'Rp 7,41 Jt',
              delta: 17.3,
              deltaLabel: 'margin laba',
              subtext: 'Nett profit UMKM hari ini',
            }}
            icon={<DollarSign size={18} />}
            color="#10b981"
          />
        </div>

        {/* Cashflow Chart */}
        <div className="card chart-container section-gap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="chart-title">Arus Kas: Modal Talangan Belanja vs Pelunasan Customer</div>
              <div className="chart-subtitle">Memastikan perputaran uang kas tetap sehat dan modal belanja selalu tercukupi</div>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Modal Talangan Keluar
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#06b6d4' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} /> Pelunasan Masuk
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Laba Fee Jastip
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={CASHFLOW_7DAYS}>
              <defs>
                <linearGradient id="keluarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="masukGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
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
              <Tooltip content={<CashflowTooltip />} />
              <Area
                type="monotone"
                dataKey="talanganKeluar"
                name="Modal Talangan Keluar"
                stroke="#f59e0b"
                fill="url(#keluarGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="pelunasanMasuk"
                name="Pelunasan Customer"
                stroke="#06b6d4"
                fill="url(#masukGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 2 Columns: Driver Held Cash Float & Unsettled Invoices */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Driver Cash Float Tracker */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bike size={18} style={{ color: 'var(--accent-primary-light)' }} />
                <div className="chart-title" style={{ marginBottom: 0 }}>Kas Talangan Dipegang Driver</div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary-light)' }}>
                Total: {formatIDR(drivers.reduce((acc, d) => acc + d.cashFloatHeld, 0))}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={driver.avatar}
                      alt={driver.name}
                      style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                        {driver.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {driver.vehicle} • {driver.licensePlate}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="font-mono" style={{ fontWeight: 700, color: driver.cashFloatHeld > 0 ? 'var(--accent-warning)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {formatIDR(driver.cashFloatHeld)}
                    </div>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                      {driver.activeOrdersCount} order belanja aktif
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unsettled Invoices Table */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} style={{ color: '#ef4444' }} />
                <div className="chart-title" style={{ marginBottom: 0 }}>Piutang Talangan Pending Pelunasan</div>
              </div>
              <span className="badge badge-danger">
                {unsettledOrders.length} Invoice
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {unsettledOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-primary-light)', fontSize: '0.8rem' }}>
                      {order.invoiceNumber}
                    </span>
                    <span className="badge badge-warning" style={{ fontSize: '0.675rem' }}>
                      {order.paymentStatus === 'dp' ? 'Sisa DP 50%' : order.paymentStatus === 'cod' ? 'COD di Tempat' : 'Menunggu Struk'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: 4 }}>
                    <div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.customerName}</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Toko: {order.storeName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--accent-danger)', fontWeight: 700, fontSize: '0.85rem' }}>
                        {formatIDR(order.outstandingAmount)}
                      </div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                        dari total {formatIDR(order.totalAmount)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      onClick={() => alert(`Pengingat pelunasan invoice ${order.invoiceNumber} siap dikirimkan ke ${order.customerName}`)}
                    >
                      <Send size={11} /> Kirim Pengingat Tagihan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
