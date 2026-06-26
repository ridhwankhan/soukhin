import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useProtectedCart } from '../../hooks/useProtectedCart';
import { BRAND_CONFIG } from '../../config';
import Button from '../ui/Button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount } = useCart();
  const { goToCheckout } = useProtectedCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const subtotal = getSubtotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-elevated z-50 flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-line">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-ink">Shopping Cart</h2>
                <span className="text-sm text-ink-secondary">({getItemCount()} items)</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-[#D4C4B5] mb-4" />
                  <p className="text-ink-secondary mb-4">Your cart is empty</p>
                  <Button onClick={onClose}>Continue Shopping</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 p-3 bg-canvas rounded-sm">
                      <div className="w-20 h-20 flex-shrink-0 rounded-sm overflow-hidden">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-ink text-sm line-clamp-1">{item.product.name}</h3>
                        {(item.selectedSize || item.selectedColor) && (
                          <p className="text-xs text-ink-secondary">
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            {item.selectedSize && item.selectedColor && <span> | </span>}
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-line rounded-sm">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-surface"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-surface"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-medium text-accent">
                            {BRAND_CONFIG.currency.symbol}{((item.product.salePrice ?? item.product.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-2 text-ink-secondary hover:text-[#C2704A] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-line p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-ink-secondary">Subtotal</span>
                  <span className="text-lg font-semibold text-ink">
                    {BRAND_CONFIG.currency.symbol}{subtotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary">Delivery fee calculated at checkout</p>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/" onClick={onClose}>
                    <Button variant="outline" className="w-full">Continue Shopping</Button>
                  </Link>
                  <Button
                    className="w-full"
                    onClick={() => {
                      onClose();
                      goToCheckout(navigate);
                    }}
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
