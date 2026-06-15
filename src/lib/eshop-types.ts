// Client-safe shared types & constants (no server-only imports here, so this
// can be imported from both admin UI and storefront).

export const ORDER_STATUSES = ["nová", "zaplacená", "odeslaná", "doručená", "zrušená"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PRODUCT_TYPES = [
  "Galusky",
  "Plášťovky",
  "Pláště",
  "Bezdušové TR",
  "Příslušenství",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export type Category = {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  sort: number;
  group_key: string;
  created_at: string;
  product_count?: number;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  type: string;
  category_id: number | null;
  category_name?: string | null;
  price: number;
  training: number;
  racing: number;
  stock: number;
  image: string | null;
  description: string | null;
  color: string | null;
  ean: string | null;
  vat_rate: number;
  weight: number | null;
  unit: string;
  brand: string | null;
  abra_id: string | null;
  featured: number;
  active: number;
  created_at: string;
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  ico: string | null;
  dic: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  created_at: string;
  order_count?: number;
  total_spent?: number;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  id: number;
  order_number: string;
  customer_id: number | null;
  customer_name?: string | null;
  customer_email?: string | null;
  status: OrderStatus;
  total: number;
  shipping: number;
  delivery_method: string | null;
  payment_method: string | null;
  note: string | null;
  abra_id: string | null;
  abra_synced: number;
  created_at: string;
  items_count?: number;
  items?: OrderItem[];
};

export type User = {
  id: number;
  email: string;
  name: string | null;
  company: string | null;
  active: number;
  created_at: string;
};

export type ShopSettings = {
  shopName: string;
  email: string;
  phone: string;
  vatRates: number[];
  deliveryMethods: { name: string; price: number }[];
  paymentMethods: string[];
  abra: { url: string; company: string; username: string; enabled: boolean };
};

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: "TUFO s.r.o.",
  email: "tufo@tufo.cz",
  phone: "+420 415 710 811",
  vatRates: [21, 12, 0],
  deliveryMethods: [
    { name: "PPL", price: 99 },
    { name: "Zásilkovna", price: 69 },
    { name: "Osobní odběr", price: 0 },
  ],
  paymentMethods: ["Dobírka", "Bankovní převod", "Platební karta"],
  abra: { url: "", company: "", username: "", enabled: false },
};

export type DashboardStats = {
  revenue: number;
  orderCount: number;
  customerCount: number;
  productCount: number;
  avgOrderValue: number;
  pendingOrders: number;
  lowStockCount: number;
  statusCounts: { status: OrderStatus; count: number }[];
  revenueByDay: { day: string; revenue: number; orders: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  revenueByType: { type: string; revenue: number }[];
  lowStock: { id: number; name: string; sku: string; stock: number }[];
  recentOrders: Order[];
};
