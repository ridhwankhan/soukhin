import { motion } from 'framer-motion';
import { Heart, Leaf, Award, Users } from 'lucide-react';
import { BRAND_CONFIG } from '../../config';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <div className="bg-[#1B4332] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-semibold mb-4"
          >
            About {BRAND_CONFIG.name}
          </motion.h1>
          <p className="text-xl text-white/70">{BRAND_CONFIG.nameBn}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg max-w-none"
        >
          <div className="bg-white rounded-lg p-8 md:p-12 shadow-sm mb-8">
            <h2 className="text-2xl font-serif font-semibold text-[#2D2D2D] mb-4">Our Story</h2>
            <p className="text-[#666666] leading-relaxed mb-6">
              {BRAND_CONFIG.name} - meaning "tasteful" or "refined" in Bangla - was born from a simple belief: that everyday life deserves beauty, quality, and authenticity. We are a premium Bangladeshi lifestyle brand dedicated to bringing you handpicked collections that celebrate our rich heritage while embracing modern elegance.
            </p>
            <p className="text-[#666666] leading-relaxed mb-6">
              From the intricate craftsmanship of traditional three-piece ensembles to the nostalgic flavors of homemade pitha, every item in our collection tells a story. We work directly with skilled artisans, local producers, and trusted partners across Bangladesh to source products that meet our uncompromising standards.
            </p>
            <p className="text-[#666666] leading-relaxed">
              Whether you're looking for a stunning outfit for Eid, a thoughtful gift for someone special, or the familiar taste of authentic Bengali cuisine, {BRAND_CONFIG.name} is here to bring refinement and quality into every aspect of your life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#1B4332]/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[#1B4332]" />
              </div>
              <h3 className="font-semibold text-[#2D2D2D] mb-2">Handmade with Care</h3>
              <p className="text-sm text-[#666666]">
                Every product is crafted by skilled artisans who pour their heart into their work. We celebrate traditional craftsmanship and support local communities.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold text-[#2D2D2D] mb-2">Premium Quality</h3>
              <p className="text-sm text-[#666666]">
                We personally inspect and select every item. Our strict quality standards ensure you receive only the finest products that will last for years.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#C2704A]/10 rounded-full flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-[#C2704A]" />
              </div>
              <h3 className="font-semibold text-[#2D2D2D] mb-2">Sustainable Practices</h3>
              <p className="text-sm text-[#666666]">
                From eco-friendly packaging to supporting local farmers and artisans, we're committed to sustainable and ethical business practices.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#1B4332]/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#1B4332]" />
              </div>
              <h3 className="font-semibold text-[#2D2D2D] mb-2">Community First</h3>
              <p className="text-sm text-[#666666]">
                We believe in giving back. A portion of our profits supports education and skill development programs for women artisans in rural Bangladesh.
              </p>
            </div>
          </div>

          <div className="bg-[#1B4332] rounded-lg p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl font-serif font-semibold mb-4">Join Our Journey</h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              We invite you to be part of the {BRAND_CONFIG.name} family. Follow us on social media, subscribe to our newsletter, and discover the stories behind our products.
            </p>
            <p className="text-lg font-medium">
              {BRAND_CONFIG.name} - শৌখিন - Tasteful Living
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
