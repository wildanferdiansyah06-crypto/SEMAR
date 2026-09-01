'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Bike,
  Users,
  Clock,
  DollarSign,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  PackageCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    section: 'ERP Jastip Menu',
    items: [
      { href: '/dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, badge: 'Live' },
      { href: '/orders', label: 'Pesanan & Belanja', icon: ShoppingBag, badge: '7 Aktif' },
      { href: '/drivers', label: 'Performa Driver', icon: Bike },
      { href: '/customers', label: 'Pelanggan & CRM', icon: Users },
      { href: '/analytics', label: 'Analitik Waktu & SLA', icon: Clock },
      { href: '/finance', label: 'Keuangan & Talangan', icon: DollarSign },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="mobile-hamburger"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Buka menu"
        style={{
          display: 'none',
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 200,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px',
          cursor: 'pointer',
          color: 'var(--text-primary)',
        }}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 99,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <PackageCheck size={20} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">SEMAR JASTIP</div>
            <div className="sidebar-logo-sub">ERP & Analytics UMKM</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon className="nav-icon" size={18} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 10,
                          background: item.badge === 'Live' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)',
                          color: item.badge === 'Live' ? '#10b981' : '#818cf8',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight size={14} style={{ opacity: 0.5, marginLeft: 4 }} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Quick Status */}
        <div className="sidebar-footer">
          <div
            style={{
              padding: '12px',
              background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <span className="refresh-dot" style={{ width: 6, height: 6 }} />
                Driver Siaga
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary-light)' }}>
                6 / 8 Aktif
              </span>
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
              SLA Ketepatan: <strong style={{ color: 'var(--accent-success)' }}>96.8%</strong>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
