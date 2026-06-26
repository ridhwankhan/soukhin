import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { PendingAction } from '../../lib/pendingAction';

interface CartResumeHandlerProps {
  onOpenCart?: () => void;
}

export default function CartResumeHandler({ onOpenCart }: CartResumeHandlerProps) {
  const location = useLocation();
  const { addItem } = useCart();

  useEffect(() => {
    const state = location.state as {
      resumeCartAction?: PendingAction;
      openCart?: boolean;
    } | null;

    if (state?.resumeCartAction?.type === 'addToCart') {
      const { product, quantity, size, color } = state.resumeCartAction;
      addItem(product, quantity, size, color);
      window.history.replaceState({}, document.title);
    }

    if (state?.openCart) {
      onOpenCart?.();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, addItem, onOpenCart]);

  return null;
}
