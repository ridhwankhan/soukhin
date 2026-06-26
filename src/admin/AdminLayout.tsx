import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tags,
  Image,
  MessageSquare,
  CreditCard,
  Truck,
  Settings,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Search,
  Box,
  Star,
  Ticket,
  FileText,
  UserCog
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import NotificationPanel from './components/NotificationPanel';
import { ROLE_LABELS } from '../config';
import { Permission } from '../types';

const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
    exact: true,
    permissions: ['view-dashboard'] as Permission[],
  },
  {
    label: 'Orders',
    icon: ShoppingBag,
    href: '/admin/orders',
    permissions: ['view-orders'] as Permission[],
  },
  {
    label: 'Products',
    icon: Package,
    href: '/admin/products',
    permissions: ['view-products'] as Permission[],
  },
  {
    label: 'Inventory',
    icon: Box,
    href: '/admin/inventory',
    permissions: ['view-inventory'] as Permission[],
  },
  {
    label: 'Categories',
    icon: Tags,
    href: '/admin/categories',
    permissions: ['view-products'] as Permission[],
  },
  {
    label: 'Customers',
    icon: Users,
    href: '/admin/customers',
    permissions: ['view-customers'] as Permission[],
  },
  {
    label: 'Reviews',
    icon: Star,
    href: '/admin/reviews',
    permissions: ['view-reviews'] as Permission[],
  },
  {
    label: 'Coupons',
    icon: Ticket,
    href: '/admin/coupons',
    permissions: ['view-coupons'] as Permission[],
  },
  {
    label: 'Content',
    icon: Image,
    permissions: ['view-content'] as Permission[],
    children: [
      { label: 'Banners', href: '/admin/banners' },
      { label: 'Hero Section', href: '/admin/hero' },
      { label: 'Announcements', href: '/admin/announcements' },
    ],
  },
  {
    label: 'Messages',
    icon: MessageSquare,
    href: '/admin/messages',
    permissions: ['view-content'] as Permission[],
  },
  {
    label: 'Settings',
    icon: Settings,
    permissions: ['view-settings'] as Permission[],
    children: [
      { label: 'Payment', href: '/admin/settings/payment' },
      { label: 'Delivery', href: '/admin/settings/delivery' },
      { label: 'Store', href: '/admin/settings/store' },
    ],
  },
  {
    label: 'Users',
    icon: UserCog,
    href: '/admin/users',
    permissions: ['view-users'] as Permission[],
  },
  {
    label: 'Audit Log',
    icon: FileText,
    href: '/admin/audit-log',
    permissions: ['view-audit-log'] as Permission[],
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const { admin, signOut, can } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (!admin) {
    return null;
  }

  const user = admin;

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const canAccess = (permissions: Permission[]): boolean => {
    return permissions.some((p) => can(p));
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-accent text-white z-30 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {sidebarOpen && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#B8860B] rounded-sm flex items-center justify-center">
                <span className="text-white font-serif font-bold">শ</span>
              </div>
              <span className="font-semibold">Soukhin Admin</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-muted rounded"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="py-4 h-[calc(100vh-80px)] overflow-y-auto">
          {navItems.map((item) => {
            if (!canAccess(item.permissions)) return null;

            const isActive = item.exact
              ? location.pathname === item.href
              : item.href
              ? location.pathname.startsWith(item.href)
              : item.children?.some(c => location.pathname.startsWith(c.href));

            if (item.children) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors ${
                      sidebarOpen ? '' : 'justify-center'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedItems.includes(item.label) ? 'rotate-180' : ''
                          }`}
                        />
                      </>
                    )}
                  </button>
                  {sidebarOpen && expandedItems.includes(item.label) && (
                    <div className="py-1 pl-12 pr-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={`block py-2 text-sm hover:text-[#B8860B] transition-colors ${
                            location.pathname === child.href ? 'text-[#B8860B]' : 'text-white/70'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href!}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors ${
                  isActive ? 'bg-elevated/10 border-r-2 border-[#B8860B]' : ''
                } ${sidebarOpen ? '' : 'justify-center'}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-elevated shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-secondary" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-canvas border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationPanel />

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 hover:bg-surface rounded-sm"
                >
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-ink">{user.name}</p>
                    <p className="text-xs text-ink-secondary">{ROLE_LABELS[user.role]}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-ink-secondary" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-elevated rounded-lg shadow-lg border border-line py-2"
                    >
                      <Link
                        to="/"
                        className="block px-4 py-2 text-sm text-ink-secondary hover:bg-surface"
                      >
                        View Store
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-[#C2704A] hover:bg-surface"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
