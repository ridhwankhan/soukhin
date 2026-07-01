import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, Package, Truck, Leaf } from 'lucide-react';
import { Product } from '../../types';
import ProductImage from '../ui/ProductImage';
import Button from '../ui/Button';
import { useProtectedCart } from '../../hooks/useProtectedCart';
import { useWishlist } from '../../context/WishlistContext';
import { BRAND_CONFIG } from '../../config';

interface ProductDetailProps {
  product: Product;
  onClose?: () => void;
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizeOptions?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colorOptions?.[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem, isInCart } = useProtectedCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const isWishlisted = isInWishlist(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
      <div className="space-y-4">
        <div className="relative aspect-square bg-surface rounded-lg overflow-hidden">
          <ProductImage
            src={product.images[selectedImage]}
            alt={product.name}
            productId={product.id}
            productName={product.name}
            className="w-full h-full object-cover"
          />
          {product.badges.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {product.badges.map(badge => (
                <Badge key={badge} badge={badge} />
              ))}
            </div>
          )}
        </div>

        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${
                  selectedImage === idx ? 'border-accent' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm text-accent uppercase tracking-wide mb-2 font-semibold">
            {product.category.replace('-', ' ')}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-ink font-serif">{product.name}</h2>
          <p className="text-ink-secondary mt-1">{product.nameBn}</p>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-accent">{BRAND_CONFIG.currency.symbol}{displayPrice.toLocaleString()}</span>
          {hasDiscount && (
            <>
              <span className="text-xl text-ink-secondary line-through">{BRAND_CONFIG.currency.symbol}{product.price.toLocaleString()}</span>
              <span className="px-2 py-1 bg-accent-soft text-white text-sm rounded-sm">
                {Math.round((1 - product.salePrice! / product.price) * 100)}% off
              </span>
            </>
          )}
        </div>

        <p className="text-ink-secondary leading-relaxed">{product.description}</p>

        {product.sizeOptions && product.sizeOptions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-ink mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizeOptions.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-sm transition-colors ${
                    selectedSize === size
                      ? 'border-accent bg-accent text-white'
                      : 'border-line hover:border-accent'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colorOptions && product.colorOptions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-ink mb-2">Color</p>
            <div className="flex flex-wrap gap-2">
              {product.colorOptions.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border rounded-sm transition-colors ${
                    selectedColor === color
                      ? 'border-accent bg-accent text-white'
                      : 'border-line hover:border-accent'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center border border-line rounded-sm">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-3 hover:bg-surface transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-3 font-medium min-w-[60px] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
              className="p-3 hover:bg-surface transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            size="lg"
            className="flex-1"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {product.stock === 0 ? 'Out of Stock' : inCart ? 'Add More' : 'Add to Cart'}
          </Button>

          <button
            onClick={() => toggleItem(product)}
            className={`p-3 rounded-sm border transition-colors ${
              isWishlisted
                ? 'border-accent-soft bg-accent-soft text-white'
                : 'border-line hover:border-accent-soft'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="border-t border-line pt-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-ink-secondary">
            <Package className="w-4 h-4 text-accent" />
            <span>SKU: {product.sku}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-secondary">
            <Package className="w-4 h-4 text-accent" />
            <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>
          {product.foodNote && (
            <div className="flex items-center gap-3 text-sm text-ink-secondary">
              <Leaf className="w-4 h-4 text-accent" />
              <span>{product.foodNote}</span>
            </div>
          )}
          {product.deliveryNote && (
            <div className="flex items-center gap-3 text-sm text-ink-secondary">
              <Truck className="w-4 h-4 text-accent" />
              <span>{product.deliveryNote}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
