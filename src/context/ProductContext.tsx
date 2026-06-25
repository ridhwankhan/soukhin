import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductBadge } from '../types';
import { products as staticProducts } from '../data/products';

const STORAGE_KEY = 'soukhin_product_overrides';

type Override = { badges?: ProductBadge[]; salePrice?: number | null };
type Overrides = Record<string, Override>;

interface ProductContextType {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  updateProductBadges: (id: string, badges: ProductBadge[]) => void;
  updateProductSalePrice: (id: string, salePrice: number | undefined) => void;
  resetProduct: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | null>(null);

const merge = (base: Product[], ov: Overrides): Product[] =>
  base.map(p => {
    const o = ov[p.id];
    if (!o) return p;
    return {
      ...p,
      badges: o.badges ?? p.badges,
      salePrice: o.salePrice !== undefined ? (o.salePrice ?? undefined) : p.salePrice,
    };
  });

export function ProductProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides>({});
  const [products, setProducts] = useState<Product[]>(staticProducts);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) {
        const parsed: Overrides = JSON.parse(s);
        setOverrides(parsed);
        setProducts(merge(staticProducts, parsed));
      }
    } catch {}
  }, []);

  const persist = (ov: Overrides) => {
    setOverrides(ov);
    setProducts(merge(staticProducts, ov));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ov));
  };

  const updateProductBadges = (id: string, badges: ProductBadge[]) =>
    persist({ ...overrides, [id]: { ...overrides[id], badges } });

  const updateProductSalePrice = (id: string, salePrice: number | undefined) =>
    persist({ ...overrides, [id]: { ...overrides[id], salePrice: salePrice ?? null } });

  const resetProduct = (id: string) => {
    const { [id]: _, ...rest } = overrides;
    persist(rest);
  };

  const getProduct = (id: string) => products.find(p => p.id === id);

  return (
    <ProductContext.Provider value={{ products, getProduct, updateProductBadges, updateProductSalePrice, resetProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
}
