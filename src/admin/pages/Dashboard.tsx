import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { fetchDashboardSummary, DashboardSummary } from '../../lib/dashboardService';
import { fetchAdminOrders } from '../../lib/orderService';
import { getLowStockProducts } from '../../data';
import CategoryRevenueChart from '../components/CategoryRevenueChart';
import { Order } from '../../types';

export default function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const lowStockProducts = getLowStockProducts();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [stats, orders] = await Promise.all([
          fetchDashboardSummary(),
          fetchAdminOrders(undefined, undefined, undefined),
        ]);
        setSummary(stats);
        setRecentOrders(orders.slice(0, 5));
      } catch {
        setSummary(null);
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = summary?.statusCounts ?? {
    pending: 0, confirmed: 0, processing: 0, 'ready-to-deliver': 0, delivered: 0, cancelled: 0, refunded: 0,
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: `৳${(summary?.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Total Orders',
      value: summary?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Pending Orders',
      value: summary?.pendingOrders ?? 0,
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Customers',
      value: summary?.totalCustomers ?? 0,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const orderStatusCards = [
    { label: 'Pending', value: stats.pending ?? 0, icon: Clock, color: 'bg-amber-500' },
    { label: 'Confirmed', value: stats.confirmed ?? 0, icon: CheckCircle, color: 'bg-blue-500' },
    { label: 'Processing', value: stats.processing ?? 0, icon: Package, color: 'bg-indigo-500' },
    { label: 'Ready', value: stats['ready-to-deliver'] ?? 0, icon: CheckCircle, color: 'bg-teal-500' },
    { label: 'Delivered', value: stats.delivered ?? 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Cancelled', value: stats.cancelled ?? 0, icon: XCircle, color: 'bg-red-500' },
  ];

  const paymentBreakdown = summary?.paymentBreakdown ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-ink-secondary">
            {loading ? 'Loading live data...' : 'Live store overview'}
          </p>
        </div>
        <div className="text-sm text-ink-secondary">
          Last updated: {new Date().toLocaleString('en-GB')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-elevated rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-ink-secondary">{stat.label}</p>
                <p className="text-2xl font-semibold text-ink mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <CategoryRevenueChart />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-elevated rounded-lg p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-ink mb-4">Order Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {orderStatusCards.map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 bg-canvas rounded-lg">
              <div className={`p-2 rounded-lg ${item.color}`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-ink">{item.value}</p>
                <p className="text-xs text-ink-secondary">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-elevated rounded-lg shadow-sm"
        >
          <div className="p-4 border-b border-line flex items-center justify-between">
            <h2 className="font-semibold text-ink">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-accent hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-[#F5F0E8]">
            {recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-ink-secondary text-center">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to="/admin/orders"
                  className="flex items-center gap-4 p-4 hover:bg-canvas transition-colors"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-ink">{order.orderNumber}</p>
                    <p className="text-xs text-ink-secondary">{order.shipping.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-accent">৳{order.total.toLocaleString()}</p>
                    <p className="text-xs text-ink-secondary">{order.status}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-elevated rounded-lg shadow-sm"
        >
          <div className="p-4 border-b border-line flex items-center justify-between">
            <h2 className="font-semibold text-ink flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Alert
            </h2>
            <Link to="/admin/inventory" className="text-sm text-accent hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-[#F5F0E8]">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4">
                <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-ink truncate">{product.name}</p>
                  <p className="text-xs text-ink-secondary">{product.sku}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  product.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {product.stock} left
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-elevated rounded-lg p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-ink mb-4">Payment Method Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {paymentBreakdown.length === 0 ? (
            <p className="text-sm text-ink-secondary col-span-full">No payment data yet</p>
          ) : (
            paymentBreakdown.map((item) => (
              <div key={item.method} className="text-center p-4 bg-canvas rounded-lg">
                <p className="text-2xl font-semibold text-ink">{item.count}</p>
                <p className="text-xs text-ink-secondary mt-1">{item.method.toUpperCase()}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
