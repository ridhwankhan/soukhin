export const BRAND_CONFIG = {
  name: 'Shoukhin',
  nameBn: 'শৌখিন',
  tagline: 'Tasteful Living',
  taglineBn: 'স্বাদের ঠিকানা',
  description: 'Premium Bangladeshi lifestyle brand offering ladies wear, three-piece outfits, homemade food, pitha, snacks, and curated gift items.',
  descriptionBn: 'প্রিমিয়াম বাংলাদেশি লাইফস্টাইল ব্র্যান্ড - নারী পোশাক, থ্রি-পিস, হোমমেড খাবার, পিঠা, স্ন্যাকস এবং সুনির্বাচিত উপহার।',

  colors: {
    light: {
      canvas: '#F9F8F6',
      surface: '#EFE9E3',
      muted: '#D9CFC7',
      accent: '#C9B59C',
    },
    dark: {
      canvas: '#222831',
      surface: '#393E46',
      accent: '#00ADB5',
      ink: '#EEEEEE',
    },
    primary: '#C9B59C',
    secondary: '#EFE9E3',
    accent: '#C9B59C',
    terracotta: '#C2704A',
    softBlack: '#2A2622',
    white: '#FFFFFF',
    lightGray: '#F9F8F6',
    mediumGray: '#D9CFC7',
    darkGray: '#5C534C',
  },

  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
    bengali: "'Hind Siliguri', sans-serif",
  },

  social: {
    facebook: '',
    instagram: '',
    whatsapp: '8801577577168',
  },

  currency: {
    symbol: '৳',
    code: 'BDT',
    locale: 'bn-BD',
  },

  defaultMeta: {
    title: 'Shoukhin | শৌখিন - Premium Bangladeshi Lifestyle Brand',
    description: 'Shop premium ladies wear, three-piece outfits, homemade food, pitha, snacks, and gift items. Elegant Bangladeshi craftsmanship delivered to your door.',
  },
};

export type BrandConfig = typeof BRAND_CONFIG;
