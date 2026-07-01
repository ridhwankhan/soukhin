import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import Badge from '../ui/Badge';
import ProductImage from '../ui/ProductImage';
import { useProtectedCart } from '../../hooks/useProtectedCart';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onRemove?: () => void;
}

const ProductCard = memo(function ProductCard({ product, onClick, onRemove }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem, isInCart } = useProtectedCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const [wishlistHint, setWishlistHint] = useState<string | null>(null);

  const isWishlisted = isInWishlist(product.id);
  const inCart = isInCart(product.id);
  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const imageSrc = product.images[0] || '';

  const handleView = () => {
    if (onClick) {
      onClick();
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = toggleItem(product);
    if (result === 'limit_reached') {
      setWishlistHint('Wishlist full (30 max)');
      window.setTimeout(() => setWishlistHint(null), 2500);
    } else {
      setWishlistHint(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-elevated rounded-sm shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-sm bg-surface">
        <button
          type="button"
          onClick={handleView}
          className="absolute inset-0 z-0 w-full h-full cursor-pointer"
          aria-label={`View ${product.name}`}
        />

        {imageSrc ? (
          <ProductImage
            src={imageSrc}
            alt={product.name}
            productId={product.id}
            productName={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted text-sm pointer-events-none">
            No image
          </div>
        )}

        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
          {product.badges.map(badge => (
            <Badge key={badge} badge={badge} size="sm" />
          ))}
        </div>

        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${
            isWishlisted ? 'bg-accent-soft text-white' : 'bg-elevated/90 text-ink-secondary hover:bg-accent-soft hover:text-white'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {onRemove && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute bottom-3 left-3 z-10 p-2 rounded-full bg-elevated/95 text-accent shadow-sm hover:bg-accent hover:text-white transition-colors"
            aria-label="Remove from wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {wishlistHint && (
          <div className="absolute bottom-3 left-2 right-2 z-10 rounded-sm bg-ink/85 text-white text-[10px] px-2 py-1 text-center">
            {wishlistHint}
          </div>
        )}

        <div className="absolute inset-0 z-10 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleView(); }}
            className="p-3 bg-elevated rounded-full shadow-md hover:bg-accent hover:text-white transition-colors"
            aria-label={`View ${product.name}`}
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); addItem(product, 1); }}
            disabled={product.stock === 0}
            className="p-3 bg-accent text-white rounded-full shadow-md hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-3 right-3 z-10 md:hidden">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); addItem(product, 1); }}
            disabled={product.stock === 0}
            className="p-2.5 bg-accent text-white rounded-full shadow-md hover:bg-accent-hover transition-colors disabled:opacity-50"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center pointer-events-none">
            <span className="bg-elevated px-4 py-2 text-ink font-medium rounded-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleView}
        className="w-full p-4 text-left"
      >
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
      </button>
    </motion.div>
  );
});

export default ProductCard;
