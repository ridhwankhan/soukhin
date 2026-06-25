import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem, Product, DeliveryArea } from '../types';
import { DELIVERY_AREAS } from '../config';

interface CartState {
  items: CartItem[];
  deliveryArea: DeliveryArea | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; size?: string; color?: string } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'SET_DELIVERY_AREA'; payload: DeliveryArea }
  | { type: 'CLEAR_CART' };

interface CartContextType extends CartState {
  addItem: (product: Product, quantity: number, size?: string, color?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDeliveryArea: (area: DeliveryArea) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  deliveryArea: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity, size, color } = action.payload;
      const existingIndex = state.items.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: Math.min(updatedItems[existingIndex].quantity + quantity, product.stock),
        };
        return { ...state, items: updatedItems };
      }

      return {
        ...state,
        items: [...state.items, { product, quantity, selectedSize: size, selectedColor: color }],
      };
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.payload.productId),
      };
    }
    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: Math.max(0, Math.min(action.payload.quantity, item.product.stock)) }
            : item
        ).filter(item => item.quantity > 0),
      };
    }
    case 'SET_DELIVERY_AREA': {
      return { ...state, deliveryArea: action.payload };
    }
    case 'CLEAR_CART': {
      return initialState;
    }
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    try {
      const saved = localStorage.getItem('soukhin_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed };
      }
    } catch {}
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('soukhin_cart', JSON.stringify(state));
  }, [state]);

  const addItem = (product: Product, quantity: number, size?: string, color?: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity, size, color } });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const setDeliveryArea = (area: DeliveryArea) => {
    dispatch({ type: 'SET_DELIVERY_AREA', payload: area });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemCount = () => state.items.reduce((sum, item) => sum + item.quantity, 0);

  const getSubtotal = () =>
    state.items.reduce((sum, item) => {
      const price = item.product.salePrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);

  const getDeliveryFee = () => state.deliveryArea?.fee ?? 0;

  const getTotal = () => getSubtotal() + getDeliveryFee();

  const isInCart = (productId: string) =>
    state.items.some(item => item.product.id === productId);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        setDeliveryArea,
        clearCart,
        getItemCount,
        getSubtotal,
        getDeliveryFee,
        getTotal,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
