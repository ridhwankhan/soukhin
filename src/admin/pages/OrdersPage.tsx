import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronDown, Eye, Edit2, Phone, MapPin, Package } from 'lucide-react';
import { orders } from '../../data';
import { OrderStatus, Order, PaymentStatus } from '../../types';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { BRAND_CONFIG } from '../../config';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  'pending': { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  'confirmed': { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  'processing': { label: 'Processing', color: 'bg-indigo-100 text-indigo-700' },
  'ready-to-deliver': { label: 'Ready to Deliver', color: 'bg-teal-100 text-teal-700' },
  'delivered': { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  'refunded': { label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  'pending': { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  'paid': { label: 'Paid', color: 'bg-green-100 text-green-700' },
  'failed': { label: 'Failed', color: 'bg-red-100 text-red-700' },
  'refunded': { label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
};

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.shipping.name.toLowerCase().includes(search.toLowerCase()) ||
      order.shipping.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    console.log('Update order', orderId, 'to', newStatus);
    setEditStatus(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Orders</h1>
          <p className="text-sm text-[#666666]">{filteredOrders.length} orders found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            placeholder="Search by order number, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="appearance-none pl-4 pr-10 py-2 border border-[#D4C4B5] rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'all')}
            className="appearance-none pl-4 pr-10 py-2 border border-[#D4C4B5] rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          >
            <option value="all">All Payments</option>
            {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F6F3] text-sm text-[#666666]">
                <th className="text-left p-4 font-medium">Order</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Items</th>
                <th className="text-left p-4 font-medium">Payment</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Total</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]">
              {filteredOrders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#F8F6F3] transition-colors"
                >
                  <td className="p-4">
                    <p className="font-medium text-[#2D2D2D]">{order.orderNumber}</p>
                    <p className="text-xs text-[#666666]">{order.paymentMethod.toUpperCase()}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-[#2D2D2D]">{order.shipping.name}</p>
                    <p className="text-xs text-[#666666]">{order.shipping.phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-[#2D2D2D]">{order.items.length} items</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${PAYMENT_STATUS_CONFIG[order.paymentStatus].color}`}>
                      {PAYMENT_STATUS_CONFIG[order.paymentStatus].label}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_CONFIG[order.status].color}`}>
                      {STATUS_CONFIG[order.status].label}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-[#1B4332]">
                    {BRAND_CONFIG.currency.symbol}{order.total.toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-[#666666]">
                    {new Date(order.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 hover:bg-[#1B4332]/10 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4 text-[#1B4332]" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        size="lg"
      >
        {selectedOrder && (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#2D2D2D]">{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-[#666666]">
                  {new Date(selectedOrder.createdAt).toLocaleString('en-GB')}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded text-sm font-medium ${STATUS_CONFIG[selectedOrder.status].color}`}>
                  {STATUS_CONFIG[selectedOrder.status].label}
                </span>
                <span className={`px-3 py-1 rounded text-sm font-medium ${PAYMENT_STATUS_CONFIG[selectedOrder.paymentStatus].color}`}>
                  {PAYMENT_STATUS_CONFIG[selectedOrder.paymentStatus].label}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <h3 className="font-medium text-[#2D2D2D] flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Customer
                </h3>
                <div className="bg-[#F8F6F3] rounded p-3">
                  <p className="font-medium">{selectedOrder.shipping.name}</p>
                  <p className="text-sm text-[#666666]">{selectedOrder.shipping.phone}</p>
                  {selectedOrder.shipping.email && (
                    <p className="text-sm text-[#666666]">{selectedOrder.shipping.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-[#2D2D2D] flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Delivery Address
                </h3>
                <div className="bg-[#F8F6F3] rounded p-3">
                  <p className="text-sm">{selectedOrder.shipping.address}</p>
                  <p className="text-sm text-[#666666]">{selectedOrder.shipping.area}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-medium text-[#2D2D2D] flex items-center gap-2 mb-3">
                <Package className="w-4 h-4" /> Items
              </h3>
              <div className="bg-[#F8F6F3] rounded p-3 space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-[#666666]">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && ' | '}
                        {item.color && `Color: ${item.color}`}
                        {` × ${item.quantity}`}
                      </p>
                    </div>
                    <p className="font-medium">৳{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-[#F8F6F3] rounded p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-[#666666]">Subtotal</span>
                <span>৳{selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-[#666666]">Delivery</span>
                <span>৳{selectedOrder.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-[#D4C4B5] mt-2">
                <span>Total</span>
                <span className="text-[#1B4332]">৳{selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Status Update */}
            <div className="border-t border-[#F5F0E8] pt-6">
              <h3 className="font-medium text-[#2D2D2D] mb-3">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                    className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                      selectedOrder.status === status
                        ? 'border-[#1B4332] bg-[#1B4332] text-white'
                        : 'border-[#D4C4B5] hover:border-[#1B4332]'
                    }`}
                  >
                    {STATUS_CONFIG[status].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            {(selectedOrder.shipping.notes || selectedOrder.adminNotes) && (
              <div className="mt-6 border-t border-[#F5F0E8] pt-6">
                <h3 className="font-medium text-[#2D2D2D] mb-3">Notes</h3>
                {selectedOrder.shipping.notes && (
                  <div className="mb-3">
                    <p className="text-xs text-[#666666] mb-1">Customer Notes</p>
                    <p className="text-sm bg-[#F8F6F3] p-2 rounded">{selectedOrder.shipping.notes}</p>
                  </div>
                )}
                {selectedOrder.adminNotes && (
                  <div>
                    <p className="text-xs text-[#666666] mb-1">Admin Notes</p>
                    <p className="text-sm bg-amber-50 p-2 rounded">{selectedOrder.adminNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
