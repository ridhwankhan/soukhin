import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Package } from 'lucide-react';
import { fetchAllProducts } from '../../lib/productService';
import { createManualOrder } from '../../lib/orderService';
import { parseSupabaseError } from '../../lib/parseSupabaseError';
import { DELIVERY_AREAS } from '../../config/delivery';
import { ORDER_LABEL_OPTIONS } from '../../config/orderLabels';
import { Product, PaymentMethod, PaymentStatus, OrderStatus, OrderLabel } from '../../types';
import { BRAND_CONFIG } from '../../config';
import Button from '../../components/ui/Button';

interface LineItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface ManualOrderFormProps {
  onSuccess: (orderNumber: string) => void;
  onCancel: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'bank-transfer', label: 'Bank Transfer' },
];

export default function ManualOrderForm({ onSuccess, onCancel }: ManualOrderFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingAreaSlug, setShippingAreaSlug] = useState('inside-dhaka');
  const [shippingNotes, setShippingNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('confirmed');
  const [adminNotes, setAdminNotes] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState(DELIVERY_AREAS[0].estimatedDays);
  const [orderLabels, setOrderLabels] = useState<OrderLabel[]>([]);

  useEffect(() => {
    const area = DELIVERY_AREAS.find((a) => a.id === shippingAreaSlug);
    if (area) setEstimatedDelivery(area.estimatedDays);
  }, [shippingAreaSlug]);

  const toggleLabel = (label: OrderLabel) => {
    setOrderLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  useEffect(() => {
    void fetchAllProducts(true)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products.slice(0, 20);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.nameBn.includes(q)
      )
      .slice(0, 20);
  }, [products, productSearch]);

  const selectedArea = DELIVERY_AREAS.find((a) => a.id === shippingAreaSlug) ?? DELIVERY_AREAS[0];

  const subtotal = lineItems.reduce(
    (sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity,
    0
  );
  const deliveryFee = selectedArea.fee;
  const total = subtotal + deliveryFee;

  const addProduct = (product: Product) => {
    const existing = lineItems.find((i) => i.productId === product.id);
    if (existing) {
      setLineItems((prev) =>
        prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) } : i
        )
      );
    } else {
      setLineItems((prev) => [...prev, { productId: product.id, product, quantity: 1 }]);
    }
    setProductSearch('');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setLineItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setLineItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleSubmit = async () => {
    setError('');
    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (lineItems.length === 0) {
      setError('Add at least one product.');
      return;
    }

    setSaving(true);
    try {
      const result = await createManualOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        socialLink: socialLink.trim() || undefined,
        shippingAddress: shippingAddress.trim() || undefined,
        shippingAreaSlug,
        shippingAreaLabel: selectedArea.name,
        shippingNotes: shippingNotes.trim() || undefined,
        paymentMethod,
        paymentStatus,
        status: orderStatus,
        adminNotes: adminNotes.trim() || undefined,
        estimatedDelivery: estimatedDelivery.trim() || undefined,
        orderLabels,
        items: lineItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor,
        })),
      });
      onSuccess(result.orderNumber);
    } catch (e) {
      setError(parseSupabaseError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Customer name *</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Phone (optional)</label>
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="01XXXXXXXXX"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Email (optional)</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="customer@email.com"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Social account link (optional)</label>
          <input
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="Facebook / Instagram / WhatsApp profile URL"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Delivery address (optional)</label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="House, road, area, district"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Delivery area</label>
          <select
            value={shippingAreaSlug}
            onChange={(e) => setShippingAreaSlug(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm"
          >
            {DELIVERY_AREAS.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name} — {BRAND_CONFIG.currency.symbol}{area.fee}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Payment method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full px-3 py-2 border border-line rounded-sm"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Payment status</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            className="w-full px-3 py-2 border border-line rounded-sm"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Customer notes / special requests</label>
          <textarea
            value={shippingNotes}
            onChange={(e) => setShippingNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="What the customer asked for — size, color, gift message, delivery instructions..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Estimated delivery</label>
          <input
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="e.g. 1-2 business days, Deliver by 5 July"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Order status</label>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
            className="w-full px-3 py-2 border border-line rounded-sm"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="ready-to-deliver">Ready to Deliver</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">Order labels</label>
        <div className="flex flex-wrap gap-2">
          {ORDER_LABEL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleLabel(opt.id)}
              className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                orderLabels.includes(opt.id)
                  ? `${opt.className} border-transparent`
                  : 'border-line text-ink-secondary hover:border-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-ink flex items-center gap-2 mb-2">
          <Package className="w-4 h-4" /> Products
        </h3>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-secondary" />
          <input
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="w-full pl-10 pr-4 py-2 border border-line rounded-sm"
          />
        </div>
        {productSearch && !loading && (
          <div className="border border-line rounded-sm mb-3 max-h-40 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <p className="p-3 text-sm text-ink-secondary">No products found</p>
            ) : (
              filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduct(p)}
                  disabled={p.stock === 0}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-canvas text-left disabled:opacity-50"
                >
                  <span className="text-sm">{p.name}</span>
                  <span className="text-xs text-ink-secondary">
                    {BRAND_CONFIG.currency.symbol}{(p.salePrice ?? p.price).toLocaleString()} · stock {p.stock}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
        {lineItems.length === 0 ? (
          <p className="text-sm text-ink-secondary bg-canvas p-4 rounded">Search and add products above.</p>
        ) : (
          <div className="space-y-2">
            {lineItems.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 bg-canvas p-3 rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-ink-secondary">
                    {BRAND_CONFIG.currency.symbol}{(item.product.salePrice ?? item.product.price).toLocaleString()} each
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={item.product.stock}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-line rounded text-sm"
                />
                <button type="button" onClick={() => removeItem(item.productId)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-canvas rounded p-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Subtotal</span>
          <span>{BRAND_CONFIG.currency.symbol}{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>Delivery</span>
          <span>{BRAND_CONFIG.currency.symbol}{deliveryFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-line">
          <span>Total</span>
          <span className="text-accent">{BRAND_CONFIG.currency.symbol}{total.toLocaleString()}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Staff side notes (optional)</label>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-line rounded-sm"
          placeholder="Internal notes only staff see — e.g. placed via phone, follow up needed"
        />
      </div>

      <p className="text-xs text-ink-secondary">
        This order is placed on behalf of the customer — no sign-in or OTP required. Customer data is kept for 30 days after the order is marked Delivered, then removed automatically.
      </p>

      <div className="flex gap-2 justify-end pt-2 border-t border-line">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => void handleSubmit()} loading={saving}>
          <Plus className="w-4 h-4 mr-1" />
          Place Order
        </Button>
      </div>
    </div>
  );
}
