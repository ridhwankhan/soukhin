import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Tags, Image,
  MessageSquare, Settings, ChevronDown, Menu, X, LogOut, Bell,
  Search, Box, Star, Ticket, FileText, UserCog, Megaphone, Tag,
} from 'lucide-react';
import { adminUsers } from '../data';
import { ROLE_LABELS, hasPermission } from '../config';
import { AdminRole, Permission } from '../types';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin', exact: true, permissions: ['view-dashboard'] as Permission[] },
  { label: 'Orders', icon: ShoppingBag, href: '/admin/orders', permissions: ['view-orders'] as Permission[] },
  { label: 'Products', icon: Package, href: '/admin/products', permissions: ['view-products'] as Permission[] },
  { label: 'Inventory', icon: Box, href: '/admin/inventory', permissions: ['view-inventory'] as Permission[] },
  { label: 'Categories', icon: Tags, href: '/admin/categories', permissions: ['view-products'] as Permission[] },
  { label: 'Customers', icon: Users, href: '/admin/customers', permissions: ['view-customers'] as Permission[] },
  { label: 'Reviews', icon: Star, href: '/admin/reviews', permissions: ['view-reviews'] as Permission[] },
  { label: 'Coupons', icon: Ticket, href: '/admin/coupons', permissions: ['view-coupons'] as Permission[] },
  {
    label: 'Content', icon: Image, permissions: ['view-content'] as Permission[],
    children: [
      { label: 'Announcements', href: '/admin/announcements' },
      { label: 'Product Labels', href: '/admin/product-labels' },
      { label: 'Banners', href: '/admin/banners' },
    ],
  },
  { label: 'Messages', icon: MessageSquare, href: '/admin/messages', permissions: ['view-content'] as Permission[] },
  {
    label: 'Settings', icon: Settings, permissions: ['view-settings'] as Permission[],
    children: [
      { label: 'Payment', href: '/admin/settings/payment' },
      { label: 'Delivery', href: '/admin/settings/delivery' },
      { label: 'Store', href: '/admin/settings/store' },
    ],
  },
  { label: 'Users', icon: UserCog, href: '/admin/users', permissions: ['view-users'] as Permission[] },
  { label: 'Audit Log', icon: FileText, href: '/admin/audit-log', permissions: ['view-audit-log'] as Permission[] },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Content']);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!admin) navigate('/admin/login', { replace: true });
  }, [admin, navigate]);

  if (!admin) return null;

  const user = admin;

  const toggleExpand = (label: string) =>
    setExpandedItems(prev => prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]);

  const canAccess = (permissions: Permission[]): boolean =>
    permissions.some(p => hasPermission(user.role, p));

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-[#1B4332] text-white z-30 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {sidebarOpen && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#9A7535] flex items-center justify-center">
                <span className="text-white font-serif font-bold">শ</span>
              </div>
              <span className="font-semibold text-sm">Soukhin Admin</span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-white/10 rounded">
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
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors ${sidebarOpen ? '' : 'justify-center'}`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedItems.includes(item.label) ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>
                  {sidebarOpen && expandedItems.includes(item.label) && (
                    <div className="py-1 pl-12 pr-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={`block py-2 text-sm hover:text-[#B8860B] transition-colors ${location.pathname === child.href ? 'text-[#B8860B]' : 'text-white/70'}`}
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
                className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-sm ${isActive ? 'bg-white/10 border-r-2 border-[#B8860B]' : ''} ${sidebarOpen ? '' : 'justify-center'}`}
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
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A9A]" />
              <input type="text" placeholder="Search…"
                className="pl-10 pr-4 py-2 bg-[#F8F6F3] border border-[#E2D9CF] text-sm focus:outline-none focus:border-[#1B4332] w-56 transition-colors" />
            </div>

            <div className="flex items-center gap-3">
              {/* View store */}
              <Link to="/" className="text-xs text-[#7A7A7A] hover:text-[#1B4332] transition-colors hidden md:block">
                ← View Store
              </Link>

              <button className="relative p-2 hover:bg-[#F5F0E8] transition-colors">
                <Bell className="w-5 h-5 text-[#7A7A7A]" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#B5603E] rounded-full" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 hover:bg-[#F5F0E8] transition-colors"
                >
                  <div className="w-8 h-8 bg-[#1B4332] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-[#1A1A1A] leading-tight">{user.name}</p>
                    <p className="text-xs text-[#9A9A9A] leading-tight">{ROLE_LABELS[user.role]}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9A9A9A]" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-[#E2D9CF] shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2.5 border-b border-[#F0EBE3]">
                        <p className="text-xs font-semibold text-[#1A1A1A]">{user.name}</p>
                        <p className="text-xs text-[#9A9A9A]">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#B5603E] hover:bg-[#FEF4EF] transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
