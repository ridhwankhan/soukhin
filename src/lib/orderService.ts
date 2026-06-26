import { CartItem, Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus, ShippingInfo } from '../types';
import { supabase } from './supabase';
import { checkClientRateLimit, formatRetryAfter, isRateLimitError } from './rateLimit';

export interface CreateOrderInput {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingAreaSlug: string;
  shippingAreaLabel: string;
  shippingNotes?: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
}

interface DbOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  shipping_area: string;
  shipping_notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_transaction_id: string | null;
  status: OrderStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  items?: DbOrderItemRow[];
}

interface DbOrderItemRow {
  id?: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_size: string | null;
  selected_color: string | null;
}

function mapDbOrder(row: DbOrderRow): Order {
  const items: OrderItem[] = (row.items ?? []).map((item) => ({
    product: {
      id: item.product_id ?? item.product_name,
      name: item.product_name,
      nameBn: '',
      category: 'wearables',
      price: item.unit_price,
      images: [],
      stock: 0,
      sku: item.product_sku ?? '',
      description: '',
      tags: [],
      isActive: true,
      isFeatured: false,
      badges: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    quantity: item.quantity,
    price: item.unit_price,
    size: item.selected_size ?? undefined,
    color: item.selected_color ?? undefined,
  }));

  const shipping: ShippingInfo = {
    name: row.customer_name,
    phone: row.customer_phone,
    email: row.customer_email ?? undefined,
    address: row.shipping_address,
    area: row.shipping_area,
    notes: row.shipping_notes ?? undefined,
  };

  return {
    id: row.id,
    orderNumber: row.order_number,
    items,
    shipping,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    adminNotes: row.admin_notes ?? undefined,
    paymentTransactionId: row.payment_transaction_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createOrder(input: CreateOrderInput): Promise<{
  orderNumber: string;
  orderId: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
}> {
  const payload = {
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_email: input.customerEmail,
    shipping_address: input.shippingAddress,
    shipping_area_slug: input.shippingAreaSlug,
    shipping_area_label: input.shippingAreaLabel,
    shipping_notes: input.shippingNotes ?? '',
    payment_method: input.paymentMethod,
    items: input.items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      selected_size: item.selectedSize ?? '',
      selected_color: item.selectedColor ?? '',
    })),
  };

  const { data, error } = await supabase.rpc('create_order_secure', { p_payload: payload });
  if (error) throw error;

  const result = data as {
    orderId: string;
    orderNumber: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
  };

  return {
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    subtotal: result.subtotal,
    deliveryFee: result.deliveryFee,
    total: result.total,
  };
}

export async function fetchAdminOrders(
  search?: string,
  status?: string,
  paymentStatus?: string
): Promise<Order[]> {
  const { data, error } = await supabase.rpc('list_orders_admin', {
    p_search: search || null,
    p_status: status || null,
    p_payment_status: paymentStatus || null,
    p_limit: 200,
  });
  if (error) throw error;
  return ((data as DbOrderRow[]) ?? []).map(mapDbOrder);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.rpc('update_order_status_admin', {
    p_order_id: orderId,
    p_status: status,
  });
  if (error) throw error;
}

export async function fetchCustomerOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase.rpc('get_customer_orders', { p_user_id: userId });
  if (error) throw error;

  return ((data as DbOrderRow[]) ?? []).map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    items: [],
    shipping: {
      name: '',
      phone: '',
      address: '',
      area: row.shipping_area ?? '',
    },
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    subtotal: 0,
    deliveryFee: 0,
    total: row.total,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function trackOrder(orderNumber: string, phone: string): Promise<Order | null> {
  const clientLimit = checkClientRateLimit('track_order', 10, 60 * 60 * 1000);
  if (!clientLimit.allowed) {
    throw new Error(`rate_limit: Try again in ${formatRetryAfter(clientLimit.retryAfterMs)}`);
  }

  const { data, error } = await supabase.rpc('track_order', {
    p_order_number: orderNumber.trim(),
    p_phone: phone.trim(),
  });
  if (error) {
    if (isRateLimitError(error)) {
      throw new Error('rate_limit: Too many lookup attempts. Please wait and try again.');
    }
    throw error;
  }
  if (!data) return null;
  return mapDbOrder(data as DbOrderRow);
}

export async function completeOrderPayment(
  orderId: string,
  transactionId: string,
  paymentStatus: PaymentStatus = 'paid'
): Promise<void> {
  const { error } = await supabase.rpc('complete_order_payment', {
    p_order_id: orderId,
    p_transaction_id: transactionId,
    p_payment_status: paymentStatus,
  });
  if (error) throw error;
}

export interface TrackedOrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentTransactionId?: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export function getOrderStatusSteps(status: OrderStatus): { label: string; done: boolean; current: boolean }[] {
  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'ready-to-deliver', label: 'Ready to Deliver' },
    { key: 'delivered', label: 'Delivered' },
  ];

  if (status === 'cancelled' || status === 'refunded') {
    return [{ label: status === 'cancelled' ? 'Cancelled' : 'Refunded', done: true, current: true }];
  }

  const statusOrder = steps.map((s) => s.key);
  const currentIndex = statusOrder.indexOf(status);

  return steps.map((step, index) => ({
    label: step.label,
    done: index < currentIndex || status === 'delivered',
    current: index === currentIndex,
  }));
}
