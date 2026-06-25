import { AdminUser } from '../types';

export const adminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'owner@soukhin.com',
    name: 'Fatima Rahman',
    role: 'owner',
    avatar: 'https://images.pexels.com/photos/7749091/pexels-photo-7749095.jpeg',
    createdAt: '2024-01-01',
    lastLogin: '2024-06-25T09:00:00',
  },
  {
    id: 'admin-2',
    email: 'admin@soukhin.com',
    name: 'Ayesha Khan',
    role: 'admin',
    createdAt: '2024-01-15',
    lastLogin: '2024-06-25T08:30:00',
  },
  {
    id: 'admin-3',
    email: 'mod@soukhin.com',
    name: 'Karim Hassan',
    role: 'moderator',
    createdAt: '2024-02-10',
    lastLogin: '2024-06-24T16:00:00',
  },
  {
    id: 'admin-4',
    email: 'orders@soukhin.com',
    name: 'Nadia Islam',
    role: 'order-manager',
    createdAt: '2024-03-01',
    lastLogin: '2024-06-25T07:45:00',
  },
  {
    id: 'admin-5',
    email: 'inventory@soukhin.com',
    name: 'Rafiq Ahmed',
    role: 'inventory-manager',
    createdAt: '2024-03-15',
    lastLogin: '2024-06-24T11:00:00',
  },
];

// Demo passwords — used by AuthContext for role-based admin login
export const ADMIN_PASSWORDS: Record<string, string> = {
  'owner@soukhin.com': 'owner123',
  'admin@soukhin.com': 'admin123',
  'mod@soukhin.com': 'mod123',
  'orders@soukhin.com': 'orders123',
  'inventory@soukhin.com': 'inv123',
};

// Legacy export — retained for compatibility; auth state now comes from AuthContext
export const currentAdmin: AdminUser = adminUsers[0];
