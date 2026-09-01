'use client';

import React from 'react';
import {
  X,
  Store,
  MapPin,
  Clock,
  User,
  ShoppingBag,
  CreditCard,
  Phone,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { JastipOrder } from '@/types/jastip';
import { formatIDR } from '@/lib/jastipData';

interface OrderDetailModalProps {
  order: JastipOrder | null;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const getStatusBadge = (status: JastipOrder['status']) => {
    switch (status) {
      case 'pending':
        return <span className="badge-status badge-pending">Menunggu Konfirmasi</span>;
      case 'shopping':
        return <span className="badge-status badge-shopping">Sedang Dibelanjakan</span>;
      case 'packing':
        return <span className="badge-status badge-packing">Packing & Sortir</span>;
      case 'delivering':
        return <span className="badge-status badge-delivering">Sedang Dikirim</span>;
      case 'delivered':
        return <span className="badge-status badge-delivered">Selesai & Diterima</span>;
      case 'issue':
        return <span className="badge-status badge-issue">⚠️ Perlu Tindakan</span>;
    }
  };

  const getPaymentBadge = (payStatus: JastipOrder['paymentStatus']) => {
    switch (payStatus) {
      case 'paid':
        return <span className="badge badge-success">Lunas</span>;
      case 'dp':
        return <span className="badge badge-warning">DP 50%</span>;
      case 'pending_receipt':
        return <span className="badge badge-warning">Menunggu Struk</span>;
      case 'cod':
        return <span className="badge badge-primary">COD Talangan</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary-light)' }}>
                {order.invoiceNumber}
              </span>
              {getStatusBadge(order.status)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Dibuat: {new Date(order.createdAt).toLocaleString('id-ID')}
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
          {/* Customer & Delivery Information */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              padding: 16,
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                Pelanggan & Tujuan
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                <User size={14} style={{ color: 'var(--accent-secondary)' }} />
                {order.customerName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Phone size={12} /> {order.customerPhone}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
                <MapPin size={12} style={{ flexShrink: 0, marginTop: 2 }} /> {order.deliveryAddress}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                Toko Asal & Shopper/Driver
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                <Store size={14} style={{ color: 'var(--accent-primary-light)' }} />
                {order.storeName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', marginTop: 2 }}>
                Kategori: {order.storeCategory}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <strong>Driver:</strong> {order.driverName || 'Belum di-assign'}
              </div>
            </div>
          </div>

          {/* Notes Alert if any */}
          {order.notes && (
            <div
              style={{
                display: 'flex',
                gap: 10,
                padding: '10px 14px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.775rem',
                color: 'var(--text-primary)',
                marginBottom: 20,
              }}
            >
              <FileText size={15} style={{ color: 'var(--accent-warning)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Catatan Titipan Customer:</strong> {order.notes}
              </div>
            </div>
          )}

          {/* Items List */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShoppingBag size={15} style={{ color: 'var(--accent-primary-light)' }} />
              Rincian Barang Titipan ({order.items.length} Item)
            </div>

            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item / Barang</th>
                    <th>Qty</th>
                    <th>Harga Toko</th>
                    <th>Fee Jastip</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {item.storeName}
                          {item.note && <span style={{ color: 'var(--accent-warning)', marginLeft: 6 }}>• {item.note}</span>}
                        </div>
                      </td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{formatIDR(item.actualPrice || item.estimatedPrice)}</td>
                      <td>{formatIDR(item.jastipFee)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatIDR(((item.actualPrice || item.estimatedPrice) + item.jastipFee) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Time & SLA Funnel */}
          <div
            style={{
              padding: 14,
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} style={{ color: 'var(--accent-secondary)' }} />
              Timeline & SLA Waktu Pengerjaan
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Verifikasi</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{order.verificationTimeMins} mnt</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Belanja di Toko</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-primary-light)' }}>{order.shoppingTimeMins} mnt</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Packing</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{order.packingTimeMins} mnt</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Pengantaran</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>{order.deliveryTimeMins} mnt</div>
              </div>
            </div>
          </div>

          {/* Financial Calculation (ERP Talangan Breakdown) */}
          <div
            style={{
              padding: 16,
              background: 'rgba(99, 102, 241, 0.04)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Modal Belanja (Talangan Toko):</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatIDR(order.totalGoodsCost)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Fee Jastip (Laba Bersih UMKM):</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-success)' }}>+{formatIDR(order.totalJastipFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ongkos Kirim:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>+{formatIDR(order.shippingFee)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 10,
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            >
              <span style={{ color: 'var(--text-primary)' }}>Total Nilai Tagihan:</span>
              <span style={{ color: 'var(--accent-primary-light)' }}>{formatIDR(order.totalAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.8rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Status Pembayaran: {getPaymentBadge(order.paymentStatus)}
              </span>
              <span style={{ color: order.outstandingAmount > 0 ? 'var(--accent-danger)' : 'var(--accent-success)', fontWeight: 600 }}>
                {order.outstandingAmount > 0 ? `Sisa: ${formatIDR(order.outstandingAmount)}` : 'Lunas (0 Sisa)'}
              </span>
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
              alert(`Nota struk ${order.invoiceNumber} siap dicetak / dikirim ke customer.`);
            }}
          >
            Cetak Nota & Struk
          </button>
        </div>
      </div>
    </div>
  );
}
