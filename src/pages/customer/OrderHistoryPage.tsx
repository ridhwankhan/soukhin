import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchCustomerOrders } from '../../lib/orderService';
import { Order, OrderStatus } from '../../types';
import Button from '../../components/ui/Button';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  'ready-to-deliver': 'bg-teal-100 text-teal-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchCustomerOrders(user.id)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <div className="bg-[#1B4332] text-white py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold">My Orders</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-[#666666]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Package className="w-12 h-12 text-[#D4C4B5] mx-auto mb-4" />
            <p className="text-[#666666] mb-4">You haven't placed any orders yet.</p>
            <Link to="/"><Button>Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-4"
              >
                <Link
                  to={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
                  className="flex items-center justify-between group"
                >
                  <div>
                    <p className="font-semibold text-[#1B4332]">#{order.orderNumber}</p>
                    <p className="text-xs text-[#666666] mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-GB')} · {order.shipping.area}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-[#2D2D2D]">৳{order.total.toLocaleString()}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded capitalize ${STATUS_COLORS[order.status]}`}>
                        {order.status.replace(/-/g, ' ')}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#999999] group-hover:text-[#1B4332]" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-center mt-6">
          <Link to="/account" className="text-sm text-[#1B4332] hover:underline">← Back to account</Link>
        </p>
      </div>
    </div>
  );
}
