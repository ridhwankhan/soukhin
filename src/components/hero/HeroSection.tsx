import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HERO_IMAGE = '/images/hero.png';

export default function HeroSection() {
  return (
    <section className="relative w-full bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Padded frame — image keeps full aspect ratio, never stretched/cropped */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#EDE8E0] shadow-[0_8px_40px_rgba(27,67,50,0.08)] ring-1 ring-accent/5"
        >
          <img
            src={HERO_IMAGE}
            alt="Soukhin — premium Bangladeshi lifestyle collection"
            className="block w-full h-auto max-h-[min(72vh,820px)] object-contain object-center mx-auto"
            loading="eager"
            fetchPriority="high"
            width={1920}
            height={1080}
          />
        </motion.div>

        {/* CTAs below the image — branding stays visible in the photo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
        >
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-accent mb-2">
              Bangladeshi Craftsmanship
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-ink leading-tight">
              Tasteful Living, <span className="italic text-accent">Delivered.</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-ink-secondary">
              Wearables, pitha, jewelry & gifts — curated with care.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/category/wearables"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent text-white text-sm font-medium tracking-wide hover:bg-accent-hover transition-colors group shadow-md"
            >
              Shop Collection
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/category/new-arrivals"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-accent/30 text-accent text-sm font-medium tracking-wide hover:bg-accent/5 transition-colors"
            >
              New Arrivals
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
