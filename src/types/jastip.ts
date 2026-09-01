// Type definitions for SEMAR Jastip UMKM ERP Dashboard

export type OrderStatus =
  | 'pending'      // Menunggu Konfirmasi / Verifikasi
  | 'shopping'     // Sedang Dibelanjakan di Toko
  | 'packing'      // Sedang Disortir & Dipacking
  | 'delivering'   // Sedang Dikirim ke Customer
  | 'delivered'    // Selesai & Diterima
  | 'issue';       // Bermasalah (Stok Habis / Perlu Konfirmasi)

export type PaymentStatus =
  | 'paid'             // Lunas Penuh
  | 'dp'               // DP Sebagian (50%)
  | 'pending_receipt'  // Menunggu Pelunasan Struk Belanja
  | 'cod';             // Bayar Tunai di Tempat (COD)

export type DriverStatus = 'active' | 'shopping' | 'delivering' | 'standby' | 'off';

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  actualPrice?: number;
  jastipFee: number;
  status: 'pending' | 'purchased' | 'out_of_stock' | 'replaced';
  note?: string;
  storeName: string;
}

export interface JastipOrder {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  completedAt?: string;
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  deliveryAddress: string;
  district: string;
  storeName: string;
  storeCategory: string;
  driverId?: string;
  driverName?: string;
  driverAvatar?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  totalGoodsCost: number;     // Total harga barang
  totalJastipFee: number;     // Total fee jasa titip
  shippingFee: number;        // Ongkos kirim
  totalAmount: number;        // Total tagihan
  depositPaid: number;        // Uang muka / DP yang sudah dibayar
  outstandingAmount: number;  // Sisa yang harus dibayar
  // SLA & Waktu (dalam menit)
  verificationTimeMins: number;
  shoppingTimeMins: number;
  packingTimeMins: number;
  deliveryTimeMins: number;
  totalCycleTimeMins: number;
  targetSLATimeMins: number;
  isOnTime: boolean;
  notes?: string;
}

export interface DriverPerformance {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicle: 'Motor' | 'Mobil';
  licensePlate: string;
  status: DriverStatus;
  currentLocation: string;
  rating: number; // 1 - 5
  totalReviews: number;
  ordersCompletedToday: number;
  ordersCompletedMonth: number;
  activeOrdersCount: number;
  avgShoppingSpeedMins: number; // rata-rata waktu belanja per order
  avgDeliverySpeedMins: number; // rata-rata waktu antar
  onTimeDeliveryRate: number;   // e.g. 96.5%
  todayCommission: number;     // komisi driver hari ini (Rp)
  cashFloatHeld: number;        // uang kas talangan yang sedang dipegang (Rp)
  recentDeliveries: {
    orderId: string;
    store: string;
    customer: string;
    timeMins: number;
    isOnTime: boolean;
    rating: number;
  }[];
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  district: string;
  tier: 'VIP' | 'Regular' | 'New';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  favoriteCategories: string[];
  favoriteStores: string[];
  csatRating: number;
  paymentPreference: 'QRIS' | 'Bank Transfer' | 'COD';
}

export interface StoreMarket {
  id: string;
  name: string;
  location: string;
  category: string;
  totalOrders: number;
  totalGMV: number;
  fulfillmentRate: number; // % barang berhasil didapat
  avgShoppingMins: number;
  popularItems: string[];
}

export interface TimeSLABreakdown {
  stage: string;
  targetMins: number;
  actualMins: number;
  status: 'optimal' | 'warning' | 'delayed';
  description: string;
}

export interface HourlyOrderPattern {
  hour: string;
  ordersCount: number;
  gmv: number;
  isPeak: boolean;
}

export interface FinancialOverview {
  totalGMV: number;
  totalJastipFee: number;
  totalShippingRevenue: number;
  netRevenue: number;
  netMarginPercentage: number;
  activeTalanganCash: number;
  unsettledInvoicesCount: number;
  unsettledAmount: number;
  settledTodayAmount: number;
}
