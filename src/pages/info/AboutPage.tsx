import { motion } from 'framer-motion';
import { Heart, Leaf, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '../../config';

const values = [
  {
    icon: Heart,
    title: 'Handmade with Care',
    body: 'Every product is crafted by skilled artisans who pour their heart into their work. We celebrate traditional craftsmanship and support local communities.',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    body: 'We personally inspect and select every item. Our strict quality standards ensure you receive only the finest products that will last.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Practices',
    body: 'From eco-friendly packaging to supporting local farmers and artisans, we\'re committed to sustainable and ethical business practices.',
  },
  {
    icon: Users,
    title: 'Community First',
    body: 'A portion of our profits supports education and skill development programs for women artisans across rural Bangladesh.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-elevated">
      {/* Header */}
      <div className="bg-canvas border-b border-line py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-ink-muted mb-5">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span>/</span>
            <span className="text-ink-secondary">About</span>
          </nav>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent mb-3">Our Story</p>
            <h1 className="font-serif text-4xl md:text-5xl font-medium text-ink tracking-tight max-w-2xl">
              Born from a love of Bangladeshi craft
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mb-16"
        >
          <div className="space-y-5 text-[#5A5A5A] text-base leading-relaxed">
            <p>
              <strong className="text-ink font-semibold">{BRAND_CONFIG.name}</strong> — meaning "tasteful" or "refined" in Bangla — was born from a simple belief: that everyday life deserves beauty, quality, and authenticity.
            </p>
            <p>
              From the intricate craftsmanship of traditional three-piece ensembles to the nostalgic flavors of homemade pitha, every item in our collection tells a story. We work directly with skilled artisans, local producers, and trusted partners across Bangladesh.
            </p>
            <p>
              Whether you're looking for a stunning outfit for Eid, a thoughtful gift for someone special, or the familiar taste of authentic Bengali cuisine, {BRAND_CONFIG.name} is here to bring refinement and quality into every aspect of your life.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent mb-8">What we stand for</p>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="border border-line p-6"
              >
                <div className="w-9 h-9 bg-canvas flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-accent" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-ink mb-2">{title}</h3>
                <p className="text-sm text-[#6A6A6A] leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-accent p-10 md:p-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent mb-4">
            Join Us
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-white mb-4 tracking-tight">
            Tasteful Living, for everyone
          </h2>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-8">
            Discover collections that celebrate Bangladesh's rich heritage — beautifully made, thoughtfully delivered.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-7 py-3.5 bg-elevated text-accent text-sm font-semibold hover:bg-surface transition-colors"
          >
            Shop the Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
