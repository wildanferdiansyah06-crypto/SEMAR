'use client';

import { SheetMetric } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';

interface MetricCardProps {
  metric: SheetMetric;
  icon?: ReactNode;
  color?: string;
  isLoading?: boolean;
}

export default function MetricCard({ metric, icon, color = '#6366f1', isLoading }: MetricCardProps) {
  const isUp = (metric.delta ?? 0) > 0;
  const isDown = (metric.delta ?? 0) < 0;
  const deltaAbs = Math.abs(metric.delta ?? 0);

  if (isLoading) {
    return (
      <div className="card metric-card">
        <div className="metric-card-header">
          <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
        </div>
        <div className="skeleton" style={{ width: 120, height: 32, borderRadius: 6, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 10 }} />
      </div>
    );
  }

  return (
    <div className="card metric-card" style={{ '--card-accent': color } as React.CSSProperties}>
      <div className="metric-card-header">
        <span className="metric-card-label">{metric.label}</span>
        {icon && (
          <div
            className="metric-card-icon"
            style={{
              background: `${color}18`,
              border: `1px solid ${color}30`,
              color,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="metric-value">
        {metric.prefix}{typeof metric.value === 'number'
          ? metric.value.toLocaleString('id-ID')
          : metric.value}{metric.suffix}
      </div>

      {metric.delta !== undefined && (
        <div className={`metric-delta ${isUp ? 'up' : isDown ? 'down' : ''}`}>
          {isUp && <TrendingUp size={12} />}
          {isDown && <TrendingDown size={12} />}
          {!isUp && !isDown && <Minus size={12} />}
          <span>{isUp ? '+' : ''}{deltaAbs}%</span>
          {metric.deltaLabel && (
            <span style={{ fontWeight: 400, opacity: 0.7 }}>&nbsp;{metric.deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
