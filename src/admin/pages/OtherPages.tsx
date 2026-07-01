import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Star,
  AlertTriangle,
  Pencil,
  Plus,
  Search,
} from 'lucide-react';
import { fetchAdminMessages, markMessageRead } from '../../lib/notificationService';
import {
  fetchAllProducts,
  fetchLowStockProducts,
  updateProductStock,
} from '../../lib/productService';
import { fetchAdminCustomers } from '../../lib/customerService';
import {
  fetchAdminCoupons,
  saveCoupon,
  setCouponActive,
  CouponInput,
} from '../../lib/couponService';
import {
  fetchAdminReviews,
  approveReview,
  deleteReview,
  AdminReview,
} from '../../lib/reviewService';
import { fetchAuditLogs } from '../../lib/auditService';
import { getTopLevelCategories } from '../../lib/categoryService';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { CONTACT_MAILTO } from '../../config';
import { Coupon, Customer, Message, AuditLog, Product, Category } from '../../types';
import Button from '../../components/ui/Button';

function stockStatusClass(stock: number) {
  if (stock === 0) return 'bg-red-100 text-red-600';
  if (stock <= 5) return 'bg-red-100 text-red-600';
  return 'bg-amber-100 text-amber-600';
}

// Inventory Page
export function InventoryPage() {
  const { can } = useAdminAuth();
  const canManage = can('manage-inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [all, low] = await Promise.all([fetchAllProducts(false), fetchLowStockProducts(10)]);
      setProducts(all);
      setLowStock(low);
    } catch {
      setProducts([]);
      setLowStock([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const outOfStock = products.filter((p) => p.stock === 0);

  const handleSaveStock = async () => {
    if (!editing) return;
    const stock = Number(newStock);
    if (!Number.isFinite(stock) || stock < 0) {
      setError('Enter a valid stock number (0 or more).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateProductStock(editing.id, stock);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update stock.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Inventory</h1>
        <p className="text-sm text-ink-secondary">Live stock from your product database</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-elevated rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-secondary">Total Products</p>
              <p className="text-2xl font-semibold text-ink">{loading ? '…' : products.length}</p>
            </div>
            <Package className="w-8 h-8 text-accent" />
          </div>
        </div>
        <div className="bg-elevated rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-secondary">Low Stock (≤10)</p>
              <p className="text-2xl font-semibold text-amber-600">{loading ? '…' : lowStock.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-elevated rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-secondary">Out of Stock</p>
              <p className="text-2xl font-semibold text-red-600">{loading ? '…' : outOfStock.length}</p>
            </div>
            <Package className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-elevated rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-line">
          <h2 className="font-semibold text-ink">Low Stock Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-canvas text-sm text-ink-secondary">
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">SKU</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-left p-4 font-medium">Status</th>
                {canManage && <th className="text-right p-4 font-medium">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!loading && lowStock.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="p-8 text-center text-sm text-ink-secondary">
                    No low-stock products right now.
                  </td>
                </tr>
              )}
              {lowStock.map((product) => (
                <tr key={product.id} className="hover:bg-canvas">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded" />
                      )}
                      <div>
                        <p className="font-medium text-ink">{product.name}</p>
                        <p className="text-xs text-ink-secondary">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">{product.sku}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${stockStatusClass(product.stock)}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">
                    {product.stock === 0 ? 'Out of stock' : 'Low stock'}
                  </td>
                  {canManage && (
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(product);
                          setNewStock(String(product.stock));
                          setError('');
                        }}
                        className="px-3 py-1 bg-accent text-white text-sm rounded hover:bg-accent-hover"
                      >
                        Update Stock
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-elevated rounded-lg p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-1">Update stock</h3>
            <p className="text-sm text-ink-secondary mb-4">{editing.name}</p>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <input
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-sm mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={() => void handleSaveStock()} loading={saving}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Categories Page
export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [cats, products] = await Promise.all([getTopLevelCategories(), fetchAllProducts(false)]);
        setCategories(cats);
        const counts: Record<string, number> = {};
        for (const p of products) {
          counts[p.category] = (counts[p.category] ?? 0) + 1;
        }
        setProductCounts(counts);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Categories</h1>
        <p className="text-sm text-ink-secondary">Categories from your live database</p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-secondary">Loading categories…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-elevated rounded-lg shadow-sm overflow-hidden"
            >
              <img src={category.image} alt={category.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-ink">{category.name}</h3>
                <p className="text-sm text-ink-secondary">{category.nameBn}</p>
                <p className="text-sm text-ink-secondary mt-2">
                  {productCounts[category.slug] ?? 0} products
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Customers Page
export function CustomersPage() {
  const { can } = useAdminAuth();
  const canNotify = can('send-customer-notifications');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'spent' | 'orders' | 'newest' | 'name'>('spent');
  const [notifyCustomer, setNotifyCustomer] = useState<Customer | null>(null);
  const [notifyForm, setNotifyForm] = useState({
    title: '',
    body: '',
    notificationType: 'general' as 'general' | 'voucher' | 'promo',
    couponCode: '',
  });
  const [notifySaving, setNotifySaving] = useState(false);
  const [notifyError, setNotifyError] = useState('');
  const [notifySuccess, setNotifySuccess] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      setCustomers(await fetchAdminCustomers(search || undefined, sort));
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => void loadCustomers(), 300);
    return () => clearTimeout(timer);
  }, [search, sort]);

  const openNotify = (customer: Customer) => {
    setNotifyCustomer(customer);
    setNotifyForm({
      title: '',
      body: '',
      notificationType: 'voucher',
      couponCode: '',
    });
    setNotifyError('');
    setNotifySuccess('');
  };

  const handleSendNotification = async () => {
    if (!notifyCustomer?.email) {
      setNotifyError('This customer has no email on file.');
      return;
    }
    if (!notifyForm.title.trim() || !notifyForm.body.trim()) {
      setNotifyError('Title and message are required.');
      return;
    }
    setNotifySaving(true);
    setNotifyError('');
    try {
      const { sendCustomerNotification } = await import('../../lib/customerNotificationService');
      await sendCustomerNotification({
        customerId: notifyCustomer.id,
        recipientEmail: notifyCustomer.email,
        recipientName: notifyCustomer.name,
        title: notifyForm.title.trim(),
        body: notifyForm.body.trim(),
        notificationType: notifyForm.notificationType,
        couponCode: notifyForm.couponCode.trim() || undefined,
      });
      setNotifySuccess(`Notification sent to ${notifyCustomer.name}. They will see it on the website and receive an email.`);
      setTimeout(() => {
        setNotifyCustomer(null);
        setNotifySuccess('');
      }, 2500);
    } catch (e) {
      setNotifyError(e instanceof Error ? e.message : 'Could not send notification.');
    } finally {
      setNotifySaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Customers</h1>
        <p className="text-sm text-ink-secondary">
          {loading ? 'Loading…' : `${customers.length} registered customers — find top buyers and reach out`}
        </p>
      </div>

      <div className="bg-elevated rounded-lg shadow-sm p-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-secondary" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="px-4 py-2 border border-line rounded-sm bg-elevated"
        >
          <option value="spent">Top spenders</option>
          <option value="orders">Most orders</option>
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div className="bg-elevated rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-canvas text-sm text-ink-secondary">
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Phone</th>
                <th className="text-left p-4 font-medium">Orders</th>
                <th className="text-left p-4 font-medium">Total Spent</th>
                <th className="text-left p-4 font-medium">Joined</th>
                {canNotify && <th className="text-right p-4 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!loading && customers.length === 0 && (
                <tr>
                  <td colSpan={canNotify ? 7 : 6} className="p-8 text-center text-sm text-ink-secondary">
                    No customers yet. They appear here when they sign up and place orders.
                  </td>
                </tr>
              )}
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-canvas">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{customer.name.charAt(0)}</span>
                      </div>
                      <p className="font-medium text-ink">{customer.name}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    {customer.email ? (
                      <a href={`mailto:${customer.email}`} className="text-sm text-accent hover:underline">
                        {customer.email}
                      </a>
                    ) : (
                      <span className="text-sm text-ink-secondary">—</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">{customer.phone}</td>
                  <td className="p-4 text-sm text-ink">{customer.orders}</td>
                  <td className="p-4 text-sm font-medium text-accent">৳{customer.totalSpent.toLocaleString()}</td>
                  <td className="p-4 text-sm text-ink-secondary">
                    {new Date(customer.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  {canNotify && (
                    <td className="p-4 text-right space-x-2">
                      {customer.email && (
                        <button
                          type="button"
                          onClick={() => openNotify(customer)}
                          className="px-3 py-1 text-sm bg-accent text-white rounded hover:bg-accent-hover"
                        >
                          Send offer
                        </button>
                      )}
                      {customer.email && (
                        <a
                          href={`mailto:${customer.email}?subject=${encodeURIComponent('A special offer from Soukhin')}`}
                          className="px-3 py-1 text-sm border border-line rounded hover:bg-surface inline-block"
                        >
                          Email
                        </a>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {notifyCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setNotifyCustomer(null)}>
          <div className="bg-elevated rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-1">Send notification & email</h3>
            <p className="text-sm text-ink-secondary mb-4">
              To {notifyCustomer.name} ({notifyCustomer.email})
            </p>
            {notifyError && <p className="text-sm text-red-600 mb-3">{notifyError}</p>}
            {notifySuccess && <p className="text-sm text-green-600 mb-3">{notifySuccess}</p>}
            <div className="space-y-3">
              <select
                value={notifyForm.notificationType}
                onChange={(e) => setNotifyForm({ ...notifyForm, notificationType: e.target.value as typeof notifyForm.notificationType })}
                className="w-full px-3 py-2 border border-line rounded-sm"
              >
                <option value="voucher">Voucher / Coupon</option>
                <option value="promo">Promotion</option>
                <option value="general">General message</option>
              </select>
              <input
                placeholder="Title e.g. Eid special — 15% off"
                value={notifyForm.title}
                onChange={(e) => setNotifyForm({ ...notifyForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-sm"
              />
              <textarea
                placeholder="Message body..."
                rows={4}
                value={notifyForm.body}
                onChange={(e) => setNotifyForm({ ...notifyForm, body: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-sm"
              />
              {(notifyForm.notificationType === 'voucher' || notifyForm.notificationType === 'promo') && (
                <input
                  placeholder="Coupon code (optional)"
                  value={notifyForm.couponCode}
                  onChange={(e) => setNotifyForm({ ...notifyForm, couponCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-line rounded-sm font-mono"
                />
              )}
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setNotifyCustomer(null)}>Cancel</Button>
              <Button onClick={() => void handleSendNotification()} loading={notifySaving}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reviews Page
export function ReviewsPage() {
  const { can } = useAdminAuth();
  const canManage = can('manage-reviews');
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setReviews(await fetchAdminReviews());
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleApprove = async (id: string) => {
    await approveReview(id);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    await deleteReview(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Reviews</h1>
        <p className="text-sm text-ink-secondary">{loading ? 'Loading…' : `${reviews.length} reviews`}</p>
      </div>

      <div className="bg-elevated rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-canvas text-sm text-ink-secondary">
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">Rating</th>
                <th className="text-left p-4 font-medium">Review</th>
                <th className="text-left p-4 font-medium">Status</th>
                {canManage && <th className="text-right p-4 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!loading && reviews.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="p-8 text-center text-sm text-ink-secondary">
                    No reviews yet.
                  </td>
                </tr>
              )}
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-canvas">
                  <td className="p-4">
                    <p className="font-medium text-ink">{review.customerName}</p>
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">{review.productName ?? review.productId}</td>
                  <td className="p-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-accent-soft fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-ink line-clamp-2">{review.comment}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        review.isApproved ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  {canManage && (
                    <td className="p-4 text-right">
                      {!review.isApproved && (
                        <button
                          type="button"
                          onClick={() => void handleApprove(review.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 mr-2"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(review.id)}
                        className="px-3 py-1 border border-red-200 text-red-600 text-sm rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const emptyCouponForm = (): CouponInput => ({
  code: '',
  type: 'percentage',
  value: 10,
  minOrderAmount: 0,
  maxUses: undefined,
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  isActive: true,
});

// Coupons Page
export function CouponsPage() {
  const { can } = useAdminAuth();
  const canManage = can('manage-coupons');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CouponInput>(emptyCouponForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setCoupons(await fetchAdminCoupons());
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setForm(emptyCouponForm());
    setError('');
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setForm({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxUses: coupon.maxUses,
      validFrom: coupon.validFrom.slice(0, 10),
      validUntil: coupon.validUntil.slice(0, 10),
      isActive: coupon.isActive,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      setError('Coupon code is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveCoupon(form);
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    if (!canManage) return;
    try {
      await setCouponActive(coupon.id, !coupon.isActive);
      await load();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Coupons & Discounts</h1>
          <p className="text-sm text-ink-secondary">{loading ? 'Loading…' : `${coupons.length} coupons`}</p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover"
          >
            <Plus className="w-4 h-4" />
            Add Coupon
          </button>
        )}
      </div>

      <div className="bg-elevated rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-canvas text-sm text-ink-secondary">
                <th className="text-left p-4 font-medium">Code</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Value</th>
                <th className="text-left p-4 font-medium">Uses</th>
                <th className="text-left p-4 font-medium">Valid Until</th>
                <th className="text-left p-4 font-medium">Status</th>
                {canManage && <th className="text-right p-4 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!loading && coupons.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="p-8 text-center text-sm text-ink-secondary">
                    No coupons in the database yet.
                  </td>
                </tr>
              )}
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-canvas">
                  <td className="p-4 font-mono font-medium text-accent">{coupon.code}</td>
                  <td className="p-4 text-sm text-ink-secondary capitalize">{coupon.type}</td>
                  <td className="p-4 text-sm text-ink">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `৳${coupon.value}`}
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">
                    {coupon.usedCount} / {coupon.maxUses ?? '∞'}
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">
                    {new Date(coupon.validUntil).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        coupon.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {canManage && (
                    <td className="p-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(coupon)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm border border-line rounded hover:bg-surface"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggle(coupon)}
                        className={`px-3 py-1 text-sm rounded ${
                          coupon.isActive
                            ? 'border border-amber-200 text-amber-700 hover:bg-amber-50'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {coupon.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-elevated rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">{form.id ? 'Edit coupon' : 'New coupon'}</h3>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <div className="space-y-3">
              <input
                placeholder="Code e.g. SHOUKHIN10"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-line rounded-sm"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-3 py-2 border border-line rounded-sm"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount (৳)</option>
              </select>
              <input
                type="number"
                min={0}
                placeholder="Value"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-line rounded-sm"
              />
              <input
                type="number"
                min={0}
                placeholder="Min order amount"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-line rounded-sm"
              />
              <input
                type="number"
                min={1}
                placeholder="Max uses (optional)"
                value={form.maxUses ?? ''}
                onChange={(e) =>
                  setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full px-3 py-2 border border-line rounded-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  className="px-3 py-2 border border-line rounded-sm"
                />
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  className="px-3 py-2 border border-line rounded-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={() => void handleSave()} loading={saving}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Messages Page
export function MessagesPage() {
  const [messagesList, setMessagesList] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchAdminMessages()
      .then((data) => setMessagesList(data))
      .catch(() => setMessagesList([]))
      .finally(() => setLoading(false));
  }, []);

  const handleView = async (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        await markMessageRead(msg.id);
        setMessagesList((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)));
      } catch {
        // ignore
      }
    }
  };

  const replyMailto = selectedMessage
    ? `mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`
    : CONTACT_MAILTO;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Messages</h1>
        <p className="text-sm text-ink-secondary">
          {loading ? 'Loading...' : `${messagesList.filter((m) => !m.isRead).length} unread`}
        </p>
      </div>

      <div className="bg-elevated rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-canvas text-sm text-ink-secondary">
                <th className="text-left p-4 font-medium">From</th>
                <th className="text-left p-4 font-medium">Subject</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {messagesList.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-ink-secondary">
                    No messages yet
                  </td>
                </tr>
              )}
              {messagesList.map((msg) => (
                <tr key={msg.id} className={`hover:bg-canvas ${!msg.isRead ? 'bg-blue-50/30' : ''}`}>
                  <td className="p-4">
                    <p className="font-medium text-ink">{msg.name}</p>
                    <a href={`mailto:${msg.email}`} className="text-xs text-accent hover:underline">
                      {msg.email}
                    </a>
                  </td>
                  <td className="p-4 text-sm text-ink">{msg.subject}</td>
                  <td className="p-4 text-sm text-ink-secondary">
                    {new Date(msg.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        msg.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {msg.isRead ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleView(msg)}
                      className="px-3 py-1 text-sm text-accent hover:bg-accent/10 rounded"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMessage(null)}>
          <div className="bg-elevated rounded-lg p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-2">{selectedMessage.subject}</h3>
            <p className="text-sm text-ink-secondary mb-4">
              From {selectedMessage.name} ({selectedMessage.email})
              {selectedMessage.phone && ` · ${selectedMessage.phone}`}
            </p>
            <p className="text-sm text-ink whitespace-pre-wrap">{selectedMessage.message}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={replyMailto} className="text-sm text-accent hover:underline font-medium">
                Reply to customer
              </a>
              <a href={CONTACT_MAILTO} className="text-sm text-ink-secondary hover:underline">
                Open store inbox
              </a>
              <button type="button" onClick={() => setSelectedMessage(null)} className="text-sm text-ink-muted hover:underline ml-auto">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Audit Log Page
export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAuditLogs()
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Audit Log</h1>
        <p className="text-sm text-ink-secondary">System activity from the database</p>
      </div>

      <div className="bg-elevated rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-canvas text-sm text-ink-secondary">
                <th className="text-left p-4 font-medium">Time</th>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Action</th>
                <th className="text-left p-4 font-medium">Entity</th>
                <th className="text-left p-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-ink-secondary">
                    No audit entries yet.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-canvas">
                  <td className="p-4 text-sm text-ink-secondary">
                    {new Date(log.timestamp).toLocaleString('en-GB')}
                  </td>
                  <td className="p-4 text-sm text-ink">{log.userName ?? '—'}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        log.action === 'create'
                          ? 'bg-green-100 text-green-600'
                          : log.action === 'update'
                            ? 'bg-blue-100 text-blue-600'
                            : log.action === 'delete'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">
                    {log.entityType}: {log.entityId}
                  </td>
                  <td className="p-4 text-sm text-ink-secondary max-w-xs truncate">
                    {typeof log.newValue === 'string'
                      ? log.newValue
                      : log.newValue
                        ? JSON.stringify(log.newValue)
                        : typeof log.oldValue === 'string'
                          ? log.oldValue
                          : log.oldValue
                            ? JSON.stringify(log.oldValue)
                            : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
