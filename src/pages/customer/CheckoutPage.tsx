import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, CreditCard, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { DELIVERY_AREAS, PAYMENT_METHODS, WHATSAPP_NUMBER } from '../../config';
import { PaymentMethod, ShippingInfo } from '../../types';
import { createOrder, completeOrderPayment } from '../../lib/orderService';
import { createBkashPayment } from '../../lib/bkashService';
import { ensureCustomerProfile, updateCustomerProfile } from '../../lib/customerService';
import { isValidEmail, isValidPhone } from '../../lib/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { items, getSubtotal, getDeliveryFee, getTotal, deliveryArea, setDeliveryArea, clearCart } = useCart();
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirm'>('shipping');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [shipping, setShipping] = useState<ShippingInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    area: 'inside-dhaka',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [bkashTrxId, setBkashTrxId] = useState('');

  const subtotal = getSubtotal();
  const deliveryFee = deliveryArea?.fee ?? 60;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (profile || user) {
      setShipping((prev) => ({
        ...prev,
        name: profile?.name || user?.user_metadata?.name || prev.name,
        phone: profile?.phone || user?.user_metadata?.phone || prev.phone,
        email: profile?.email || user?.email || prev.email,
        address: profile?.address || user?.user_metadata?.address || prev.address,
      }));
    }
  }, [profile, user]);

  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    if (!shipping.name.trim()) newErrors.name = 'Name is required';
    if (!shipping.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!isValidPhone(shipping.phone)) newErrors.phone = 'Invalid phone number';
    if (!shipping.email.trim()) newErrors.email = 'Email is required';
    else if (!isValidEmail(shipping.email)) newErrors.email = 'Invalid email address';
    if (!shipping.address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep('payment');
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/auth?mode=login&returnTo=/checkout');
      return;
    }

    setIsProcessing(true);
    setSubmitError('');

    try {
      const customer = await ensureCustomerProfile(user.id, {
        name: shipping.name,
        email: shipping.email,
        phone: shipping.phone,
        address: shipping.address,
      });

      await updateCustomerProfile(user.id, {
        name: shipping.name,
        phone: shipping.phone,
        address: shipping.address,
      });

      const orderResult = await createOrder({
        customerId: customer.id,
        customerName: shipping.name,
        customerPhone: shipping.phone,
        customerEmail: shipping.email,
        shippingAddress: shipping.address,
        shippingAreaSlug: deliveryArea?.id ?? 'inside-dhaka',
        shippingAreaLabel: deliveryArea?.name ?? shipping.area,
        shippingNotes: shipping.notes,
        paymentMethod: selectedPayment,
        items,
      });

      const { orderNumber, orderId, total: orderTotal } = orderResult;
      setOrderNumber(orderNumber);

      if (selectedPayment === 'bkash') {
        try {
          sessionStorage.setItem('soukhin_pending_bkash_order', JSON.stringify({ orderNumber, orderId }));
          const { bkashURL } = await createBkashPayment(orderId, orderTotal, orderNumber);
          clearCart();
          window.location.href = bkashURL;
          return;
        } catch {
          if (bkashTrxId.trim()) {
            await completeOrderPayment(orderId, bkashTrxId.trim());
          } else {
            setSubmitError(
              'bKash gateway is not configured yet. Your order was created — complete payment via bKash and enter your Transaction ID below, or contact us.'
            );
            setIsProcessing(false);
            return;
          }
        }
      } else if (selectedPayment === 'cod') {
        const whatsappMessage = generateWhatsAppMessage(orderNumber);
        if (WHATSAPP_NUMBER) {
          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
        }
      }

      await refreshProfile();
      setOrderComplete(true);
      clearCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setSubmitError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateWhatsAppMessage = (orderNum: string) => {
    const items_text = items
      .map(i => `- ${i.product.name} (${i.quantity}x) - ৳${((i.product.salePrice ?? i.product.price) * i.quantity).toLocaleString()}`)
      .join('\n');

    return `*New Order - ${orderNum}*

*Customer:*
${shipping.name}
Phone: ${shipping.phone}
${shipping.email ? `Email: ${shipping.email}` : ''}

*Address:*
${shipping.address}
Area: ${deliveryArea?.name}

*Order Items:*
${items_text}

*Subtotal:* ৳${subtotal.toLocaleString()}
*Delivery:* ৳${deliveryFee.toLocaleString()}
*Total:* ৳${total.toLocaleString()}

*Payment Method:* ${selectedPayment.toUpperCase()}
${shipping.notes ? `\n*Notes:* ${shipping.notes}` : ''}
    `.trim();
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">Your cart is empty</h2>
          <p className="text-ink-secondary mb-6">Add some products to checkout</p>
          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-ink mb-2">Order Confirmed!</h2>
          <p className="text-ink-secondary mb-4">Thank you for your order, {shipping.name}!</p>
          <p className="text-lg font-medium text-accent mb-6">Order #{orderNumber}</p>
          <Link to={`/track-order?order=${encodeURIComponent(orderNumber)}`} className="text-sm text-accent hover:underline mb-4 inline-block">
            Track this order →
          </Link>
          <p className="text-sm text-ink-secondary mb-8">
            {selectedPayment === 'cod'
              ? 'We will call you to confirm your order. Pay when you receive your package.'
              : 'We have received your order and will process it shortly.'}
          </p>
          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-accent text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          {['shipping', 'payment', 'confirm'].map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? 'bg-accent text-white'
                    : idx < ['shipping', 'payment', 'confirm'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-[#D4C4B5] text-ink-secondary'
                }`}
              >
                {idx + 1}
              </div>
              {idx < 2 && <div className="w-16 h-1 bg-[#D4C4B5]" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleShippingSubmit}
                className="bg-elevated rounded-lg p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-ink mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Information
                </h2>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={shipping.name}
                      onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                      error={errors.name}
                      placeholder="Enter your name"
                    />
                    <Input
                      label="Phone Number"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      error={errors.phone}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    error={errors.email}
                    placeholder="your@email.com"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Delivery Area</label>
                    <div className="grid grid-cols-3 gap-3">
                      {DELIVERY_AREAS.map((area) => (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => {
                            setDeliveryArea(area);
                            setShipping({ ...shipping, area: area.id });
                          }}
                          className={`p-3 border rounded-sm text-left transition-colors ${
                            deliveryArea?.id === area.id
                              ? 'border-accent bg-accent/5'
                              : 'border-line hover:border-accent'
                          }`}
                        >
                          <p className="font-medium text-sm">{area.name}</p>
                          <p className="text-xs text-ink-secondary">{area.estimatedDays}</p>
                          <p className="text-xs font-medium text-accent mt-1">
                            {area.fee === 0 ? 'Free' : `৳${area.fee}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Address</label>
                    <textarea
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      placeholder="House no, Road, Area, Landmark..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Order Notes (Optional)</label>
                    <textarea
                      value={shipping.notes}
                      onChange={(e) => setShipping({ ...shipping, notes: e.target.value })}
                      placeholder="Any special instructions..."
                      rows={2}
                      className="w-full px-4 py-2.5 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button type="submit" size="lg">Continue to Payment</Button>
                </div>
              </motion.form>
            )}

            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-elevated rounded-lg p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-ink mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const config = PAYMENT_CONFIG[method.id as keyof typeof PAYMENT_CONFIG];
                    const isEnabled = config?.enabled !== false && (method.id === 'cod' || config);

                    return (
                      <button
                        key={method.id}
                        onClick={() => isEnabled && setSelectedPayment(method.id as PaymentMethod)}
                        disabled={!isEnabled}
                        className={`w-full p-4 border rounded-sm text-left transition-all ${
                          selectedPayment === method.id
                            ? 'border-accent bg-accent/5'
                            : isEnabled
                            ? 'border-line hover:border-accent'
                            : 'border-line opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 ${
                                selectedPayment === method.id
                                  ? 'border-accent bg-accent'
                                  : 'border-line'
                              } flex items-center justify-center`}
                            >
                              {selectedPayment === method.id && (
                                <div className="w-2 h-2 bg-elevated rounded-full" />
                              )}
                            </div>
                            <span className="font-medium">{method.name}</span>
                          </div>
                          {!isEnabled && <span className="text-xs text-ink-secondary">Coming soon</span>}
                        </div>
                        {selectedPayment === method.id && (
                          <p className="mt-2 text-sm text-ink-secondary pl-8">
                            {method.instructions}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep('shipping')}>Back</Button>
                  <Button onClick={() => setStep('confirm')} size="lg">Review Order</Button>
                </div>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-elevated rounded-lg p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-ink mb-6 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Review Your Order
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-canvas rounded-sm">
                    <h3 className="font-medium text-sm text-ink-secondary mb-2">Shipping to</h3>
                    <p className="font-medium">{shipping.name}</p>
                    <p className="text-sm text-ink-secondary">{shipping.phone}</p>
                    <p className="text-sm text-ink-secondary">{shipping.address}</p>
                    <p className="text-sm text-ink-secondary">{deliveryArea?.name}</p>
                  </div>

                  <div className="p-4 bg-canvas rounded-sm">
                    <h3 className="font-medium text-sm text-ink-secondary mb-2">Payment</h3>
                    <p className="font-medium">{selectedPayment.toUpperCase()}</p>
                    {selectedPayment === 'bkash' && (
                      <div className="mt-3">
                        <Input
                          label="bKash Transaction ID (if paying manually)"
                          value={bkashTrxId}
                          onChange={(e) => setBkashTrxId(e.target.value)}
                          placeholder="Enter after sending payment"
                        />
                        <p className="text-xs text-ink-secondary mt-1">
                          If bKash gateway is enabled, you will be redirected automatically. Otherwise enter your Transaction ID here.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-canvas rounded-sm">
                    <h3 className="font-medium text-sm text-ink-secondary mb-2">Items ({items.length})</h3>
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.selectedSize}`} className="flex items-center gap-3 mb-2 last:mb-0">
                        <img src={item.product.images[0]} alt="" className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-ink-secondary">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">৳{((item.product.salePrice ?? item.product.price) * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                  <div className="text-right">
                    {submitError && (
                      <p className="text-sm text-red-500 mb-2 max-w-xs">{submitError}</p>
                    )}
                    <Button onClick={handlePlaceOrder} loading={isProcessing} size="lg">Place Order</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-elevated rounded-lg p-6 shadow-sm sticky top-24">
              <h3 className="font-semibold text-ink mb-4">Order Summary</h3>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-3">
                    <img src={item.product.images[0]} alt="" className="w-14 h-14 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-ink-secondary">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">৳{((item.product.salePrice ?? item.product.price) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-line pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-secondary">Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-secondary">Delivery</span>
                  <span>৳{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-line">
                  <span>Total</span>
                  <span className="text-accent">৳{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
