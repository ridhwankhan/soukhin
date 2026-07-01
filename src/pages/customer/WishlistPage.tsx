import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { useWishlist, WISHLIST_MAX_ITEMS } from '../../context/WishlistContext';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist, limitMessage, clearLimitMessage } = useWishlist();

  return (
    <div className="min-h-screen bg-elevated">
      {/* Header */}
      <div className="bg-canvas border-b border-line py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-ink-muted mb-4">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span>/</span>
            <span className="text-ink-secondary">Wishlist</span>
          </nav>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink tracking-tight">
                Wishlist
              </h1>
              <p className="text-ink-muted text-sm mt-1">
                {items.length} of {WISHLIST_MAX_ITEMS} saved {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearWishlist}
                className="flex items-center gap-1.5 text-sm text-accent hover:underline font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {limitMessage && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-sm border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-ink">
            <span>{limitMessage}</span>
            <button type="button" onClick={clearLimitMessage} className="text-accent font-medium hover:underline shrink-0">
              Dismiss
            </button>
          </div>
        )}
        {items.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 border-2 border-line flex items-center justify-center mx-auto mb-5">
              <Heart className="w-7 h-7 text-[#C0B8B0]" />
            </div>
            <h2 className="text-lg font-semibold text-ink mb-2">Your wishlist is empty</h2>
            <p className="text-ink-muted text-sm mb-8">Save items you love by clicking the heart icon on any product.</p>
            <Link to="/" className="btn-primary inline-flex">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {items.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <ProductCard
                  product={product}
                  onRemove={() => removeItem(product.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
