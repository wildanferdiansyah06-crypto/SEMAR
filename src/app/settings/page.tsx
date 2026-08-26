'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Info, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { getConfig, saveConfig } from '@/lib/sheets';
import { DashboardConfig } from '@/types';

export default function SettingsPage() {
  const [config, setConfig] = useState<DashboardConfig>({
    lookerEmbedUrl: '',
    sheetsId: '',
    apiKey: '',
    sheetsRange: 'Sheet1!A1:Z100',
    refreshInterval: 30,
    reportName: 'My Dashboard',
  });
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConfig(getConfig());
    setMounted(true);
  }, []);

  const handleSave = () => {
    saveConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (key: keyof DashboardConfig, value: string | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (!mounted) return null;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Settings size={20} style={{ color: 'var(--accent-primary-light)' }} />
            <h1 className="page-title">Pengaturan</h1>
          </div>
          <p className="page-subtitle">Konfigurasi koneksi Looker Studio dan Google Sheets API</p>
        </div>

        <button
          onClick={handleSave}
          className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`}
          style={{ transition: 'all 0.3s' }}
        >
          {saved ? (
            <><CheckCircle size={14} style={{ color: 'var(--accent-success)' }} /> Tersimpan!</>
          ) : (
            <><Save size={14} /> Simpan Pengaturan</>
          )}
        </button>
      </div>

      <div className="page-wrapper">
        <div style={{ maxWidth: 720 }}>

          {/* Info banner */}
          <div
            style={{
              padding: '14px 18px',
              background: 'rgba(99,102,241,0.07)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 32,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            <Info size={16} style={{ color: 'var(--accent-primary-light)', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Semua konfigurasi disimpan di <strong>localStorage</strong> browser kamu — tidak dikirim ke server manapun.
              API Key hanya digunakan untuk request langsung dari browser ke Google Sheets API.
            </div>
          </div>

          {/* Section 1: Looker Studio */}
          <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
            <div className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 24, height: 24,
                background: 'var(--gradient-primary)',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'white',
              }}>1</span>
              Looker Studio
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reportName">Nama Report</label>
              <input
                id="reportName"
                className="form-input"
                placeholder="Contoh: Sales Dashboard Q3 2024"
                value={config.reportName}
                onChange={(e) => handleChange('reportName', e.target.value)}
              />
              <div className="form-hint">Ditampilkan sebagai judul di header dan embed toolbar.</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lookerEmbedUrl">
                URL Embed Looker Studio
                <a
                  href="https://support.google.com/looker-studio/answer/7420774"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: 8, fontSize: '0.7rem', color: 'var(--accent-primary-light)' }}
                >
                  <ExternalLink size={11} style={{ verticalAlign: 'middle' }} /> Cara mendapatkan URL
                </a>
              </label>
              <input
                id="lookerEmbedUrl"
                className="form-input mono"
                placeholder="https://lookerstudio.google.com/embed/reporting/..."
                value={config.lookerEmbedUrl}
                onChange={(e) => handleChange('lookerEmbedUrl', e.target.value)}
              />
              <div className="form-hint">
                Di Looker Studio: klik <strong>Share</strong> → tab <strong>Embed report</strong> → copy URL dari atribut <code>src</code> di iframe.
              </div>
            </div>
          </div>

          {/* Section 2: Google Sheets */}
          <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
            <div className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 24, height: 24,
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'white',
              }}>2</span>
              Google Sheets API
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sheetsId">Spreadsheet ID</label>
              <input
                id="sheetsId"
                className="form-input mono"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                value={config.sheetsId}
                onChange={(e) => handleChange('sheetsId', e.target.value)}
              />
              <div className="form-hint">
                Dari URL spreadsheet: <code>docs.google.com/spreadsheets/d/<strong>[ID INI]</strong>/edit</code>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="apiKey">
                Google API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="apiKey"
                  className="form-input mono"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={config.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                  }}
                >
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="form-hint">
                Dari{' '}
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
                  Google Cloud Console
                </a>{' '}
                → APIs & Services → Credentials → Create API Key.
                Pastikan <strong>Google Sheets API</strong> sudah diaktifkan dan spreadsheet bersifat publik (Anyone with link can view).
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sheetsRange">Range Data</label>
              <input
                id="sheetsRange"
                className="form-input mono"
                placeholder="Sheet1!A1:Z100"
                value={config.sheetsRange}
                onChange={(e) => handleChange('sheetsRange', e.target.value)}
              />
              <div className="form-hint">
                Format: <code>NamaSheet!KolomAwal:KolomAkhir</code>. Baris pertama dianggap sebagai header.
              </div>
            </div>
          </div>

          {/* Section 3: Refresh */}
          <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
            <div className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 24, height: 24,
                background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'white',
              }}>3</span>
              Interval Refresh
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="refreshInterval">
                Auto-refresh metric cards setiap (detik)
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[15, 30, 60, 120, 300].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleChange('refreshInterval', s)}
                    className={config.refreshInterval === s ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    {s < 60 ? `${s}d` : `${s / 60}m`}
                  </button>
                ))}
                <input
                  id="refreshInterval"
                  className="form-input"
                  type="number"
                  min={5}
                  max={3600}
                  value={config.refreshInterval}
                  onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value) || 30)}
                  style={{ width: 90 }}
                  aria-label="Custom interval"
                />
              </div>
              <div className="form-hint" style={{ marginTop: 8 }}>
                Minimum 5 detik. Terlalu sering dapat menyebabkan rate limit dari Google Sheets API.
              </div>
            </div>
          </div>

          {/* Save button bottom */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`}>
              {saved
                ? <><CheckCircle size={14} style={{ color: 'var(--accent-success)' }} /> Pengaturan Tersimpan!</>
                : <><Save size={14} /> Simpan & Terapkan</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
