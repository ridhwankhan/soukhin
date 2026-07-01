import { createContext, useContext, useReducer, ReactNode, useEffect, useState, useCallback } from 'react';
import { Product } from '../types';

export const WISHLIST_MAX_ITEMS = 30;

export type WishlistToggleResult = 'added' | 'removed' | 'limit_reached';

interface WishlistContextType {
  items: Product[];
  maxItems: number;
  addItem: (product: Product) => boolean;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => WishlistToggleResult;
  clearWishlist: () => void;
  limitMessage: string | null;
  clearLimitMessage: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' };

function wishlistReducer(state: Product[], action: WishlistAction): Product[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      if (state.some(item => item.id === action.payload.id)) {
        return state;
      }
      if (state.length >= WISHLIST_MAX_ITEMS) {
        return state;
      }
      return [...state, action.payload];
    }
    case 'REMOVE_ITEM': {
      return state.filter(item => item.id !== action.payload);
    }
    case 'CLEAR_WISHLIST': {
      return [];
    }
    default:
      return state;
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(wishlistReducer, [], () => {
    try {
      const saved = localStorage.getItem('soukhin_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved) as Product[];
        return Array.isArray(parsed) ? parsed.slice(0, WISHLIST_MAX_ITEMS) : [];
      }
    } catch {}
    return [];
  });
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('soukhin_wishlist', JSON.stringify(items));
  }, [items]);

  const clearLimitMessage = useCallback(() => setLimitMessage(null), []);

  const addItem = useCallback((product: Product): boolean => {
    if (items.some(item => item.id === product.id)) {
      return true;
    }
    if (items.length >= WISHLIST_MAX_ITEMS) {
      setLimitMessage(`Wishlist is full (${WISHLIST_MAX_ITEMS} items max). Remove an item to add another.`);
      return false;
    }
    dispatch({ type: 'ADD_ITEM', payload: product });
    setLimitMessage(null);
    return true;
  }, [items]);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    setLimitMessage(null);
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.some(item => item.id === productId),
    [items]
  );

  const toggleItem = useCallback((product: Product): WishlistToggleResult => {
    if (isInWishlist(product.id)) {
      removeItem(product.id);
      return 'removed';
    }
    if (!addItem(product)) {
      return 'limit_reached';
    }
    return 'added';
  }, [addItem, isInWishlist, removeItem]);

  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    setLimitMessage(null);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        maxItems: WISHLIST_MAX_ITEMS,
        addItem,
        removeItem,
        isInWishlist,
        toggleItem,
        clearWishlist,
        limitMessage,
        clearLimitMessage,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
