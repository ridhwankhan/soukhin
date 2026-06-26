import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Package, CheckCircle, XCircle } from 'lucide-react';
import { trackOrder, getOrderStatusSteps } from '../../lib/orderService';
import { Order } from '../../types';
import { isValidPhone } from '../../lib/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') ?? '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setSearched(true);

    if (!orderNumber.trim()) {
      setError('Please enter your order number.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Please enter the phone number used when ordering (01XXXXXXXXX).');
      return;
    }

    setLoading(true);
    try {
      const result = await trackOrder(orderNumber.trim(), phone);
      if (!result) {
        setError('No order found. Check your order number and phone number.');
        return;
      }
      setOrder(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.startsWith('rate_limit:')) {
        setError(message.replace('rate_limit: ', ''));
      } else {
        setError('Could not look up your order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = order ? getOrderStatusSteps(order.status) : [];

  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-accent text-white py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-serif font-semibold mb-2">Track Your Order</h1>
          <p className="text-white/70 text-sm">Enter your order number and phone to see status</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-elevated rounded-lg shadow-sm p-6 mb-6"
        >
          <form onSubmit={handleTrack} className="space-y-4">
            <Input
              label="Order Number"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="SK-2026-000001"
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              required
            />
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              <Search className="w-4 h-4 mr-2" />
              Track Order
            </Button>
          </form>
        </motion.div>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-elevated rounded-lg shadow-sm p-6 space-y-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-ink-secondary">Order</p>
                <p className="text-xl font-semibold text-accent">#{order.orderNumber}</p>
                <p className="text-sm text-ink-secondary mt-1">
                  Placed {new Date(order.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-ink">৳{order.total.toLocaleString()}</p>
                <p className="text-xs text-ink-secondary capitalize">{order.paymentMethod} · {order.paymentStatus}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-ink mb-4">Order Status</h3>
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.current ? 'bg-accent text-white' :
                      step.done ? 'bg-green-100 text-green-600' : 'bg-surface text-[#999999]'
                    }`}>
                      {step.done && !step.current ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : step.current && (order.status === 'cancelled' || order.status === 'refunded') ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`text-sm ${step.current ? 'font-semibold text-accent' : 'text-ink-secondary'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {order.items.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-ink mb-3">Items</h3>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm p-3 bg-canvas rounded-sm">
                      <span>{item.product.name} × {item.quantity}</span>
                      <span className="font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-canvas rounded-sm text-sm">
              <p className="text-ink-secondary">Delivery to</p>
              <p className="font-medium">{order.shipping.address}</p>
              <p className="text-ink-secondary">{order.shipping.area}</p>
            </div>
          </motion.div>
        )}

        {searched && !order && !error && !loading && (
          <p className="text-center text-sm text-ink-secondary">Enter your details above to track an order.</p>
        )}

        <p className="text-center mt-8">
          <Link to="/account" className="text-sm text-accent hover:underline">
            View all your orders in My Account →
          </Link>
        </p>
      </div>
    </div>
  );
}
