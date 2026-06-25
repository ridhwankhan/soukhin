import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const heroImages = [
  'https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg',
  'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg',
];

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[calc(100vh-92px)] flex flex-col lg:flex-row overflow-hidden bg-[#F9F7F4]">

      {/* Left — Content */}
      <div className="relative z-10 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 pt-12 pb-10 lg:py-0 lg:w-[48%] xl:w-[44%]">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#9A7535] mb-5">
            Bangladeshi Craftsmanship
          </p>

          <h1 className="font-serif text-[2.6rem] sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-medium text-[#1A1A1A] leading-[1.1] tracking-[-0.02em] mb-6">
            Tasteful&nbsp;Living,<br />
            <span className="italic text-[#1B4332]">Delivered.</span>
          </h1>

          <p className="text-[#6A6A6A] text-base sm:text-[1.05rem] leading-relaxed max-w-md mb-8">
            Premium wearables, traditional pitha, handcrafted jewelry, and curated gifts — made by artisans who care.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/category/wearables"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1B4332] text-white text-sm font-medium tracking-wide hover:bg-[#163828] transition-colors duration-200 group"
            >
              Shop Collection
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/category/new-arrivals"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#1A1A1A]/20 text-[#1A1A1A] text-sm font-medium tracking-wide hover:border-[#1B4332] hover:text-[#1B4332] transition-colors duration-200"
            >
              New Arrivals
            </Link>
          </div>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 lg:mt-16 flex items-center gap-6 flex-wrap"
        >
          {[
            { num: '500+', label: 'Products' },
            { num: '5K+', label: 'Happy Customers' },
            { num: '1–3 Days', label: 'Delivery' },
          ].map(({ num, label }) => (
            <div key={label} className="flex flex-col">
              <span className="font-serif text-xl font-semibold text-[#1B4332] leading-none">{num}</span>
              <span className="text-xs text-[#8A8A8A] mt-1">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right — Images */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.1 }}
        className="relative lg:flex-1 w-full h-[55vw] sm:h-[50vw] lg:h-auto min-h-[320px] overflow-hidden"
      >
        {/* Primary image — large */}
        <div className="absolute inset-0">
          <img
            src={heroImages[0]}
            alt="Soukhin collection — premium Bangladeshi wearables"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F9F7F4]/30 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#F9F7F4]/60 lg:via-[#F9F7F4]/10 lg:to-transparent pointer-events-none" />
        </div>

        {/* Floating product card */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 bg-white shadow-xl p-3.5 w-44 sm:w-52"
        >
          <div className="aspect-[3/2] overflow-hidden mb-2.5 bg-[#F5F0E8]">
            <img
              src={heroImages[1]}
              alt="Featured product"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#9A7535] mb-0.5">New Arrival</p>
          <p className="text-xs font-medium text-[#1A1A1A] line-clamp-1">Designer Three Piece</p>
          <p className="text-sm font-semibold text-[#1B4332] mt-1">৳3,800</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
