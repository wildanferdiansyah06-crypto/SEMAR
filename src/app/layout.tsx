import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: {
    default: 'DataVision Dashboard',
    template: '%s | DataVision',
  },
  description:
    'Dashboard analitik terintegrasi dengan Google Looker Studio dan Google Sheets — data realtime untuk keputusan bisnis lebih cepat.',
  keywords: ['dashboard', 'analytics', 'looker studio', 'google sheets', 'data visualization'],
  openGraph: {
    title: 'DataVision Dashboard',
    description: 'Dashboard analitik terintegrasi Google Looker Studio & Sheets',
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
