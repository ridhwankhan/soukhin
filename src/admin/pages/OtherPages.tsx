import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, Star, Ticket, MessageSquare, FileText, AlertTriangle } from 'lucide-react';
import { products, categories, customers, reviews, coupons, messages, auditLogs, adminUsers, getLowStockProducts } from '../../data';
import { Review, Message, AuditLog } from '../../types';

// Inventory Page
export function InventoryPage() {
  const allProducts = products;
  const lowStock = getLowStockProducts(10);
  const outOfStock = products.filter(p => p.stock === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2D2D]">Inventory</h1>
        <p className="text-sm text-[#666666]">Manage stock and product availability</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#666666]">Total Products</p>
              <p className="text-2xl font-semibold text-[#2D2D2D]">{allProducts.length}</p>
            </div>
            <Package className="w-8 h-8 text-[#1B4332]" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#666666]">Low Stock</p>
              <p className="text-2xl font-semibold text-amber-600">{lowStock.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#666666]">Out of Stock</p>
              <p className="text-2xl font-semibold text-red-600">{outOfStock.length}</p>
            </div>
            <Package className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#F5F0E8]">
          <h2 className="font-semibold text-[#2D2D2D]">Low Stock Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F6F3] text-sm text-[#666666]">
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">SKU</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]">
              {lowStock.map((product) => (
                <tr key={product.id} className="hover:bg-[#F8F6F3]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                      <div>
                        <p className="font-medium text-[#2D2D2D]">{product.name}</p>
                        <p className="text-xs text-[#666666]">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#666666]">{product.sku}</td>
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
                    <button className="px-3 py-1 bg-[#1B4332] text-white text-sm rounded hover:bg-[#163828]">
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
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Categories</h1>
          <p className="text-sm text-[#666666]">Manage product categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-[#2D2D2D]">{category.name}</h3>
              <p className="text-sm text-[#666666]">{category.nameBn}</p>
              <p className="text-sm text-[#666666] mt-2">{category.productCount} products</p>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-3 py-1.5 text-sm border border-[#D4C4B5] rounded hover:bg-[#F5F0E8]">
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
        <h1 className="text-2xl font-semibold text-[#2D2D2D]">Customers</h1>
        <p className="text-sm text-[#666666]">{customers.length} registered customers</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F6F3] text-sm text-[#666666]">
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Phone</th>
                <th className="text-left p-4 font-medium">Orders</th>
                <th className="text-left p-4 font-medium">Total Spent</th>
                <th className="text-left p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-[#F8F6F3]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1B4332] rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{customer.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-[#2D2D2D]">{customer.name}</p>
                        {customer.email && <p className="text-xs text-[#666666]">{customer.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#666666]">{customer.phone}</td>
                  <td className="p-4 text-sm text-[#2D2D2D]">{customer.orders}</td>
                  <td className="p-4 text-sm font-medium text-[#1B4332]">৳{customer.totalSpent.toLocaleString()}</td>
                  <td className="p-4 text-sm text-[#666666]">{customer.createdAt}</td>
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
        <h1 className="text-2xl font-semibold text-[#2D2D2D]">Reviews</h1>
        <p className="text-sm text-[#666666]">{reviews.length} reviews</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F6F3] text-sm text-[#666666]">
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">Rating</th>
                <th className="text-left p-4 font-medium">Review</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-[#F8F6F3]">
                  <td className="p-4">
                    <p className="font-medium text-[#2D2D2D]">{review.customerName}</p>
                  </td>
                  <td className="p-4 text-sm text-[#666666]">{review.productId}</td>
                  <td className="p-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-[#B8860B] fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-[#2D2D2D] line-clamp-2">{review.comment}</p>
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
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Coupons & Discounts</h1>
          <p className="text-sm text-[#666666]">{coupons.length} coupons</p>
        </div>
        <button className="px-4 py-2 bg-[#1B4332] text-white rounded hover:bg-[#163828]">
          Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F6F3] text-sm text-[#666666]">
                <th className="text-left p-4 font-medium">Code</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Value</th>
                <th className="text-left p-4 font-medium">Uses</th>
                <th className="text-left p-4 font-medium">Valid Until</th>
                <th className="text-left p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-[#F8F6F3]">
                  <td className="p-4 font-mono font-medium text-[#1B4332]">{coupon.code}</td>
                  <td className="p-4 text-sm text-[#666666] capitalize">{coupon.type}</td>
                  <td className="p-4 text-sm text-[#2D2D2D]">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `৳${coupon.value}`}
                  </td>
                  <td className="p-4 text-sm text-[#666666]">
                    {coupon.usedCount} / {coupon.maxUses ?? '∞'}
                  </td>
                  <td className="p-4 text-sm text-[#666666]">{coupon.validUntil}</td>
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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2D2D]">Messages</h1>
        <p className="text-sm text-[#666666]">{messages.filter(m => !m.isRead).length} unread</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F6F3] text-sm text-[#666666]">
                <th className="text-left p-4 font-medium">From</th>
                <th className="text-left p-4 font-medium">Subject</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]">
              {messages.map((msg) => (
                <tr key={msg.id} className={`hover:bg-[#F8F6F3] ${!msg.isRead ? 'bg-blue-50/30' : ''}`}>
                  <td className="p-4">
                    <p className="font-medium text-[#2D2D2D]">{msg.name}</p>
                    <p className="text-xs text-[#666666]">{msg.email}</p>
                  </td>
                  <td className="p-4 text-sm text-[#2D2D2D]">{msg.subject}</td>
                  <td className="p-4 text-sm text-[#666666]">
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
                      onClick={() => setSelectedMessage(msg)}
                      className="px-3 py-1 text-sm text-[#1B4332] hover:bg-[#1B4332]/10 rounded"
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
    </div>
  );
}

// Audit Log Page
export function AuditLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2D2D]">Audit Log</h1>
        <p className="text-sm text-[#666666]">System activity history</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F6F3] text-sm text-[#666666]">
                <th className="text-left p-4 font-medium">Time</th>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Action</th>
                <th className="text-left p-4 font-medium">Entity</th>
                <th className="text-left p-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8F6F3]">
                  <td className="p-4 text-sm text-[#666666]">
                    {new Date(log.timestamp).toLocaleString('en-GB')}
                  </td>
                  <td className="p-4 text-sm text-[#2D2D2D]">{log.userName}</td>
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
                  <td className="p-4 text-sm text-[#666666]">
                    {log.entityType}: {log.entityId}
                  </td>
                  <td className="p-4 text-sm text-[#666666] max-w-xs truncate">
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

// Users Page
export function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">User Management</h1>
          <p className="text-sm text-[#666666]">{adminUsers.length} admin users</p>
        </div>
        <button className="px-4 py-2 bg-[#1B4332] text-white rounded hover:bg-[#163828]">
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F6F3] text-sm text-[#666666]">
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Last Login</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]">
              {adminUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-[#F8F6F3]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1B4332] rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{user.name.charAt(0)}</span>
                      </div>
                      <p className="font-medium text-[#2D2D2D]">{user.name}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#666666]">{user.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-[#1B4332]/10 text-[#1B4332] text-xs font-medium rounded capitalize">
                      {user.role.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[#666666]">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-GB') : 'Never'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="px-3 py-1 text-sm text-[#1B4332] hover:bg-[#1B4332]/10 rounded">
                      Edit
                    </button>
                    {user.role !== 'owner' && (
                      <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded">
                        Remove
                      </button>
                    )}
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
