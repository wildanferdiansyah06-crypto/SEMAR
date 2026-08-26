'use client';

import { useState } from 'react';
import { Calendar, Filter, Tag, X } from 'lucide-react';
import { FilterState } from '@/types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories?: string[];
}

const QUICK_RANGES = [
  { label: '7 Hari', days: 7 },
  { label: '30 Hari', days: 30 },
  { label: '90 Hari', days: 90 },
  { label: '1 Tahun', days: 365 },
];

function getDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

export default function FilterBar({ filters, onChange, categories = [] }: FilterBarProps) {
  const [activeQuick, setActiveQuick] = useState<number | null>(30);

  const handleQuickRange = (days: number) => {
    const { from, to } = getDateRange(days);
    setActiveQuick(days);
    onChange({ ...filters, dateFrom: from, dateTo: to });
  };

  const handleReset = () => {
    setActiveQuick(null);
    onChange({ dateFrom: '', dateTo: '', category: '' });
  };

  const hasFilter = filters.dateFrom || filters.dateTo || filters.category;

  return (
    <div className="filter-bar">
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        <span className="filter-label">Filter</span>
      </div>

      {/* Quick ranges */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
        {QUICK_RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => handleQuickRange(r.days)}
            className={activeQuick === r.days ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '4px 10px', fontSize: '0.72rem' }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />

      {/* Date inputs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="date"
          className="filter-input"
          value={filters.dateFrom}
          onChange={(e) => {
            setActiveQuick(null);
            onChange({ ...filters, dateFrom: e.target.value });
          }}
          style={{ colorScheme: 'dark' }}
          aria-label="Tanggal mulai"
        />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
        <input
          type="date"
          className="filter-input"
          value={filters.dateTo}
          onChange={(e) => {
            setActiveQuick(null);
            onChange({ ...filters, dateTo: e.target.value });
          }}
          style={{ colorScheme: 'dark' }}
          aria-label="Tanggal akhir"
        />
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <>
          <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag size={13} style={{ color: 'var(--text-muted)' }} />
            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => onChange({ ...filters, category: e.target.value })}
              aria-label="Kategori"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Reset */}
      {hasFilter && (
        <button
          onClick={handleReset}
          className="btn btn-ghost"
          style={{ padding: '4px 10px', fontSize: '0.72rem', marginLeft: 'auto' }}
          title="Reset filter"
        >
          <X size={12} />
          Reset
        </button>
      )}
    </div>
  );
}
