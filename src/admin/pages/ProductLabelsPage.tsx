import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, X, Search, RefreshCw } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { ProductBadge, PRODUCT_BADGE_LABELS } from '../../types';

const ALL_BADGES: ProductBadge[] = ['new', 'eid-collection', 'best-seller', 'pre-order', 'featured', 'sale', 'limited-edition'];

const BADGE_COLORS: Record<ProductBadge, string> = {
  'new': 'bg-accent text-white',
  'eid-collection': 'bg-[#9A7535] text-white',
  'best-seller': 'bg-[#B5603E] text-white',
  'pre-order': 'bg-[#5A4A6A] text-white',
  'featured': 'bg-[#1A5276] text-white',
  'sale': 'bg-red-600 text-white',
  'limited-edition': 'bg-[#4A4A4A] text-white',
};

export default function ProductLabelsPage() {
  const { products, updateProductBadges, resetProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ProductBadge | 'all'>('all');
  const [saved, setSaved] = useState<string | null>(null);

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.badges.includes(filter as ProductBadge);
    return matchSearch && matchFilter && p.isActive;
  });

  const toggleBadge = (productId: string, badge: ProductBadge, currentBadges: ProductBadge[]) => {
    const newBadges = currentBadges.includes(badge)
      ? currentBadges.filter(b => b !== badge)
      : [...currentBadges, badge];
    updateProductBadges(productId, newBadges);
    setSaved(productId);
    setTimeout(() => setSaved(null), 1500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Product Labels</h1>
        <p className="text-sm text-ink-muted mt-0.5">Add or remove labels/badges on products — visible to customers on product cards</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
          <input
            type="text"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-line text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium border transition-colors ${filter === 'all' ? 'bg-accent text-white border-accent' : 'border-line text-ink-secondary hover:bg-canvas'}`}
          >
            All
          </button>
          {ALL_BADGES.map(badge => (
            <button
              key={badge}
              onClick={() => setFilter(badge)}
              className={`px-3 py-1.5 text-xs font-medium border transition-colors ${filter === badge ? BADGE_COLORS[badge] + ' border-transparent' : 'border-line text-ink-secondary hover:bg-canvas'}`}
            >
              {PRODUCT_BADGE_LABELS[badge]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-ink-muted mb-3">{filtered.length} product{filtered.length !== 1 ? 's' : ''} shown</p>

      {/* Product list */}
      <div className="space-y-2">
        {filtered.map(product => (
          <motion.div
            key={product.id}
            layout
            className={`bg-elevated border transition-colors ${saved === product.id ? 'border-accent' : 'border-line'} p-4`}
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="w-12 h-14 flex-shrink-0 overflow-hidden bg-surface">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink line-clamp-1">{product.name}</p>
                    <p className="text-xs text-ink-muted mt-0.5">SKU: {product.sku} · Stock: {product.stock}</p>
                  </div>
                  {saved === product.id && (
                    <span className="text-xs font-medium text-accent flex-shrink-0">Saved ✓</span>
                  )}
                </div>

                {/* Badge toggles */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {ALL_BADGES.map(badge => {
                    const active = product.badges.includes(badge);
                    return (
                      <button
                        key={badge}
                        onClick={() => toggleBadge(product.id, badge, product.badges)}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium border transition-all ${
                          active
                            ? BADGE_COLORS[badge] + ' border-transparent'
                            : 'bg-elevated border-line text-ink-muted hover:border-[#4A4A4A]'
                        }`}
                      >
                        {active && <Tag className="w-2.5 h-2.5" />}
                        {PRODUCT_BADGE_LABELS[badge]}
                        {active && <X className="w-2.5 h-2.5 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => resetProduct(product.id)}
                title="Reset to original labels"
                className="flex-shrink-0 p-1.5 text-[#C0B8B0] hover:text-ink-muted transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-elevated border border-line py-12 text-center">
            <Tag className="w-7 h-7 text-[#D4C4B5] mx-auto mb-3" />
            <p className="text-sm text-ink-muted">No products match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
