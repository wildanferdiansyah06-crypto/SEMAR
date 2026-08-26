'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertCircle,
  BarChart2,
  Copy,
  Check,
} from 'lucide-react';
import { buildLookerUrl } from '@/lib/sheets';
import { FilterState } from '@/types';

interface LookerEmbedProps {
  url: string;
  filters?: Partial<FilterState>;
  height?: number;
  title?: string;
}

export default function LookerEmbed({
  url,
  filters = {},
  height = 600,
  title = 'Looker Studio Report',
}: LookerEmbedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const embedUrl = buildLookerUrl(url, {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    ...(filters.category ? { df3: filters.category } : {}),
  });

  const handleRefreshIframe = () => {
    setIframeKey((k) => k + 1);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // No URL configured
  if (!url) {
    return (
      <div className="looker-embed-container">
        <div className="looker-embed-toolbar">
          <div className="looker-embed-title">
            <BarChart2 size={16} style={{ color: 'var(--accent-primary-light)' }} />
            {title}
          </div>
          <span className="badge badge-warning">Belum Dikonfigurasi</span>
        </div>
        <div className="looker-embed-placeholder">
          <AlertCircle size={56} style={{ color: 'var(--accent-tertiary)' }} />
          <div>
            <h3 style={{ marginBottom: 8, color: 'var(--text-primary)' }}>
              URL Report Belum Diatur
            </h3>
            <p style={{ fontSize: '0.875rem', maxWidth: 440 }}>
              Buka <strong style={{ color: 'var(--accent-primary-light)' }}>Pengaturan</strong> dan masukkan
              URL embed dari Google Looker Studio untuk menampilkan report di sini.
            </p>
          </div>
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 24px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            maxWidth: 500,
            lineHeight: 1.8,
          }}>
            <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              Cara mendapatkan URL embed:
            </strong>
            1. Buka Google Looker Studio → pilih report kamu<br />
            2. Klik tombol <strong>Share</strong> (pojok kanan atas)<br />
            3. Pilih tab <strong>Embed report</strong><br />
            4. Copy URL dari atribut <code style={{ color: 'var(--accent-secondary)' }}>src</code> di iframe code<br />
            5. Paste ke halaman Pengaturan
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="looker-embed-container"
      style={isFullscreen ? { position: 'fixed', inset: 0, zIndex: 9999, borderRadius: 0 } : {}}
    >
      {/* Toolbar */}
      <div className="looker-embed-toolbar">
        <div className="looker-embed-title">
          <BarChart2 size={16} style={{ color: 'var(--accent-primary-light)' }} />
          {title}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="badge badge-primary" style={{ marginLeft: 8 }}>
              {filters.dateFrom} – {filters.dateTo}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Copy URL */}
          <button
            onClick={handleCopyUrl}
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: '0.72rem' }}
            title="Copy embed URL"
          >
            {copied ? <Check size={12} style={{ color: 'var(--accent-success)' }} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy URL'}
          </button>

          {/* Refresh iframe */}
          <button
            onClick={handleRefreshIframe}
            className="btn btn-ghost"
            style={{ padding: '4px 8px' }}
            title="Refresh report"
          >
            <RefreshCw size={13} />
          </button>

          {/* Open in new tab */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ padding: '4px 8px' }}
            title="Buka di tab baru"
          >
            <ExternalLink size={13} />
          </a>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="btn btn-ghost"
            style={{ padding: '4px 8px' }}
            title={isFullscreen ? 'Keluar fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* iFrame */}
      <iframe
        key={iframeKey}
        src={embedUrl}
        className="looker-embed-iframe"
        style={{ height: isFullscreen ? 'calc(100vh - 56px)' : height }}
        allowFullScreen
        title={title}
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
      />
    </div>
  );
}
