import { JastipOrder, OrderStatus, PaymentStatus } from '@/types/jastip';
import { DashboardConfig, SheetData } from '@/types';
import { INITIAL_ORDERS } from '@/lib/jastipData';

// ─── Config helpers ────────────────────────────────────────────
export function getConfig(): DashboardConfig {
  return {
    lookerEmbedUrl: process.env.NEXT_PUBLIC_LOOKER_EMBED_URL || '',
    sheetsId: process.env.NEXT_PUBLIC_SHEETS_ID || '',
    apiKey: process.env.NEXT_PUBLIC_SHEETS_API_KEY || '',
    sheetsRange: process.env.NEXT_PUBLIC_SHEETS_RANGE || 'DATA_PESANAN_JASTIP!A1:Z500',
    refreshInterval: Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL) || 30,
    reportName: process.env.NEXT_PUBLIC_REPORT_NAME || 'SEMAR Jastip ERP',
  };
}

export function saveConfig(config?: Partial<DashboardConfig>): void {
  void config;
  console.warn('Konfigurasi menggunakan Environment Variables.');
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function buildLookerUrl(
  baseUrl: string,
  params: {
    dateFrom?: string;
    dateTo?: string;
    [key: string]: string | undefined;
  }
): string {
  if (!baseUrl) return '';
  try {
    const url = new URL(baseUrl);
    const lookerParams: Record<string, string> = {};
    if (params.dateFrom) lookerParams['df1'] = `EQ${params.dateFrom.replace(/-/g, '')}`;
    if (params.dateTo) lookerParams['df2'] = `EQ${params.dateTo.replace(/-/g, '')}`;
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== 'dateFrom' && k !== 'dateTo') lookerParams[k] = v;
    });
    if (Object.keys(lookerParams).length > 0) {
      url.searchParams.set('params', JSON.stringify(lookerParams));
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function getMockData(): SheetData {
  return {
    metrics: [
      { label: 'Total Belanja (GMV)', value: 'Rp 42,1 Jt', delta: 14.8, deltaLabel: 'vs kemarin' },
      { label: 'Laba Fee Jastip', value: 'Rp 7,41 Jt', delta: 17.3, deltaLabel: 'margin bersih' },
      { label: 'Dana Talangan Aktif', value: 'Rp 6,98 Jt', delta: -5.2, deltaLabel: 'uang kas luar' },
      { label: 'On-Time SLA', value: '96.8%', delta: 2.1, deltaLabel: 'kecepatan' },
    ],
    rows: [
      { Tanggal: '2026-09-01', Penjualan: 42100000, Transaksi: 102, Pelanggan: 88 },
      { Tanggal: '2026-08-31', Penjualan: 38900000, Transaksi: 94, Pelanggan: 82 },
      { Tanggal: '2026-08-30', Penjualan: 31600000, Transaksi: 78, Pelanggan: 70 },
    ],
    headers: ['Tanggal', 'Penjualan', 'Transaksi', 'Pelanggan'],
    lastUpdated: new Date().toISOString(),
  };
}

export async function fetchSheetData(
  sheetsId: string,
  range?: string,
  apiKey?: string
): Promise<SheetData> {
  void range;
  void apiKey;
  if (!sheetsId) return getMockData();
  return getMockData();
}

export function parseIndonesianCurrency(val: unknown): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val)
    .replace(/Rp/gi, '')
    .replace(/\s+/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/-/g, '0');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentField = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(currentField.trim());
      if (row.some((field) => field.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField.length > 0 || row.length > 0) {
    row.push(currentField.trim());
    if (row.some((field) => field.length > 0)) {
      lines.push(row);
    }
  }
  return lines;
}

export async function fetchLiveJastipSheetData(sheetsId: string, apiKey?: string): Promise<JastipOrder[]> {
  if (!sheetsId) return INITIAL_ORDERS;

  try {
    let rows: string[][] = [];

    // Attempt 1: Try Google Sheets API v4 with apiKey
    if (apiKey) {
      try {
        const range = 'DATA_PESANAN_JASTIP!A1:Z500';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.values && json.values.length > 1) {
            rows = json.values;
          }
        }
      } catch {
        console.warn('API Key request failed, trying GViz fallback');
      }
    }

    // Attempt 2: Fallback to Google Visualization CSV export
    if (rows.length < 2) {
      const url = `https://docs.google.com/spreadsheets/d/${sheetsId}/gviz/tq?tqx=out:csv&sheet=DATA_PESANAN_JASTIP`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        rows = parseCSV(text);
      }
    }

    if (rows.length < 2) return INITIAL_ORDERS;

    const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const dataRows = rows.slice(1);

    const getColIndex = (name: string) => {
      return headers.findIndex((h) => h.includes(name.toLowerCase()));
    };

    const idxInvoice = getColIndex('invoice');
    const idxWaktu = getColIndex('waktu');
    const idxCustomer = getColIndex('customer');
    const idxWhatsApp = getColIndex('whatsapp') !== -1 ? getColIndex('whatsapp') : getColIndex('hp');
    const idxWilayah = getColIndex('wilayah') !== -1 ? getColIndex('wilayah') : getColIndex('kecamatan');
    const idxAlamat = getColIndex('alamat');
    const idxToko = getColIndex('toko') !== -1 ? getColIndex('toko') : getColIndex('pasar');
    const idxKategori = getColIndex('kategori');
    const idxBarang = getColIndex('rincian') !== -1 ? getColIndex('rincian') : getColIndex('barang');
    const idxDriver = getColIndex('driver') !== -1 ? getColIndex('driver') : getColIndex('shopper');
    const idxModal = getColIndex('modal') !== -1 ? getColIndex('modal') : getColIndex('belanja');
    const idxFee = getColIndex('fee');
    const idxOngkir = getColIndex('ongkir');
    const idxTotal = getColIndex('total');
    const idxDP = getColIndex('dp');
    const idxPayStatus = getColIndex('pembayaran');
    const idxOrderStatus = getColIndex('pesanan') !== -1 ? getColIndex('pesanan') : getColIndex('status');
    const idxDurasiBelanja = getColIndex('durasibelanja');
    const idxDurasiAntar = getColIndex('durasiantar');
    const idxOnTime = getColIndex('ontime');

    const orders: JastipOrder[] = dataRows.map((row, i) => {
      const invoice = row[idxInvoice] || `INV-JST-${i + 1}`;
      const customer = row[idxCustomer] || `Pelanggan ${i + 1}`;
      const phone = row[idxWhatsApp] || '';
      const district = row[idxWilayah] || 'Jakarta';
      const address = row[idxAlamat] || district;
      const store = row[idxToko] || 'Toko Mitra';
      const category = row[idxKategori] || 'Umum';
      const itemsRaw = row[idxBarang] || 'Titipan Barang';
      const driver = row[idxDriver] || '';
      const goodsCost = parseIndonesianCurrency(row[idxModal]);
      const jastipFee = parseIndonesianCurrency(row[idxFee]);
      const shipping = parseIndonesianCurrency(row[idxOngkir]);
      const totalAmount = parseIndonesianCurrency(row[idxTotal]) || goodsCost + jastipFee + shipping;
      const deposit = parseIndonesianCurrency(row[idxDP]);
      const outstanding = Math.max(0, totalAmount - deposit);

      const rawOrderStatus = (row[idxOrderStatus] || '').toLowerCase();
      let status: OrderStatus = 'pending';
      if (rawOrderStatus.includes('selesai') || rawOrderStatus.includes('terima')) status = 'delivered';
      else if (rawOrderStatus.includes('kirim') || rawOrderStatus.includes('antar') || rawOrderStatus.includes('jalan')) status = 'delivering';
      else if (rawOrderStatus.includes('belanja')) status = 'shopping';
      else if (rawOrderStatus.includes('pack')) status = 'packing';
      else if (rawOrderStatus.includes('batal') || rawOrderStatus.includes('habis') || rawOrderStatus.includes('masalah')) status = 'issue';

      const rawPayStatus = (row[idxPayStatus] || '').toLowerCase();
      let payStatus: PaymentStatus = 'paid';
      if (rawPayStatus.includes('dp')) payStatus = 'dp';
      else if (rawPayStatus.includes('cod')) payStatus = 'cod';
      else if (rawPayStatus.includes('struk') || rawPayStatus.includes('pending')) payStatus = 'pending_receipt';
      else if (rawPayStatus.includes('lunas')) payStatus = 'paid';

      const shoppingMins = parseInt(row[idxDurasiBelanja]) || 30;
      const deliveryMins = parseInt(row[idxDurasiAntar]) || 20;
      const onTimeStr = (row[idxOnTime] || '').toLowerCase();
      const isOnTime = !onTimeStr.includes('terlambat');

      return {
        id: `ord-${i + 1}`,
        invoiceNumber: invoice,
        createdAt: row[idxWaktu] || new Date().toISOString(),
        customerName: customer,
        customerPhone: phone,
        deliveryAddress: address,
        district: district,
        storeName: store,
        storeCategory: category,
        driverName: driver,
        status: status,
        paymentStatus: payStatus,
        items: itemsRaw.split(',').map((itemStr, itemIdx) => ({
          id: `itm-${i}-${itemIdx}`,
          name: itemStr.trim(),
          category: category,
          quantity: 1,
          unit: 'pcs',
          estimatedPrice: goodsCost,
          actualPrice: goodsCost,
          jastipFee: jastipFee,
          status: 'purchased',
          storeName: store,
        })),
        totalGoodsCost: goodsCost,
        totalJastipFee: jastipFee,
        shippingFee: shipping,
        totalAmount: totalAmount,
        depositPaid: deposit,
        outstandingAmount: outstanding,
        verificationTimeMins: 5,
        shoppingTimeMins: shoppingMins,
        packingTimeMins: 10,
        deliveryTimeMins: deliveryMins,
        totalCycleTimeMins: 5 + shoppingMins + 10 + deliveryMins,
        targetSLATimeMins: 120,
        isOnTime: isOnTime,
      };
    });

    return orders.length > 0 ? orders : INITIAL_ORDERS;
  } catch (err) {
    console.error('Error fetching live Google Sheet data:', err);
    return INITIAL_ORDERS;
  }
}
