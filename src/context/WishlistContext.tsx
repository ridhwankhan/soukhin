import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product } from '../types';

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
  clearWishlist: () => void;
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
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('soukhin_wishlist', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const isInWishlist = (productId: string) => items.some(item => item.id === productId);

  const toggleItem = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        toggleItem,
        clearWishlist,
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
