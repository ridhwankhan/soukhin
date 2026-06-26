import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { PendingAction } from '../lib/pendingAction';

export function useProtectedCart() {
  const cart = useCart();
  const { requireAuth } = useAuth();
  const location = useLocation();

  const guardAction = useCallback(
    (action: PendingAction, onAllowed: () => void) => {
      if (requireAuth(action, location.pathname + location.search)) {
        onAllowed();
      }
    },
    [requireAuth, location.pathname, location.search]
  );

  const addItem = useCallback(
    (product: Product, quantity: number, size?: string, color?: string) => {
      guardAction(
        { type: 'addToCart', product, quantity, size, color },
        () => cart.addItem(product, quantity, size, color)
      );
    },
    [cart, guardAction]
  );

  const goToCheckout = useCallback(
    (navigate: (path: string) => void) => {
      guardAction({ type: 'checkout' }, () => navigate('/checkout'));
    },
    [guardAction]
  );

  return {
    ...cart,
    addItem,
    goToCheckout,
    guardAction,
  };
}
