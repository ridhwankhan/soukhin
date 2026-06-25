import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import Button from '../../components/ui/Button';
import { useWishlist } from '../../context/WishlistContext';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <div className="bg-[#1B4332] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-serif font-semibold mb-2"
          >
            Wishlist
          </motion.h1>
          <p className="text-white/70">{items.length} saved items</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-[#D4C4B5] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-2">Your wishlist is empty</h2>
            <p className="text-[#666666] mb-6">Save items you love by clicking the heart icon</p>
            <Link to="/">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-[#666666]">{items.length} items</p>
              <button
                onClick={clearWishlist}
                className="text-sm text-[#C2704A] hover:underline"
              >
                Clear wishlist
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
