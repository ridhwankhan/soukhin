import { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../types';

export const orders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'SK-2024-001',
    items: [
      { product: { id: 'prod-1', name: 'Cotton Kameez', price: 1250 } as any, quantity: 2, price: 1250, size: 'M', color: 'Mint Green' },
    ],
    shipping: {
      name: 'Fatima Rahman',
      phone: '01712345678',
      email: 'fatima@example.com',
      address: '45/B, Road 12, Dhanmondi',
      area: 'inside-dhaka',
      notes: 'Please call before delivery',
    },
    paymentMethod: 'bkash',
    paymentStatus: 'paid',
    status: 'delivered',
    subtotal: 2500,
    deliveryFee: 60,
    total: 2560,
    adminNotes: 'Customer requested gift wrapping',
    createdAt: '2024-06-20T10:30:00',
    updatedAt: '2024-06-22T14:00:00',
  },
  {
    id: 'ord-2',
    orderNumber: 'SK-2024-002',
    items: [
      { product: { id: 'prod-4', name: 'Designer Three Piece', price: 3800 } as any, quantity: 1, price: 3800, size: 'L', color: 'Maroon' },
      { product: { id: 'prod-10', name: 'Cookies Box', price: 450 } as any, quantity: 2, price: 450 },
    ],
    shipping: {
      name: 'Ayesha Khan',
      phone: '01898765432',
      address: '78, Sector 3, Uttara',
      area: 'inside-dhaka',
    },
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'processing',
    subtotal: 4700,
    deliveryFee: 60,
    total: 4760,
    createdAt: '2024-06-23T15:45:00',
    updatedAt: '2024-06-23T15:45:00',
  },
  {
    id: 'ord-3',
    orderNumber: 'SK-2024-003',
    items: [
      { product: { id: 'prod-13', name: 'Eid Gift Hamper', price: 2500 } as any, quantity: 3, price: 2500 },
    ],
    shipping: {
      name: 'Nusrat Islam',
      phone: '01912345678',
      email: 'nusrat@email.com',
      address: '23, Station Road, Chittagong',
      area: 'outside-dhaka',
    },
    paymentMethod: 'nagad',
    paymentStatus: 'paid',
    status: 'confirmed',
    subtotal: 7500,
    deliveryFee: 120,
    total: 7620,
    createdAt: '2024-06-24T09:20:00',
    updatedAt: '2024-06-24T10:00:00',
  },
  {
    id: 'ord-4',
    orderNumber: 'SK-2024-004',
    items: [
      { product: { id: 'prod-7', name: 'Pitha Box', price: 850 } as any, quantity: 2, price: 850 },
    ],
    shipping: {
      name: 'Salma Begum',
      phone: '01612345678',
      address: '56, Main Road, Sylhet',
      area: 'outside-dhaka',
      notes: 'Birthday gift, please include a card',
    },
    paymentMethod: 'bkash',
    paymentStatus: 'paid',
    status: 'ready-to-deliver',
    subtotal: 1700,
    deliveryFee: 120,
    total: 1820,
    adminNotes: 'Added birthday card as requested',
    createdAt: '2024-06-24T12:00:00',
    updatedAt: '2024-06-25T09:30:00',
  },
  {
    id: 'ord-5',
    orderNumber: 'SK-2024-005',
    items: [
      { product: { id: 'prod-6', name: 'Eid Collection Three Piece', price: 6500 } as any, quantity: 1, price: 6500, size: 'M' },
    ],
    shipping: {
      name: 'Tahmina Akter',
      phone: '01512345678',
      email: 'tahmina@email.com',
      address: '12, Road 5, Banani',
      area: 'inside-dhaka',
    },
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'pending',
    subtotal: 6500,
    deliveryFee: 60,
    total: 6560,
    createdAt: '2024-06-25T08:15:00',
    updatedAt: '2024-06-25T08:15:00',
  },
  {
    id: 'ord-6',
    orderNumber: 'SK-2024-006',
    items: [
      { product: { id: 'prod-16', name: 'Cotton Printed Kurti', price: 1650 } as any, quantity: 2, price: 1650, size: 'M', color: 'Lilac' },
      { product: { id: 'prod-17', name: 'Clay Jewelry Set', price: 850 } as any, quantity: 1, price: 850 },
    ],
    shipping: {
      name: 'Rashida Chowdhury',
      phone: '01412345678',
      address: '89, Lake Road, Mohammadpur',
      area: 'inside-dhaka',
    },
    paymentMethod: 'rocket',
    paymentStatus: 'paid',
    status: 'confirmed',
    subtotal: 4150,
    deliveryFee: 60,
    total: 4210,
    createdAt: '2024-06-25T10:30:00',
    updatedAt: '2024-06-25T11:00:00',
  },
  {
    id: 'ord-7',
    orderNumber: 'SK-2024-007',
    items: [
      { product: { id: 'prod-3', name: 'Festive Kurti', price: 1850 } as any, quantity: 1, price: 1850, size: 'S' },
    ],
    shipping: {
      name: 'Maria Ahmed',
      phone: '01312345678',
      address: 'Pickup from Soukhin Store',
      area: 'pickup',
    },
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'cancelled',
    subtotal: 1850,
    deliveryFee: 0,
    total: 1850,
    adminNotes: 'Customer cancelled - changed mind',
    createdAt: '2024-06-22T14:00:00',
    updatedAt: '2024-06-23T16:00:00',
  },
];

export function getOrdersByStatus(status: OrderStatus): Order[] {
  return orders.filter(o => o.status === status);
}

export function getRecentOrders(limit: number = 5): Order[] {
  return [...orders].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, limit);
}

export function getOrderStats() {
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    readyToDeliver: orders.filter(o => o.status === 'ready-to-deliver').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    refunded: orders.filter(o => o.status === 'refunded').length,
  };
}

export function getRevenueStats() {
  const delivered = orders.filter(o => o.status === 'delivered' && o.paymentStatus === 'paid');
  return {
    totalRevenue: delivered.reduce((sum, o) => sum + o.total, 0),
    averageOrderValue: delivered.length > 0
      ? delivered.reduce((sum, o) => sum + o.total, 0) / delivered.length
      : 0,
  };
}

export function getPaymentMethodBreakdown() {
  const methodCounts: Record<PaymentMethod, number> = {
    bkash: 0, nagad: 0, rocket: 0, cod: 0, 'bank-transfer': 0, card: 0,
  };
  orders.forEach(o => { methodCounts[o.paymentMethod]++; });
  return Object.entries(methodCounts).map(([method, count]) => ({ method: method as PaymentMethod, count }));
}
