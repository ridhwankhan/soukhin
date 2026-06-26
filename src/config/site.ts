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
  { href: '/category/gifts', label: 'Gifts', labelBn: 'উপহার' },
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
