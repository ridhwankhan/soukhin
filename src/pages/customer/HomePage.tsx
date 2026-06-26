import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, Shield, Award, Heart } from 'lucide-react';
import HeroSection from '../../components/hero/HeroSection';
import ProductCard from '../../components/product/ProductCard';
import { fetchFeaturedProducts, fetchNewArrivals } from '../../lib/productService';
import { getTopLevelCategories } from '../../lib/categoryService';
import { Product, Category } from '../../types';

export default function HomePage() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [shopCategories, setShopCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchFeaturedProducts(8).then(setFeaturedProducts).catch(() => setFeaturedProducts([]));
    fetchNewArrivals(8).then(setNewArrivals).catch(() => setNewArrivals([]));
    getTopLevelCategories().then(setShopCategories).catch(() => setShopCategories([]));
  }, []);

  const banners = [
    { image: 'https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg', title: 'Eid Collection', subtitle: 'Elegant Wearables for Everyone', link: '/category/wearables' },
    { image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', title: 'Homemade Delights', subtitle: 'Traditional Pitha & Food', link: '/category/food-pitha' },
    { image: 'https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg', title: 'Gift Hampers', subtitle: 'Curated with Love', link: '/category/gifts' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Categories */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[#2D2D2D] mb-3">Shop by Category</h2>
            <p className="text-[#666666]">Explore our lifestyle collection</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {shopCategories.map((category, index) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/category/${category.slug}`}
                  className="group block"
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-[#F5F0E8]">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="font-medium text-[#2D2D2D] group-hover:text-[#1B4332] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-[#666666]">{category.nameBn}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
      <section className="py-16 md:py-24 bg-[#F8F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[#2D2D2D] mb-2">Featured Products</h2>
              <p className="text-[#666666]">Handpicked by our team</p>
            </div>
            <Link
              to="/category/new-arrivals"
              className="flex items-center gap-2 text-[#1B4332] font-medium hover:underline"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Banner Carousel */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentBanner === idx ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center text-white px-4">
              <div>
                <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4">{banner.title}</h2>
                <p className="text-xl md:text-2xl mb-8">{banner.subtitle}</p>
                <Link
                  to={banner.link}
                  className="px-8 py-3 bg-white text-[#1B4332] rounded-sm font-medium hover:bg-[#F5F0E8] transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevBanner}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentBanner === idx ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[#2D2D2D] mb-2">New Arrivals</h2>
              <p className="text-[#666666]">Fresh additions to our collection</p>
            </div>
            <Link
              to="/category/new-arrivals"
              className="flex items-center gap-2 text-[#1B4332] font-medium hover:underline"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Trust Badges */}
      <section className="py-16 bg-[#1B4332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Fast Delivery', desc: '1-5 days across Bangladesh' },
              { icon: Shield, title: 'Quality Assured', desc: 'Premium products only' },
              { icon: Award, title: 'Authentic', desc: '100% genuine products' },
              { icon: Heart, title: 'Made with Love', desc: 'Local artisans' },
            ].map((item, idx) => (
              <div key={idx} className="text-center text-white">
                <item.icon className="w-10 h-10 mx-auto mb-3 opacity-80" />
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-24 bg-[#F8F6F3]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-semibold text-[#2D2D2D] mb-3">Stay Connected</h2>
          <p className="text-[#666666] mb-6">Subscribe to our newsletter for updates on new collections and special offers.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#1B4332] text-white rounded-sm font-medium hover:bg-[#163828] transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
