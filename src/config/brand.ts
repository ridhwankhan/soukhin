export const BRAND_CONFIG = {
  name: 'Soukhin',
  nameBn: 'শৌখিন',
  tagline: 'Tasteful Living',
  taglineBn: 'স্বাদের ঠিকানা',
  description: 'Premium Bangladeshi lifestyle brand offering ladies wear, three-piece outfits, homemade food, pitha, snacks, and curated gift items.',
  descriptionBn: 'প্রিমিয়াম বাংলাদেশি লাইফস্টাইল ব্র্যান্ড - নারী পোশাক, থ্রি-পিস, হোমমেড খাবার, পিঠা, স্ন্যাকস এবং সুনির্বাচিত উপহার।',

  colors: {
    primary: '#1B4332',      // Deep green
    secondary: '#F5F0E8',    // Ivory
    accent: '#B8860B',        // Muted gold
    terracotta: '#C2704A',    // Terracotta
    softBlack: '#2D2D2D',    // Soft black
    white: '#FFFFFF',
    lightGray: '#F8F6F3',
    mediumGray: '#D4C4B5',
    darkGray: '#666666',
  },

  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
    bengali: "'Hind Siliguri', sans-serif",
  },

  social: {
    facebook: '',
    instagram: '',
    whatsapp: '',
  },

  currency: {
    symbol: '৳',
    code: 'BDT',
    locale: 'bn-BD',
  },

  defaultMeta: {
    title: 'Soukhin | শৌখিন - Premium Bangladeshi Lifestyle Brand',
    description: 'Shop premium ladies wear, three-piece outfits, homemade food, pitha, snacks, and gift items. Elegant Bangladeshi craftsmanship delivered to your door.',
  },
};

export type BrandConfig = typeof BRAND_CONFIG;
