import { memo } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../../types';
import Badge from '../ui/Badge';
import { useProtectedCart } from '../../hooks/useProtectedCart';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard = memo(function ProductCard({ product, onClick }: ProductCardProps) {
  const { addItem, isInCart } = useProtectedCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const isWishlisted = isInWishlist(product.id);
  const inCart = isInCart(product.id);
  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const imageSrc = product.images[0] || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-elevated rounded-sm shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-sm bg-surface">
        {imageSrc ? (
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted text-sm">No image</div>
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.badges.map(badge => (
            <Badge key={badge} badge={badge} size="sm" />
          ))}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); toggleItem(product); }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isWishlisted ? 'bg-accent-soft text-white' : 'bg-elevated/90 text-ink-secondary hover:bg-accent-soft hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            className="p-3 bg-elevated rounded-full shadow-md hover:bg-accent hover:text-white transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); addItem(product, 1); }}
            disabled={product.stock === 0}
            className="p-3 bg-accent text-white rounded-full shadow-md hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-elevated px-4 py-2 text-ink font-medium rounded-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-accent uppercase tracking-wide mb-1 font-semibold">
          {product.category.replace('-', ' ')}
        </p>
        <h3 className="font-semibold text-ink mb-1 line-clamp-1 group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-ink-secondary mb-2">{product.nameBn}</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-accent">
            ৳{displayPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-ink-secondary line-through">
              ৳{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {product.sizeOptions && product.sizeOptions.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {product.sizeOptions.slice(0, 4).map(size => (
              <span key={size} className="px-2 py-0.5 text-xs border border-line rounded-sm text-ink-secondary">
                {size}
              </span>
            ))}
          </div>
        )}

        {inCart && (
          <p className="mt-2 text-xs text-accent font-medium">Added to cart</p>
        )}
      </div>
    </motion.div>
  );
});

export default ProductCard;
