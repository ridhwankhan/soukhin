import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { orders, products, getLowStockProducts, getOrderStats, getPaymentMethodBreakdown, getRecentOrders } from '../../data';
import { BRAND_CONFIG } from '../../config';

export default function AdminDashboard() {
  const stats = getOrderStats();
  const lowStockProducts = getLowStockProducts();
  const recentOrders = getRecentOrders(5);
  const paymentBreakdown = getPaymentMethodBreakdown();

  const totalRevenue = orders
    .filter(o => o.status === 'delivered' && o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const statCards = [
    {
      label: 'Total Revenue',
      value: `৳${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Total Orders',
      value: stats.total,
      icon: ShoppingBag,
      color: 'bg-blue-100 text-blue-600',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Pending Orders',
      value: stats.pending + stats.confirmed + stats.processing,
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Customers',
      value: 127,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      trend: '+15',
      trendUp: true,
    },
  ];

  const orderStatusCards = [
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-500' },
    { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'bg-blue-500' },
    { label: 'Processing', value: stats.processing, icon: Package, color: 'bg-indigo-500' },
    { label: 'Ready', value: stats.readyToDeliver, icon: CheckCircle, color: 'bg-teal-500' },
    { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Dashboard</h1>
          <p className="text-sm text-[#666666]">Welcome back, {orders.length > 0 ? 'Admin' : 'Owner'}</p>
        </div>
        <div className="text-sm text-[#666666]">
          Last updated: {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#666666]">{stat.label}</p>
                <p className="text-2xl font-semibold text-[#2D2D2D] mt-1">{stat.value}</p>
                {stat.trend && (
                  <div className={`flex items-center gap-1 mt-2 text-sm ${
                    stat.trendUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    <span>{stat.trend} this month</span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-[#2D2D2D] mb-4">Order Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {orderStatusCards.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-3 bg-[#F8F6F3] rounded-lg"
            >
              <div className={`p-2 rounded-lg ${item.color}`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-[#2D2D2D]">{item.value}</p>
                <p className="text-xs text-[#666666]">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm"
        >
          <div className="p-4 border-b border-[#F5F0E8] flex items-center justify-between">
            <h2 className="font-semibold text-[#2D2D2D]">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-[#1B4332] hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-[#F5F0E8]">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 p-4 hover:bg-[#F8F6F3] transition-colors"
              >
                <div className="w-10 h-10 bg-[#1B4332]/10 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#1B4332]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#2D2D2D]">{order.orderNumber}</p>
                  <p className="text-xs text-[#666666]">{order.shipping.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm text-[#1B4332]">৳{order.total.toLocaleString()}</p>
                  <p className="text-xs text-[#666666]">{order.status}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm"
        >
          <div className="p-4 border-b border-[#F5F0E8] flex items-center justify-between">
            <h2 className="font-semibold text-[#2D2D2D] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Alert
            </h2>
            <Link to="/admin/inventory" className="text-sm text-[#1B4332] hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-[#F5F0E8]">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#2D2D2D] truncate">{product.name}</p>
                  <p className="text-xs text-[#666666]">{product.sku}</p>
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

      {/* Payment Method Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-[#2D2D2D] mb-4">Payment Method Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {paymentBreakdown.map((item) => (
            <div key={item.method} className="text-center p-4 bg-[#F8F6F3] rounded-lg">
              <p className="text-2xl font-semibold text-[#2D2D2D]">{item.count}</p>
              <p className="text-xs text-[#666666] mt-1">{item.method.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
