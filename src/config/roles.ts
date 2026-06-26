import { AdminRole, Permission, RolePermission } from '../types';

export const ROLE_PERMISSIONS: RolePermission[] = [
  {
    role: 'owner',
    permissions: [
      'view-dashboard', 'view-orders', 'update-orders',
      'view-products', 'manage-products', 'view-inventory', 'manage-inventory',
      'view-customers', 'manage-customers', 'view-reviews', 'manage-reviews',
      'view-coupons', 'manage-coupons', 'view-content', 'manage-content',
      'view-settings', 'manage-settings', 'view-users', 'manage-users', 'manage-staff',
      'view-audit-log',
    ],
  },
  {
    role: 'admin',
    permissions: [
      'view-dashboard', 'view-orders', 'update-orders',
      'view-products', 'manage-products', 'view-inventory', 'manage-inventory',
      'view-customers', 'manage-customers', 'view-reviews', 'manage-reviews',
      'view-coupons', 'manage-coupons', 'view-content', 'manage-content',
      'view-settings', 'view-users', 'manage-staff',
    ],
  },
  {
    role: 'moderator',
    permissions: [
      'view-dashboard', 'view-orders', 'view-products',
      'view-inventory', 'view-reviews', 'manage-reviews',
      'view-coupons', 'manage-coupons',
      'view-content', 'manage-content',
    ],
  },
  {
    role: 'order-manager',
    permissions: [
      'view-dashboard', 'view-orders', 'update-orders',
      'view-coupons', 'manage-coupons',
    ],
  },
  {
    role: 'inventory-manager',
    permissions: [
      'view-dashboard', 'view-products', 'manage-products', 'view-inventory', 'manage-inventory',
      'view-coupons', 'manage-coupons',
    ],
  },
];

export const ROLE_LABELS: Record<AdminRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  moderator: 'Moderator',
  'order-manager': 'Order Manager',
  'inventory-manager': 'Inventory Manager',
};

export const ROLE_LABELS_BN: Record<AdminRole, string> = {
  owner: 'মালিক',
  admin: 'অ্যাডমিন',
  moderator: 'মডারেটর',
  'order-manager': 'অর্ডার ম্যানেজার',
  'inventory-manager': 'ইনভেন্টরি ম্যানেজার',
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  const rolePermission = ROLE_PERMISSIONS.find(rp => rp.role === role);
  return rolePermission?.permissions.includes(permission) ?? false;
}

export function getPermissions(role: AdminRole): Permission[] {
  const rolePermission = ROLE_PERMISSIONS.find(rp => rp.role === role);
  return rolePermission?.permissions ?? [];
}
