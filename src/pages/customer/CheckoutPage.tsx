import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, CreditCard, MessageCircle, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { DELIVERY_AREAS, PAYMENT_METHODS, PAYMENT_CONFIG, BRAND_CONFIG, WHATSAPP_NUMBER } from '../../config';
import { PaymentMethod, ShippingInfo } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function CheckoutPage() {
  const navigate = useNavigate();
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

  const subtotal = getSubtotal();
  const deliveryFee = deliveryArea?.fee ?? 60;
  const total = subtotal + deliveryFee;

  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    if (!shipping.name.trim()) newErrors.name = 'Name is required';
    if (!shipping.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^01[3-9]\d{8}$/.test(shipping.phone)) newErrors.phone = 'Invalid phone number';
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
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newOrderNumber = `SK-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    setOrderNumber(newOrderNumber);

    if (selectedPayment === 'cod' || !PAYMENT_CONFIG[selectedPayment]?.apiKey) {
      const whatsappMessage = generateWhatsAppMessage(newOrderNumber);
      const phone = WHATSAPP_NUMBER || '880XXXXXXXXXX';

      if (WHATSAPP_NUMBER) {
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
      }
    }

    setOrderComplete(true);
    setIsProcessing(false);
    clearCart();
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
      <div className="min-h-screen bg-[#F8F6F3] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-4">Your cart is empty</h2>
          <p className="text-[#666666] mb-6">Add some products to checkout</p>
          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#F8F6F3] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-2">Order Confirmed!</h2>
          <p className="text-[#666666] mb-4">Thank you for your order, {shipping.name}!</p>
          <p className="text-lg font-medium text-[#1B4332] mb-6">Order #{orderNumber}</p>
          <p className="text-sm text-[#666666] mb-8">
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
    <div className="min-h-screen bg-[#F8F6F3]">
      <div className="bg-[#1B4332] text-white py-8">
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
                    ? 'bg-[#1B4332] text-white'
                    : idx < ['shipping', 'payment', 'confirm'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-[#D4C4B5] text-[#666666]'
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
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-[#2D2D2D] mb-6 flex items-center gap-2">
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
                    label="Email (Optional)"
                    type="email"
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    placeholder="your@email.com"
                  />

                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Delivery Area</label>
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
                              ? 'border-[#1B4332] bg-[#1B4332]/5'
                              : 'border-[#D4C4B5] hover:border-[#1B4332]'
                          }`}
                        >
                          <p className="font-medium text-sm">{area.name}</p>
                          <p className="text-xs text-[#666666]">{area.estimatedDays}</p>
                          <p className="text-xs font-medium text-[#1B4332] mt-1">
                            {area.fee === 0 ? 'Free' : `৳${area.fee}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Address</label>
                    <textarea
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      placeholder="House no, Road, Area, Landmark..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-none"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Order Notes (Optional)</label>
                    <textarea
                      value={shipping.notes}
                      onChange={(e) => setShipping({ ...shipping, notes: e.target.value })}
                      placeholder="Any special instructions..."
                      rows={2}
                      className="w-full px-4 py-2.5 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-none"
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
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-[#2D2D2D] mb-6 flex items-center gap-2">
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
                            ? 'border-[#1B4332] bg-[#1B4332]/5'
                            : isEnabled
                            ? 'border-[#D4C4B5] hover:border-[#1B4332]'
                            : 'border-[#D4C4B5] opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 ${
                                selectedPayment === method.id
                                  ? 'border-[#1B4332] bg-[#1B4332]'
                                  : 'border-[#D4C4B5]'
                              } flex items-center justify-center`}
                            >
                              {selectedPayment === method.id && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <span className="font-medium">{method.name}</span>
                          </div>
                          {!isEnabled && <span className="text-xs text-[#666666]">Coming soon</span>}
                        </div>
                        {selectedPayment === method.id && (
                          <p className="mt-2 text-sm text-[#666666] pl-8">
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
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-[#2D2D2D] mb-6 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Review Your Order
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-[#F8F6F3] rounded-sm">
                    <h3 className="font-medium text-sm text-[#666666] mb-2">Shipping to</h3>
                    <p className="font-medium">{shipping.name}</p>
                    <p className="text-sm text-[#666666]">{shipping.phone}</p>
                    <p className="text-sm text-[#666666]">{shipping.address}</p>
                    <p className="text-sm text-[#666666]">{deliveryArea?.name}</p>
                  </div>

                  <div className="p-4 bg-[#F8F6F3] rounded-sm">
                    <h3 className="font-medium text-sm text-[#666666] mb-2">Payment</h3>
                    <p className="font-medium">{selectedPayment.toUpperCase()}</p>
                  </div>

                  <div className="p-4 bg-[#F8F6F3] rounded-sm">
                    <h3 className="font-medium text-sm text-[#666666] mb-2">Items ({items.length})</h3>
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.selectedSize}`} className="flex items-center gap-3 mb-2 last:mb-0">
                        <img src={item.product.images[0]} alt="" className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-[#666666]">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">৳{((item.product.salePrice ?? item.product.price) * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                  <Button onClick={handlePlaceOrder} loading={isProcessing} size="lg">Place Order</Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
              <h3 className="font-semibold text-[#2D2D2D] mb-4">Order Summary</h3>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-3">
                    <img src={item.product.images[0]} alt="" className="w-14 h-14 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-[#666666]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">৳{((item.product.salePrice ?? item.product.price) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#F5F0E8] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666666]">Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666666]">Delivery</span>
                  <span>৳{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-[#F5F0E8]">
                  <span>Total</span>
                  <span className="text-[#1B4332]">৳{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
