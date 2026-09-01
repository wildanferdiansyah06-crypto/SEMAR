import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: {
    default: 'SEMAR - ERP Dashboard Jastip UMKM',
    template: '%s | SEMAR Jastip ERP',
  },
  description:
    'Platform ERP & Analitik Jasa Titip (Jastip) UMKM: manajemen performa driver, analitik waktu & SLA, CRM pelanggan, pelacakan belanja, dan dana talangan kas.',
  keywords: ['jastip', 'erp jastip', 'umkm', 'dashboard', 'analytics', 'driver performance', 'sla time', 'looker studio'],
  openGraph: {
    title: 'SEMAR - ERP Dashboard Jastip UMKM',
    description: 'Platform ERP & Analitik Jasa Titip (Jastip) UMKM Indonesia',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
