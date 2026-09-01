'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Eye,
  Bike,
  RefreshCw,
} from 'lucide-react';
import OrderDetailModal from '@/components/OrderDetailModal';
import { useJastipLive } from '@/hooks/useJastipLive';
import { formatIDR } from '@/lib/jastipData';
import { JastipOrder, OrderStatus } from '@/types/jastip';

export default function OrdersPage() {
  const { orders, isRefreshing, refetch } = useJastipLive();
  const [selectedOrder, setSelectedOrder] = useState<JastipOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.driverName && order.driverName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="badge-status badge-pending">Menunggu</span>;
      case 'shopping':
        return <span className="badge-status badge-shopping">Sedang Belanja</span>;
      case 'packing':
        return <span className="badge-status badge-packing">Packing</span>;
      case 'delivering':
        return <span className="badge-status badge-delivering">Sedang Dikirim</span>;
      case 'delivered':
        return <span className="badge-status badge-delivered">Selesai</span>;
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
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <h1 className="page-title">Manajemen Pesanan & Belanja Jastip</h1>
          </div>
          <p className="page-subtitle">
            Pelacakan real-time alur pesanan dari verifikasi belanja, toko/pasar asal, kurir, hingga pelunasan nota
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() => refetch()}
            disabled={isRefreshing}
            style={{ padding: '7px 12px', fontSize: '0.775rem' }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-pulse' : ''} />
            {isRefreshing ? 'Sync...' : 'Sync Data'}
          </button>

          <button
            className="btn btn-primary"
            onClick={() => alert('Form input titipan baru siap dibuka.')}
          >
            <Plus size={15} /> Buat Titipan Baru
          </button>
        </div>
      </div>

      <div className="page-wrapper">
        {/* Status Filter Tabs */}
        <div className="erp-tabs">
          <button
            className={`erp-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Semua ({orders.length})
          </button>
          <button
            className={`erp-tab-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Menunggu ({orders.filter((o) => o.status === 'pending').length})
          </button>
          <button
            className={`erp-tab-btn ${statusFilter === 'shopping' ? 'active' : ''}`}
            onClick={() => setStatusFilter('shopping')}
          >
            Sedang Belanja ({orders.filter((o) => o.status === 'shopping').length})
          </button>
          <button
            className={`erp-tab-btn ${statusFilter === 'delivering' ? 'active' : ''}`}
            onClick={() => setStatusFilter('delivering')}
          >
            Sedang Dikirim ({orders.filter((o) => o.status === 'delivering').length})
          </button>
          <button
            className={`erp-tab-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('delivered')}
          >
            Selesai ({orders.filter((o) => o.status === 'delivered').length})
          </button>
          <button
            className={`erp-tab-btn ${statusFilter === 'issue' ? 'active' : ''}`}
            onClick={() => setStatusFilter('issue')}
          >
            Masalah Stok ({orders.filter((o) => o.status === 'issue').length})
          </button>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="filter-input"
              placeholder="Cari No Invoice, Customer, Toko, atau Driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: 36 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="filter-label">Status Bayar:</span>
            <select
              className="filter-select"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="paid">Lunas</option>
              <option value="dp">DP 50%</option>
              <option value="pending_receipt">Menunggu Struk</option>
              <option value="cod">COD</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No Invoice</th>
                  <th>Customer & Alamat</th>
                  <th>Toko / Pasar</th>
                  <th>Jumlah Item</th>
                  <th>Shopper / Driver</th>
                  <th>Status Pesanan</th>
                  <th>Modal Belanja</th>
                  <th>Fee Jastip</th>
                  <th>Total Tagihan</th>
                  <th>Status Bayar</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      Tidak ada pesanan yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-primary-light)' }}>
                          {order.invoiceNumber}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{order.customerName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{order.district}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{order.storeName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)' }}>{order.storeCategory}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {order.items.length} Macam
                        </span>
                      </td>
                      <td>
                        {order.driverName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Bike size={13} style={{ color: 'var(--accent-primary-light)' }} />
                            <span>{order.driverName}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Belum di-assign</span>
                        )}
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatIDR(order.totalGoodsCost)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-success)' }}>+{formatIDR(order.totalJastipFee)}</td>
                      <td style={{ fontWeight: 700, color: '#ffffff' }}>{formatIDR(order.totalAmount)}</td>
                      <td>{getPaymentBadge(order.paymentStatus)}</td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.725rem' }}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye size={12} /> Rincian
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
