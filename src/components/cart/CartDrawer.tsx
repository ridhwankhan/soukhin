import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { BRAND_CONFIG } from '../../config';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount } = useCart();
  const subtotal = getSubtotal();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-white z-50 flex flex-col shadow-2xl"
            aria-label="Shopping cart"
            role="dialog"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2D9CF]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-[18px] h-[18px] text-[#1B4332]" strokeWidth={1.75} />
                <h2 className="text-base font-semibold text-[#1A1A1A]">Cart</h2>
                {getItemCount() > 0 && (
                  <span className="text-xs text-[#9A9A9A]">({getItemCount()})</span>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="w-8 h-8 flex items-center justify-center text-[#7A7A7A] hover:text-[#1A1A1A] hover:bg-[#F5F0E8] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
                  <div className="w-14 h-14 border-2 border-[#E2D9CF] flex items-center justify-center mb-4">
                    <ShoppingBag className="w-6 h-6 text-[#C0B8B0]" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-[#1A1A1A] mb-1.5">Your cart is empty</p>
                  <p className="text-xs text-[#9A9A9A] mb-6">Add items to get started</p>
                  <button
                    onClick={onClose}
                    className="btn-primary text-sm px-6 py-2.5"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-[#F5F0E8]">
                  {items.map(item => {
                    const key = `${item.product.id}-${item.selectedSize ?? ''}-${item.selectedColor ?? ''}`;
                    const price = (item.product.salePrice ?? item.product.price) * item.quantity;
                    return (
                      <li key={key} className="flex gap-3.5 px-5 py-4">
                        <div className="w-16 h-20 flex-shrink-0 overflow-hidden bg-[#F5F0E8]">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A1A1A] line-clamp-2 leading-snug">
                            {item.product.name}
                          </p>
                          {(item.selectedSize || item.selectedColor) && (
                            <p className="text-xs text-[#9A9A9A] mt-0.5">
                              {[item.selectedSize, item.selectedColor].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center border border-[#E2D9CF]">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-[#F9F7F4] transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3 text-[#4A4A4A]" />
                              </button>
                              <span className="w-7 text-center text-sm font-medium text-[#1A1A1A]">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-[#F9F7F4] transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3 text-[#4A4A4A]" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-[#1B4332]">
                              {BRAND_CONFIG.currency.symbol}{price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          aria-label="Remove item"
                          className="flex-shrink-0 self-start mt-0.5 p-1.5 text-[#C0B8B0] hover:text-[#B5603E] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#E2D9CF] px-5 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#7A7A7A]">Subtotal</span>
                  <span className="text-base font-semibold text-[#1A1A1A]">
                    {BRAND_CONFIG.currency.symbol}{subtotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[#9A9A9A]">Delivery fee calculated at checkout</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={onClose}
                    className="py-3 border border-[#E2D9CF] text-sm font-medium text-[#4A4A4A] hover:bg-[#F9F7F4] transition-colors"
                  >
                    Continue
                  </button>
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="py-3 bg-[#1B4332] text-white text-sm font-medium text-center hover:bg-[#163828] transition-colors"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
