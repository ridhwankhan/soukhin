import { DeliveryConfig, DeliveryArea } from '../types';

export const DELIVERY_CONFIG: DeliveryConfig = {
  insideDhaka: {
    fee: 60,
    estimatedDays: '1-2',
  },
  outsideDhaka: {
    fee: 120,
    estimatedDays: '3-5',
  },
  pickup: {
    enabled: true,
    address: 'Soukhin Store, [Address], Dhaka, Bangladesh',
  },
};

export const DELIVERY_AREAS: DeliveryArea[] = [
  { id: 'inside-dhaka', name: 'Inside Dhaka', fee: 60, estimatedDays: '1-2 business days' },
  { id: 'outside-dhaka', name: 'Outside Dhaka', fee: 120, estimatedDays: '3-5 business days' },
  { id: 'pickup', name: 'Store Pickup', fee: 0, estimatedDays: 'Same day' },
];

export const FOOD_DELIVERY_NOTE_BN = 'খাবার আইটেমের জন্য প্রি-অর্ডার করা সুপারিশ করা হয়।';
export const FOOD_DELIVERY_NOTE = 'Pre-order is recommended for food items.';
