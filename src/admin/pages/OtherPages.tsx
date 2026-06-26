import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, Star, Ticket, MessageSquare, FileText, AlertTriangle } from 'lucide-react';
import { products, categories, customers, reviews, coupons, messages, auditLogs, getLowStockProducts } from '../../data';
import { fetchAdminMessages, markMessageRead } from '../../lib/notificationService';
import { Review, Message, AuditLog } from '../../types';

// Inventory Page
export function InventoryPage() {
  const allProducts = products;
  const lowStock = getLowStockProducts(10);
  const outOfStock = products.filter(p => p.stock === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Inventory</h1>
        <p className="text-sm text-ink-secondary">Manage stock and product availability</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-elevated rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-secondary">Total Products</p>
              <p className="text-2xl font-semibold text-ink">{allProducts.length}</p>
            </div>
            <Package className="w-8 h-8 text-accent" />
          </div>
        </div>
        <div className="bg-elevated rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-secondary">Low Stock</p>
              <p className="text-2xl font-semibold text-amber-600">{lowStock.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-elevated rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-secondary">Out of Stock</p>
              <p className="text-2xl font-semibold text-red-600">{outOfStock.length}</p>
            </div>
            <Package className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Table */}
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
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lowStock.map((product) => (
                <tr key={product.id} className="hover:bg-canvas">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                      <div>
                        <p className="font-medium text-ink">{product.name}</p>
                        <p className="text-xs text-ink-secondary">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">{product.sku}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      product.stock === 0 ? 'bg-red-100 text-red-600' :
                      product.stock <= 5 ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="px-3 py-1 bg-accent text-white text-sm rounded hover:bg-accent-hover">
                      Update Stock
                    </button>
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

// Categories Page
export function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Categories</h1>
          <p className="text-sm text-ink-secondary">Manage product categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-elevated rounded-lg shadow-sm overflow-hidden"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-ink">{category.name}</h3>
              <p className="text-sm text-ink-secondary">{category.nameBn}</p>
              <p className="text-sm text-ink-secondary mt-2">{category.productCount} products</p>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-3 py-1.5 text-sm border border-line rounded hover:bg-surface">
                  Edit
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Customers Page
export function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Customers</h1>
        <p className="text-sm text-ink-secondary">{customers.length} registered customers</p>
      </div>

      <div className="bg-elevated rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-canvas text-sm text-ink-secondary">
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Phone</th>
                <th className="text-left p-4 font-medium">Orders</th>
                <th className="text-left p-4 font-medium">Total Spent</th>
                <th className="text-left p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-canvas">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{customer.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-ink">{customer.name}</p>
                        {customer.email && <p className="text-xs text-ink-secondary">{customer.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">{customer.phone}</td>
                  <td className="p-4 text-sm text-ink">{customer.orders}</td>
                  <td className="p-4 text-sm font-medium text-accent">৳{customer.totalSpent.toLocaleString()}</td>
                  <td className="p-4 text-sm text-ink-secondary">{customer.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Reviews Page
export function ReviewsPage() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Reviews</h1>
        <p className="text-sm text-ink-secondary">{reviews.length} reviews</p>
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
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-canvas">
                  <td className="p-4">
                    <p className="font-medium text-ink">{review.customerName}</p>
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">{review.productId}</td>
                  <td className="p-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-accent-soft fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-ink line-clamp-2">{review.comment}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      review.isApproved ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {!review.isApproved && (
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 mr-2">
                        Approve
                      </button>
                    )}
                    <button className="px-3 py-1 border border-red-200 text-red-600 text-sm rounded hover:bg-red-50">
                      Delete
                    </button>
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

// Coupons Page
export function CouponsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Coupons & Discounts</h1>
          <p className="text-sm text-ink-secondary">{coupons.length} coupons</p>
        </div>
        <button className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover">
          Add Coupon
        </button>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
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
                  <td className="p-4 text-sm text-ink-secondary">{coupon.validUntil}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      coupon.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Messages</h1>
        <p className="text-sm text-ink-secondary">
          {loading ? 'Loading...' : `${messagesList.filter(m => !m.isRead).length} unread`}
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
                <tr><td colSpan={5} className="p-8 text-center text-sm text-ink-secondary">No messages yet</td></tr>
              )}
              {messagesList.map((msg) => (
                <tr key={msg.id} className={`hover:bg-canvas ${!msg.isRead ? 'bg-blue-50/30' : ''}`}>
                  <td className="p-4">
                    <p className="font-medium text-ink">{msg.name}</p>
                    <p className="text-xs text-ink-secondary">{msg.email}</p>
                  </td>
                  <td className="p-4 text-sm text-ink">{msg.subject}</td>
                  <td className="p-4 text-sm text-ink-secondary">
                    {new Date(msg.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      msg.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {msg.isRead ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
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
            <button onClick={() => setSelectedMessage(null)} className="mt-4 text-sm text-accent hover:underline">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Audit Log Page
export function AuditLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Audit Log</h1>
        <p className="text-sm text-ink-secondary">System activity history</p>
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
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-canvas">
                  <td className="p-4 text-sm text-ink-secondary">
                    {new Date(log.timestamp).toLocaleString('en-GB')}
                  </td>
                  <td className="p-4 text-sm text-ink">{log.userName}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.action === 'create' ? 'bg-green-100 text-green-600' :
                      log.action === 'update' ? 'bg-blue-100 text-blue-600' :
                      log.action === 'delete' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">
                    {log.entityType}: {log.entityId}
                  </td>
                  <td className="p-4 text-sm text-ink-secondary max-w-xs truncate">
                    {log.newValue || log.oldValue}
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
