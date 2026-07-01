import { SiteSettings } from '../types';

// Store contact — email public; WhatsApp uses dial code only (number not shown on site)
export const CONTACT_EMAIL = 'shoukhin.lifestyle.bd@gmail.com';
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Shoukhin — Customer enquiry')}`;
/** International format for wa.me (not displayed publicly) */
export const WHATSAPP_DIAL = '8801577577168';

// Site developer credit (footer)
export const DEVELOPER_NAME = 'Ridhwan';
export const DEVELOPER_EMAIL = 'ridhwankhan03@gmail.com';

// WhatsApp — defaults to store number; override with VITE_WHATSAPP_NUMBER on Vercel
export const WHATSAPP_NUMBER =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.trim() || WHATSAPP_DIAL;

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/** Canonical origin for auth email links — must match Supabase → Auth → URL Configuration. */
export function getSiteOrigin(): string {
  const configured = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim().replace(/\/$/, '');
  const current =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin.replace(/\/$/, '')
      : '';

  if (import.meta.env.PROD && configured) return configured;
  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) return configured;
  return current || configured || 'http://localhost:5173';
}

/** Redirect target embedded in Supabase confirmation / magic-link emails. */
export function getAuthRedirectUrl(path = '/auth?verified=1'): string {
  const base = getSiteOrigin();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export const SITE_SETTINGS: SiteSettings = {
  hero: {
    title: 'Tasteful Living, Delivered',
    titleBn: 'স্বাদের ঠিকানা, আপনার দোরগোড়ায়',
    subtitle: 'Premium Bangladeshi craftsmanship for the refined soul',
    subtitleBn: 'খাঁটি বাংলাদেশি হস্তশিল্প, শৌখিন মনের জন্য',
  },
  announcementBar: 'Free delivery on orders over ৳2000 | Use code: SOUKHIN10',
  announcementBarBn: '২০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি | কোড: SOUKHIN10',
  whatsappNumber: WHATSAPP_NUMBER,
  facebookLink: 'https://www.facebook.com/shoukhinl/',
  instagramLink: 'https://www.instagram.com/shoukhin_lifestyle?igsh=MXFvODE1eWFuMmpiag==',
  logo: '/images/logo.png',
  footerText: 'Shoukhin - Premium Bangladeshi Lifestyle Brand',
};

export const NAV_LINKS = [
  { href: '/', label: 'Home', labelBn: 'হোম' },
  { href: '/category/wearables', label: 'Wearables', labelBn: 'পোশাক', hasDropdown: true },
  { href: '/category/home-living', label: 'Home & Living', labelBn: 'ঘর ও জীবনযাত্রা', hasDropdown: true },
  { href: '/category/food-pitha', label: 'Food & Pitha', labelBn: 'খাবার ও পিঠা' },
  { href: '/category/jewelry', label: 'Jewelry', labelBn: 'গয়না', hasDropdown: true },
  { href: '/category/gifts', label: 'Gifts', labelBn: 'উপহার', hasDropdown: true },
  { href: '/category/new-arrivals', label: 'New Arrivals', labelBn: 'নতুন সংগ্রহ' },
];

export const NAV_DROPDOWNS = {
  wearables: {
   Women: [
      { href: '/category/women-three-piece', label: 'Three Piece', labelBn: 'থ্রি-পিস' },
      { href: '/category/women-dresses', label: 'Dresses', labelBn: 'পোশাক' },
      { href: '/category/women-sarees', label: 'Sarees', labelBn: 'শাড়ি' },
      { href: '/category/women-kurtis', label: 'Kurtis', labelBn: 'কুর্তি' },
      { href: '/category/women-shawls', label: 'Shawls', labelBn: 'শাল' },
    ],
    Men: [
      { href: '/category/men-panjabi', label: 'Panjabi', labelBn: 'পাঞ্জাবি' },
      { href: '/category/men-shirts', label: 'Shirts', labelBn: 'শার্ট' },
      { href: '/category/men-tshirts', label: 'T-shirts', labelBn: 'টি-শার্ট' },
      { href: '/category/men-waistcoats', label: 'Waistcoats', labelBn: 'ওয়েস্টকোট' },
    ],
    Kids: [
      { href: '/category/kids-girls', label: 'Girls', labelBn: 'মেয়ে' },
      { href: '/category/kids-boys', label: 'Boys', labelBn: 'ছেলে' },
      { href: '/category/kids-baby', label: 'Baby Wear', labelBn: 'বেবি পোশাক' },
    ],
    Accessories: [
      { href: '/category/accessories-bags', label: 'Bags', labelBn: 'ব্যাগ' },
      { href: '/category/accessories-scarves', label: 'Scarves', labelBn: 'স্কার্ফ' },
      { href: '/category/accessories-watches', label: 'Watches', labelBn: 'ঘড়ি' },
    ],
  },
  'home-living': {
    'Bedding & Decor': [
      { href: '/category/home-sheets', label: 'Bed Sheets', labelBn: 'বিছানার চাদর' },
      { href: '/category/home-cushions', label: 'Cushion Covers', labelBn: 'তাকিয়া' },
      { href: '/category/home-curtains', label: 'Curtains', labelBn: 'পর্দা' },
      { href: '/category/home-runners', label: 'Table Runners', labelBn: 'টেবিল রানার' },
      { href: '/category/home-towels', label: 'Towels', labelBn: 'তোয়ালে' },
      { href: '/category/home-decor', label: 'Home Decor', labelBn: 'ঘর সাজসজ্জা' },
    ],
  },
  jewelry: {
    'Jewelry': [
      { href: '/category/jewelry-earrings', label: 'Earrings', labelBn: 'কানের দুল' },
      { href: '/category/jewelry-necklaces', label: 'Necklaces', labelBn: 'হার' },
      { href: '/category/jewelry-bangles', label: 'Bangles', labelBn: 'চুড়ি' },
      { href: '/category/jewelry-rings', label: 'Rings', labelBn: 'আংটি' },
      { href: '/category/jewelry-bridal', label: 'Bridal/Festive', labelBn: 'বিয়ে/উৎসব' },
    ],
  },
  gifts: {
    'Gift Hampers': [
      { href: '/category/gifts', label: 'All Gift Hampers', labelBn: 'সব উপহার' },
    ],
    'Artisan Luxe': [
      { href: '/category/3d-prints', label: 'All Artisan Luxe', labelBn: 'সব আর্টিসান লাক্স' },
      { href: '/category/3d-bookmarks', label: 'Designer Bookmarks', labelBn: 'ডিজাইনার বুকমার্ক' },
      { href: '/category/3d-coasters', label: 'Luxury Coasters', labelBn: 'লাক্সারি কোস্টার' },
      { href: '/category/3d-wall-decor', label: 'Statement Wall Art', labelBn: 'ওয়াল আর্ট' },
      { href: '/category/3d-keyrings', label: 'Charm Keychains', labelBn: 'চার্ম কীচেইন' },
      { href: '/category/3d-printed-gifts', label: 'Curated Gift Pieces', labelBn: 'কিউরেটেড উপহার' },
      { href: '/category/3d-character-models', label: 'Icon Figurines', labelBn: 'আইকন ফিগারিন' },
    ],
    'More Gift Finds': [
      { href: '/category/bedsheets', label: 'Luxury Bedding', labelBn: 'লাক্সারি বিছানা' },
      { href: '/category/2d-art', label: 'Gallery Prints', labelBn: 'গ্যালারি আর্ট' },
      { href: '/category/dp-covers', label: 'Profile Studio', labelBn: 'প্রোফাইল স্টুডিও' },
      { href: '/category/3d-night-lights', label: 'Ambient Glow Lamps', labelBn: 'নাইট ল্যাম্প' },
    ],
  },
};

export const FOOTER_LINKS = {
  shop: [
    { href: '/category/wearables', label: 'Wearables' },
    { href: '/category/home-living', label: 'Home & Living' },
    { href: '/category/food-pitha', label: 'Food & Pitha' },
    { href: '/category/jewelry', label: 'Jewelry' },
    { href: '/category/gifts', label: 'Gifts' },
    { href: '/category/new-arrivals', label: 'New Arrivals' },
  ],
  info: [
    { href: '/about', label: 'About Shoukhin' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/track-order', label: 'Track Order' },
    { href: '/faq', label: 'FAQ' },
  ],
  policies: [
    { href: '/return-exchange', label: 'Return & Exchange' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
  ],
  staff: [
    { href: '/auth?mode=login&returnTo=%2Fadmin', label: 'Staff Sign In' },
  ],
};
