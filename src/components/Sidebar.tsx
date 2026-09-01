'use client';

import { useState } from 'react';
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
  ChevronRight,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    section: 'Menu Utama',
    items: [
      { href: '/dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, badge: 'Live' },
      { href: '/orders', label: 'Pesanan & Belanja', icon: ShoppingBag },
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

  return (
    <>
      {/* Mobile hamburger button */}
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
            background: 'rgba(0,0,0,0.7)',
            zIndex: 99,
            backdropFilter: 'blur(6px)',
          }}
        />
      )}

      {/* Sidebar container */}
      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        {/* Logo Brand */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <PackageCheck size={20} color="#ffffff" />
          </div>
          <div>
            <div className="sidebar-logo-text">SEMAR JASTIP</div>
            <div className="sidebar-logo-sub">Enterprise ERP UMKM</div>
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
                    <Icon className="nav-icon" size={17} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 99,
                          background: 'rgba(16,185,129,0.18)',
                          color: '#34d399',
                          border: '1px solid rgba(16,185,129,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span className="refresh-dot" style={{ width: 4, height: 4 }} />
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight size={13} style={{ opacity: 0.6, marginLeft: 2 }} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: User & Live Status */}
        <div className="sidebar-footer">
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              AD
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Admin Operasional
              </div>
              <div style={{ fontSize: '0.675rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={11} /> Cloud Connected
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
