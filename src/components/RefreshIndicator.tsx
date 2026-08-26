'use client';

import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { formatDate } from '@/lib/sheets';

interface RefreshIndicatorProps {
  isRefreshing: boolean;
  countdown: number;
  lastUpdated?: string;
  error?: string | null;
  onRefresh?: () => void;
}

export default function RefreshIndicator({
  isRefreshing,
  countdown,
  lastUpdated,
  error,
  onRefresh,
}: RefreshIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      {/* Status dot */}
      <div className="refresh-indicator">
        <div className={`refresh-dot ${isRefreshing ? 'loading' : ''}`} />
        <span>
          {isRefreshing
            ? 'Memperbarui...'
            : error
            ? 'Error'
            : `Refresh dalam ${countdown}d`}
        </span>
      </div>

      {/* Last updated */}
      {lastUpdated && !error && (
        <div className="refresh-indicator" style={{ gap: 6 }}>
          <Wifi size={12} style={{ color: 'var(--accent-success)', opacity: 0.8 }} />
          <span style={{ fontSize: '0.7rem' }}>
            Diperbarui {formatDate(lastUpdated)}
          </span>
        </div>
      )}

      {/* Error badge */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <WifiOff size={12} style={{ color: 'var(--accent-danger)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-danger)' }}>
            {error}
          </span>
        </div>
      )}

      {/* Manual refresh */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="btn btn-ghost"
          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
          disabled={isRefreshing}
          title="Refresh sekarang"
        >
          <RefreshCw
            size={12}
            style={{
              transition: 'transform 0.5s ease',
              transform: isRefreshing ? 'rotate(360deg)' : 'none',
            }}
          />
          Refresh
        </button>
      )}
    </div>
  );
}
