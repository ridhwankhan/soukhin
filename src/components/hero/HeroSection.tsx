import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HERO_IMAGE = '/images/hero.png';

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#F9F7F4]">
      {/* Full-width brand hero image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full"
      >
        <img
          src={HERO_IMAGE}
          alt="Soukhin — premium Bangladeshi lifestyle collection"
          className="w-full h-auto max-h-[85vh] object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/50 via-transparent to-transparent pointer-events-none" />
      </motion.div>

      {/* CTA overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 sm:px-8 pb-8 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6"
        >
          <div className="text-white drop-shadow-md max-w-lg">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#E8D5A3] mb-2">
              Bangladeshi Craftsmanship
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium leading-tight">
              Tasteful Living, <span className="italic">Delivered.</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/category/wearables"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#1B4332] text-sm font-medium tracking-wide hover:bg-[#F5F0E8] transition-colors group shadow-lg"
            >
              Shop Collection
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/category/new-arrivals"
              className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/90 text-white text-sm font-medium tracking-wide hover:bg-white/10 transition-colors"
            >
              New Arrivals
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
