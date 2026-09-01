'use client';

import React from 'react';
import {
  X,
  Star,
  Clock,
  Bike,
  Car,
  MapPin,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Award,
  Phone,
} from 'lucide-react';
import { DriverPerformance } from '@/types/jastip';
import { formatIDR } from '@/lib/jastipData';

interface DriverDetailModalProps {
  driver: DriverPerformance | null;
  onClose: () => void;
}

export default function DriverDetailModal({ driver, onClose }: DriverDetailModalProps) {
  if (!driver) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={driver.avatar}
              alt={driver.name}
              className="driver-avatar"
              style={{ width: 54, height: 54 }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {driver.name}
                </h3>
                <span className="badge badge-primary">
                  {driver.vehicle === 'Motor' ? <Bike size={12} /> : <Car size={12} />}
                  {driver.licensePlate}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 600 }}>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" /> {driver.rating.toFixed(2)} ({driver.totalReviews} ulasan)
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={12} /> {driver.phone}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: 6, borderRadius: '50%' }}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Location & Status Bar */}
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              fontSize: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={15} style={{ color: 'var(--accent-secondary)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Posisi Saat Ini:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{driver.currentLocation}</strong>
            </div>
            <div>
              <span className={`badge-status badge-${driver.status === 'off' ? 'issue' : driver.status === 'standby' ? 'pending' : driver.status === 'shopping' ? 'shopping' : 'delivering'}`}>
                {driver.status === 'shopping' ? '🛒 Sedang Belanja' : driver.status === 'delivering' ? '🛵 Mengantar Pesanan' : driver.status === 'standby' ? '⚡ Siap Ambil Titipan' : '☕ Istirahat'}
              </span>
            </div>
          </div>

          {/* Performance Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-card)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Kecepatan Belanja
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary-light)', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
                {driver.avgShoppingSpeedMins} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>mnt/order</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)', marginTop: 2 }}>
                ✓ Di bawah target SLA 45 mnt
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Kecepatan Antar
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-secondary)', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
                {driver.avgDeliverySpeedMins} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>mnt/trip</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Rata-rata 4.2 km/trip
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                On-Time Delivery
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
                {driver.onTimeDeliveryRate}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)', marginTop: 2 }}>
                Top 5% Shopper Terbaik
              </div>
            </div>
          </div>

          {/* Financials for Driver */}
          <div
            style={{
              padding: 16,
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-md)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Komisi Driver Hari Ini
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-success)', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
                {formatIDR(driver.todayCommission)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Dari {driver.ordersCompletedToday} pengiriman selesai
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Kas Talangan Dipegang
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary-light)', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
                {formatIDR(driver.cashFloatHeld)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Saldo aktif untuk belanja di toko
              </div>
            </div>
          </div>

          {/* Recent Deliveries Table */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={14} style={{ color: 'var(--accent-primary-light)' }} />
              Riwayat Pengiriman Terakhir
            </div>
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Toko Asal</th>
                    <th>Customer</th>
                    <th>Durasi</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {driver.recentDeliveries.map((item, i) => (
                    <tr key={i}>
                      <td className="font-mono" style={{ color: 'var(--accent-primary-light)' }}>{item.orderId}</td>
                      <td>{item.store}</td>
                      <td>{item.customer}</td>
                      <td>
                        <span style={{ color: item.isOnTime ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                          {item.timeMins} mnt {item.isOnTime ? '(Tepat Waktu)' : '(Terlambat)'}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
                          <Star size={11} fill="#f59e0b" color="#f59e0b" /> {item.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              window.open(`https://wa.me/${driver.phone.replace(/[^0-9]/g, '')}`, '_blank');
            }}
          >
            Hubungi Driver via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
