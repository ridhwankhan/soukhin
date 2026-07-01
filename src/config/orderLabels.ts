import { OrderLabel } from '../types';

export const ORDER_LABEL_OPTIONS: { id: OrderLabel; label: string; className: string }[] = [
  { id: 'very-important', label: 'Very Important', className: 'bg-red-100 text-red-700' },
  { id: 'urgent', label: 'Urgent', className: 'bg-orange-100 text-orange-700' },
  { id: 'gift', label: 'Gift', className: 'bg-purple-100 text-purple-700' },
  { id: 'fragile', label: 'Fragile', className: 'bg-blue-100 text-blue-700' },
  { id: 'pre-order', label: 'Pre-order', className: 'bg-amber-100 text-amber-700' },
  { id: 'vip', label: 'VIP Customer', className: 'bg-yellow-100 text-yellow-800' },
];

export function getOrderLabelMeta(id: OrderLabel) {
  return ORDER_LABEL_OPTIONS.find((o) => o.id === id);
}
