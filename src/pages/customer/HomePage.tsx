import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import HeroSection from '../../components/hero/HeroSection';
import ProductCard from '../../components/product/ProductCard';
import { getFeaturedProducts, getNewArrivals } from '../../data';

const categories = [
  {
    slug: 'wearables',
    name: 'Wearables',
    nameBn: 'পোশাক',
    image: 'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg',
    count: '120+ styles',
  },
  {
    slug: 'home-living',
    name: 'Home & Living',
    nameBn: 'ঘর ও জীবনযাত্রা',
    image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg',
    count: '60+ items',
  },
  {
    slug: 'food-pitha',
    name: 'Food & Pitha',
    nameBn: 'খাবার ও পিঠা',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    count: '30+ varieties',
  },
  {
    slug: 'jewelry',
    name: 'Jewelry',
    nameBn: 'গয়না',
    image: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg',
    count: '80+ pieces',
  },
  {
    slug: 'gifts',
    name: 'Gift Hampers',
    nameBn: 'উপহার',
    image: 'https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg',
    count: '20+ sets',
  },
];

const promises = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'On all orders over ৳2,000 within Bangladesh',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    description: 'Every product is carefully inspected before dispatch',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '7-day hassle-free return on eligible items',
  },
  {
    icon: Sparkles,
    title: 'Artisan Made',
    description: 'Sourced directly from skilled Bangladeshi makers',
  },
];

const inViewVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();
  const newArrivals = getNewArrivals();

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <HeroSection />

      {/* Category Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7535] mb-2">Browse</p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#1A1A1A] tracking-tight">
                Shop by Category
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                variants={inViewVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <Link to={`/category/${cat.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F0E8] mb-3">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[#1A1A1A]/0 group-hover:bg-[#1A1A1A]/10 transition-colors duration-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#1B4332] transition-colors duration-150">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#9A9A9A] mt-0.5">{cat.count}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-[#F9F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7535] mb-2">Curated</p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#1A1A1A] tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              to="/category/wearables"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#1B4332] hover:gap-2.5 transition-all duration-150"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {featuredProducts.slice(0, 8).map((product, i) => (
              <motion.div
                key={product.id}
                variants={inViewVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link to="/category/wearables" className="btn-outline inline-flex">
              View all products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Banner */}
      <section className="relative overflow-hidden">
        <div className="aspect-[16/7] md:aspect-[16/5] lg:aspect-[16/4] relative">
          <img
            src="https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg"
            alt="Eid Collection 2025"
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/70 via-[#1A1A1A]/40 to-transparent flex items-center">
            <div className="px-8 sm:px-12 lg:px-16 max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#D4A84A] mb-3">
                Eid Collection 2025
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight mb-5 tracking-tight">
                Dress for<br />
                Every Celebration
              </h2>
              <Link
                to="/category/wearables"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#1A1A1A] text-sm font-semibold tracking-wide hover:bg-[#F5F0E8] transition-colors"
              >
                Explore Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7535] mb-2">Just In</p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#1A1A1A] tracking-tight">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/category/new-arrivals"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#1B4332] hover:gap-2.5 transition-all duration-150"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {newArrivals.slice(0, 8).map((product, i) => (
              <motion.div
                key={product.id}
                variants={inViewVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Promises */}
      <section className="py-14 md:py-20 border-y border-[#E2D9CF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {promises.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                variants={inViewVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="flex flex-col items-start gap-3"
              >
                <div className="w-10 h-10 bg-[#1B4332]/8 flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px] text-[#1B4332]" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">{title}</h3>
                  <p className="text-xs text-[#7A7A7A] leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Food & Pitha Spotlight */}
      <section className="py-16 md:py-24 bg-[#F9F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              variants={inViewVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#E8E2D8]">
                <img
                  src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                  alt="Traditional Bangladeshi pitha"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 hidden sm:block w-32 h-32 bg-[#1B4332] flex items-center justify-center text-center p-4">
                <div className="text-white">
                  <span className="font-serif text-2xl font-medium block leading-none">৳850</span>
                  <span className="text-[10px] opacity-70 tracking-wide">per box</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={inViewVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7535] mb-4">
                Handmade with Love
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#1A1A1A] leading-tight tracking-tight mb-5">
                Traditional Pitha<br />
                &amp; Homemade Food
              </h2>
              <p className="text-[#6A6A6A] text-base leading-relaxed mb-8 max-w-md">
                Made fresh using ancestral recipes passed down through generations. No preservatives, no shortcuts — just the authentic taste of Bangladesh.
              </p>
              <ul className="space-y-2.5 mb-8">
                {['Chitoi, Patishapta & Bhapa Pitha', 'Homemade beef, chicken & mutton', 'Traditional snacks & sweets', 'Fresh to order, delivered frozen'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-[#4A4A4A]">
                    <span className="w-1 h-1 rounded-full bg-[#9A7535] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/category/food-pitha"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1B4332] text-white text-sm font-medium tracking-wide hover:bg-[#163828] transition-colors group"
              >
                Order Now
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gift Hampers Strip */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              variants={inViewVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7535] mb-4">
                Thoughtfully Curated
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#1A1A1A] leading-tight tracking-tight mb-5">
                Gift Hampers<br />
                for Every Occasion
              </h2>
              <p className="text-[#6A6A6A] text-base leading-relaxed mb-8 max-w-md">
                From Eid and weddings to birthdays and housewarmings — our curated hampers are beautifully wrapped and ready to delight.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['Eid Hampers', 'Wedding Gifts', 'Corporate Sets', 'Birthday Boxes'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 border border-[#E2D9CF] text-xs font-medium text-[#4A4A4A]">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                to="/category/gifts"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#1A1A1A] text-[#1A1A1A] text-sm font-medium tracking-wide hover:bg-[#1A1A1A] hover:text-white transition-colors group"
              >
                Browse Hampers
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <motion.div
              variants={inViewVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="order-1 lg:order-2 aspect-[4/3] overflow-hidden bg-[#F5F0E8]"
            >
              <img
                src="https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg"
                alt="Gift hampers"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-20 bg-[#1B4332]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            variants={inViewVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A7535] mb-3">
              Stay Updated
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-white tracking-tight mb-3">
              New arrivals, straight to your inbox
            </h2>
            <p className="text-white/55 text-sm mb-8">
              Subscribe and get 10% off your first order. No spam — unsubscribe any time.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-0 max-w-sm mx-auto"
              onSubmit={e => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your@email.com"
                required
                aria-label="Email address"
                className="flex-1 px-4 py-3.5 bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/60 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-white text-[#1B4332] text-sm font-semibold hover:bg-[#F5F0E8] transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
