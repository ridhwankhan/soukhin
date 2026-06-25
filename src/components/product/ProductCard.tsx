import { memo } from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../../types';
import Badge from '../ui/Badge';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard = memo(function ProductCard({ product, onClick }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const isWishlisted = isInWishlist(product.id);
  const inCart = isInCart(product.id);
  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <article className="group relative bg-white flex flex-col">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F0E8]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />

        {/* Badges */}
        {product.badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badges.slice(0, 2).map(badge => (
              <Badge key={badge} badge={badge} size="sm" />
            ))}
          </div>
        )}

        {/* Discount */}
        {discountPct > 0 && (
          <div className="absolute top-3 right-3 bg-[#B5603E] text-white text-[10px] font-semibold px-1.5 py-0.5">
            -{discountPct}%
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); toggleItem(product); }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center transition-all duration-200 ${
            isWishlisted
              ? 'bg-[#B5603E] text-white opacity-100'
              : 'bg-white text-[#7A7A7A] opacity-0 group-hover:opacity-100 hover:text-[#B5603E]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-250 ease-out flex">
          <button
            onClick={e => { e.stopPropagation(); onClick?.(); }}
            aria-label="Quick view"
            className="flex-none w-11 h-11 bg-white text-[#4A4A4A] hover:bg-[#F5F0E8] flex items-center justify-center border-r border-[#E2D9CF] transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); if (product.stock > 0) addItem(product, 1); }}
            disabled={product.stock === 0}
            aria-label="Add to cart"
            className="flex-1 h-11 bg-[#1B4332] text-white text-xs font-semibold tracking-wide hover:bg-[#163828] disabled:bg-[#9A9A9A] disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock === 0 ? 'Out of Stock' : inCart ? 'Added' : 'Add to Cart'}
          </button>
        </div>

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-[#4A4A4A] tracking-wider uppercase bg-white px-3 py-1.5">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 pb-4 px-0.5">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9A7535] mb-1.5 truncate">
          {product.category.replace(/-/g, ' ')}
        </p>
        <h3 className="text-sm font-medium text-[#1A1A1A] leading-snug line-clamp-1 group-hover:text-[#1B4332] transition-colors duration-150 mb-0.5">
          {product.name}
        </h3>
        {product.nameBn && (
          <p className="text-[11px] text-[#9A9A9A] font-bengali mb-2 line-clamp-1">{product.nameBn}</p>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-[#1B4332]">
            ৳{displayPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-[#9A9A9A] line-through">
              ৳{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {product.sizeOptions && product.sizeOptions.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {product.sizeOptions.slice(0, 5).map(size => (
              <span key={size} className="px-1.5 py-0.5 text-[10px] border border-[#E2D9CF] text-[#7A7A7A] leading-none">
                {size}
              </span>
            ))}
            {product.sizeOptions.length > 5 && (
              <span className="text-[10px] text-[#9A9A9A] self-center">+{product.sizeOptions.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
});

export default ProductCard;
