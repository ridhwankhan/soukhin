import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Order, OrderLabel } from '../../types';
import { ORDER_LABEL_OPTIONS } from '../../config/orderLabels';
import { updateOrderDetails } from '../../lib/orderService';
import Button from '../../components/ui/Button';
import OrderLabelBadges from './OrderLabelBadges';

interface OrderDetailsEditorProps {
  order: Order;
  onSaved: (updated: Partial<Order>) => void;
}

export default function OrderDetailsEditor({ order, onSaved }: OrderDetailsEditorProps) {
  const [estimatedDelivery, setEstimatedDelivery] = useState(order.estimatedDelivery ?? '');
  const [orderLabels, setOrderLabels] = useState<OrderLabel[]>(order.orderLabels ?? []);
  const [customerNotes, setCustomerNotes] = useState(order.shipping.notes ?? '');
  const [staffNotes, setStaffNotes] = useState(order.adminNotes ?? '');
  const [socialLink, setSocialLink] = useState(order.socialLink ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setEstimatedDelivery(order.estimatedDelivery ?? '');
    setOrderLabels(order.orderLabels ?? []);
    setCustomerNotes(order.shipping.notes ?? '');
    setStaffNotes(order.adminNotes ?? '');
    setSocialLink(order.socialLink ?? '');
    setError('');
    setSuccess('');
  }, [order.id, order.estimatedDelivery, order.orderLabels, order.shipping.notes, order.adminNotes, order.socialLink]);

  const toggleLabel = (label: OrderLabel) => {
    setOrderLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateOrderDetails(order.id, {
        estimatedDelivery: estimatedDelivery.trim(),
        orderLabels,
        shippingNotes: customerNotes.trim(),
        adminNotes: staffNotes.trim(),
        socialLink: socialLink.trim(),
      });
      onSaved({
        estimatedDelivery: estimatedDelivery.trim() || undefined,
        orderLabels,
        socialLink: socialLink.trim() || undefined,
        shipping: { ...order.shipping, notes: customerNotes.trim() || undefined },
        adminNotes: staffNotes.trim() || undefined,
      });
      setSuccess('Order details saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-t border-line pt-6 mt-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium text-ink">Delivery & labels</h3>
        <OrderLabelBadges labels={orderLabels} />
      </div>

      {order.estimatedDelivery && (
        <p className="text-sm text-ink-secondary flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          Est. delivery: <span className="text-ink font-medium">{order.estimatedDelivery}</span>
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">Estimated delivery</label>
        <input
          value={estimatedDelivery}
          onChange={(e) => setEstimatedDelivery(e.target.value)}
          className="w-full px-3 py-2 border border-line rounded-sm text-sm"
          placeholder="e.g. Deliver by Friday, 1-2 business days"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-2">Labels</label>
        <div className="flex flex-wrap gap-2">
          {ORDER_LABEL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleLabel(opt.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded border ${
                orderLabels.includes(opt.id)
                  ? `${opt.className} border-transparent`
                  : 'border-line text-ink-secondary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">Social account link (optional)</label>
        <input
          value={socialLink}
          onChange={(e) => setSocialLink(e.target.value)}
          className="w-full px-3 py-2 border border-line rounded-sm text-sm"
          placeholder="Facebook / Instagram profile URL"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">Customer notes / requests</label>
        <textarea
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-line rounded-sm text-sm"
          placeholder="What the customer asked for..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">Staff side notes</label>
        <textarea
          value={staffNotes}
          onChange={(e) => setStaffNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-line rounded-sm text-sm"
          placeholder="Internal notes for your team..."
        />
      </div>

      <Button onClick={() => void handleSave()} loading={saving} className="w-full sm:w-auto">
        Save order details
      </Button>
    </div>
  );
}
