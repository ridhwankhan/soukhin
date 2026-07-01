// Product Types
export interface Product {
  id: string;
  name: string;
  nameBn: string;
  category: CategorySlug;
  price: number;
  salePrice?: number;
  images: string[];
  stock: number;
  sku: string;
  description: string;
  descriptionBn?: string;
  sizeOptions?: string[];
  colorOptions?: string[];
  foodNote?: string;
  deliveryNote?: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  badges: ProductBadge[];
  createdAt: string;
  updatedAt: string;
}

export type ProductBadge =
  | 'new'
  | 'eid-collection'
  | 'best-seller'
  | 'pre-order'
  | 'featured'
  | 'sale'
  | 'limited-edition';

export const PRODUCT_BADGE_LABELS: Record<ProductBadge, string> = {
  'new': 'New',
  'eid-collection': 'Eid',
  'best-seller': 'Best Seller',
  'pre-order': 'Pre-order',
  'featured': 'Featured',
  'sale': 'Sale',
  'limited-edition': 'Limited',
};

export type CategorySlug =
  | 'wearables'
  | 'home-living'
  | 'food-pitha'
  | 'jewelry'
  | 'gifts'
  | 'new-arrivals'
  | 'women-three-piece'
  | 'women-dresses'
  | 'women-sarees'
  | 'women-kurtis'
  | 'women-shawls'
  | 'men-panjabi'
  | 'men-shirts'
  | 'men-tshirts'
  | 'men-waistcoats'
  | 'kids-girls'
  | 'kids-boys'
  | 'kids-baby'
  | 'accessories-bags'
  | 'accessories-scarves'
  | 'accessories-watches'
  | 'home-sheets'
  | 'home-cushions'
  | 'home-curtains'
  | 'home-runners'
  | 'home-towels'
  | 'home-decor'
  | 'jewelry-earrings'
  | 'jewelry-necklaces'
  | 'jewelry-bangles'
  | 'jewelry-rings'
  | 'jewelry-bridal'
  | '3d-prints'
  | '3d-bookmarks'
  | '3d-character-models'
  | '3d-coasters'
  | '3d-printed-gifts'
  | '3d-keyrings'
  | '3d-wall-decor'
  | 'bedsheets'
  | '2d-art'
  | 'dp-covers'
  | '3d-models'
  | '3d-night-lights';

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  nameBn: string;
  description: string;
  image: string;
  productCount: number;
  parentId?: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

// Order Types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready-to-deliver'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type OrderLabel =
  | 'very-important'
  | 'urgent'
  | 'gift'
  | 'fragile'
  | 'pre-order'
  | 'vip';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod =
  | 'bkash'
  | 'nagad'
  | 'rocket'
  | 'cod'
  | 'bank-transfer'
  | 'card';

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface ShippingInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  area: string;
  notes?: string;
}

export interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
  estimatedDays: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  shipping: ShippingInfo;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  adminNotes?: string;
  paymentTransactionId?: string;
  isManualOrder?: boolean;
  createdByAdminId?: string;
  createdByAdminName?: string;
  completedAt?: string;
  purgeAfter?: string;
  estimatedDelivery?: string;
  orderLabels?: OrderLabel[];
  socialLink?: string;
  createdAt: string;
  updatedAt: string;
}

// Customer Auth Types
export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
}

// Admin Types
export type AdminRole =
  | 'owner'
  | 'admin'
  | 'moderator'
  | 'order-manager'
  | 'inventory-manager';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface RolePermission {
  role: AdminRole;
  permissions: Permission[];
}

export type Permission =
  | 'view-dashboard'
  | 'view-orders'
  | 'update-orders'
  | 'create-manual-orders'
  | 'update-order-details'
  | 'view-products'
  | 'manage-products'
  | 'view-inventory'
  | 'manage-inventory'
  | 'view-customers'
  | 'manage-customers'
  | 'send-customer-notifications'
  | 'view-reviews'
  | 'manage-reviews'
  | 'view-coupons'
  | 'manage-coupons'
  | 'view-content'
  | 'manage-content'
  | 'view-settings'
  | 'manage-settings'
  | 'view-users'
  | 'manage-users'
  | 'manage-staff'
  | 'view-audit-log';

export type CustomerNotificationType = 'general' | 'voucher' | 'promo';

export interface CustomerNotification {
  id: string;
  title: string;
  body: string;
  notificationType: CustomerNotificationType;
  couponCode?: string;
  isRead: boolean;
  emailSent: boolean;
  sentBy?: string;
  createdAt: string;
}

// Announcement Type
export interface Announcement {
  id: string;
  text: string;
  textBn?: string;
  link?: string;
  isActive: boolean;
  bgColor: 'green' | 'gold' | 'terracotta' | 'dark';
  createdAt: string;
  updatedAt: string;
}

// Content Types
export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
}

export interface HeroContent {
  title: string;
  titleBn: string;
  subtitle: string;
  subtitleBn: string;
}

export interface SiteSettings {
  hero: HeroContent;
  announcementBar: string;
  announcementBarBn: string;
  whatsappNumber: string;
  facebookLink: string;
  instagramLink: string;
  logo: string;
  footerText: string;
}

// Payment Config Types
export interface PaymentConfig {
  bkash: { merchantId: string; apiKey: string; enabled: boolean };
  nagad: { merchantId: string; apiKey: string; enabled: boolean };
  rocket: { merchantId: string; apiKey: string; enabled: boolean };
  card: { gatewayPublicKey: string; enabled: boolean };
  cod: { enabled: boolean };
  bankTransfer: { enabled: boolean; accountDetails: string };
}

// Delivery Config Types
export interface DeliveryConfig {
  insideDhaka: { fee: number; estimatedDays: string };
  outsideDhaka: { fee: number; estimatedDays: string };
  pickup: { enabled: boolean; address: string };
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isApproved: boolean;
  createdAt: string;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  orders: number;
  totalSpent: number;
  createdAt: string;
}

// Message/Inquiry Types
export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

// Stats Types
export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  bestSellingProducts: Product[];
  revenueByCategory: { category: string; revenue: number }[];
  paymentMethodBreakdown: { method: PaymentMethod; count: number }[];
}

// Filter/Sort Types
export type SortOption = 'newest' | 'popular' | 'price-low-high' | 'price-high-low';

export interface ProductFilters {
  category?: CategorySlug;
  priceMin?: number;
  priceMax?: number;
  badges?: ProductBadge[];
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  search?: string;
}
