import { Category, CategorySlug } from '../types';

export const categories: Category[] = [
  {
    id: 'cat-1',
    slug: 'wearables',
    name: 'Wearables',
    nameBn: 'পোশাক',
    description: 'Fashion for everyone - women, men, and kids',
    image: 'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg',
    productCount: 45,
  },
  {
    id: 'cat-2',
    slug: 'home-living',
    name: 'Home & Living',
    nameBn: 'ঘর ও জীবনযাত্রা',
    description: 'Premium home textiles and decor',
    image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg',
    productCount: 28,
  },
  {
    id: 'cat-3',
    slug: 'food-pitha',
    name: 'Food & Pitha',
    nameBn: 'খাবার ও পিঠা',
    description: 'Homemade traditional pitha and authentic Bengali delicacies',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    productCount: 15,
  },
  {
    id: 'cat-4',
    slug: 'jewelry',
    name: 'Jewelry',
    nameBn: 'গয়না',
    description: 'Handcrafted artisan jewelry',
    image: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg',
    productCount: 22,
  },
  {
    id: 'cat-5',
    slug: 'gifts',
    name: 'Gifts',
    nameBn: 'উপহার',
    description: 'Curated gift hampers for every occasion',
    image: 'https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg',
    productCount: 10,
  },
  {
    id: 'cat-6',
    slug: 'new-arrivals',
    name: 'New Arrivals',
    nameBn: 'নতুন সংগ্রহ',
    description: 'Our latest additions to the Soukhin family',
    image: 'https://images.pexels.com/photos/606554/pexels-photo-606554.jpeg',
    productCount: 8,
  },
];

export const subcategories: Record<string, Category[]> = {
  'wearables': [
    { id: 'w-women', slug: 'women-three-piece', name: 'Three Piece', nameBn: 'থ্রি-পিস', description: 'Premium three-piece sets', image: 'https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg', productCount: 12 },
    { id: 'w-women-2', slug: 'women-dresses', name: 'Dresses', nameBn: 'পোশাক', description: 'Elegant dresses', image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg', productCount: 8 },
    { id: 'w-women-3', slug: 'women-sarees', name: 'Sarees', nameBn: 'শাড়ি', description: 'Traditional sarees', image: 'https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg', productCount: 6 },
    { id: 'w-women-4', slug: 'women-kurtis', name: 'Kurtis', nameBn: 'কুর্তি', description: 'Stylish kurtis', image: 'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg', productCount: 10 },
    { id: 'w-women-5', slug: 'women-shawls', name: 'Shawls', nameBn: 'শাল', description: 'Warm shawls', image: 'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg', productCount: 4 },
    { id: 'w-men', slug: 'men-panjabi', name: 'Panjabi', nameBn: 'পাঞ্জাবি', description: 'Traditional panjabi', image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg', productCount: 8 },
    { id: 'w-men-2', slug: 'men-shirts', name: 'Shirts', nameBn: 'শার্ট', description: 'Formal and casual shirts', image: 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg', productCount: 6 },
    { id: 'w-men-3', slug: 'men-tshirts', name: 'T-shirts', nameBn: 'টি-শার্ট', description: 'Comfortable t-shirts', image: 'https://images.pexels.com/photos/493453/pexels-photo-493453.jpeg', productCount: 5 },
    { id: 'w-men-4', slug: 'men-waistcoats', name: 'Waistcoats', nameBn: 'ওয়েস্টকোট', description: 'Stylish waistcoats', image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg', productCount: 3 },
    { id: 'w-kids', slug: 'kids-girls', name: 'Girls', nameBn: 'মেয়ে', description: 'Girls fashion', image: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg', productCount: 5 },
    { id: 'w-kids-2', slug: 'kids-boys', name: 'Boys', nameBn: 'ছেলে', description: 'Boys fashion', image: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg', productCount: 4 },
    { id: 'w-kids-3', slug: 'kids-baby', name: 'Baby Wear', nameBn: 'বেবি পোশাক', description: 'Baby clothes', image: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg', productCount: 3 },
    { id: 'w-acc', slug: 'accessories-bags', name: 'Bags', nameBn: 'ব্যাগ', description: 'Stylish bags', image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', productCount: 4 },
    { id: 'w-acc-2', slug: 'accessories-scarves', name: 'Scarves', nameBn: 'স্কার্ফ', description: 'Beautiful scarves', image: 'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg', productCount: 3 },
    { id: 'w-acc-3', slug: 'accessories-watches', name: 'Watches', nameBn: 'ঘড়ি', description: 'Elegant watches', image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', productCount: 2 },
  ],
  'home-living': [
    { id: 'h-1', slug: 'home-sheets', name: 'Bed Sheets', nameBn: 'বিছানার চাদর', description: 'Premium bed sheets', image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', productCount: 8 },
    { id: 'h-2', slug: 'home-cushions', name: 'Cushion Covers', nameBn: 'তাকিয়া', description: 'Designer cushion covers', image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', productCount: 6 },
    { id: 'h-3', slug: 'home-curtains', name: 'Curtains', nameBn: 'পর্দা', description: 'Beautiful curtains', image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', productCount: 5 },
    { id: 'h-4', slug: 'home-runners', name: 'Table Runners', nameBn: 'টেবিল রানার', description: 'Elegant table runners', image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', productCount: 4 },
    { id: 'h-5', slug: 'home-towels', name: 'Towels', nameBn: 'তোয়ালে', description: 'Soft towels', image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', productCount: 3 },
    { id: 'h-6', slug: 'home-decor', name: 'Home Decor', nameBn: 'ঘর সাজসজ্জা', description: 'Decorative items', image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', productCount: 2 },
  ],
  'jewelry': [
    { id: 'j-1', slug: 'jewelry-earrings', name: 'Earrings', nameBn: 'কানের দুল', description: 'Beautiful earrings', image: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg', productCount: 8 },
    { id: 'j-2', slug: 'jewelry-necklaces', name: 'Necklaces', nameBn: 'হার', description: 'Elegant necklaces', image: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg', productCount: 6 },
    { id: 'j-3', slug: 'jewelry-bangles', name: 'Bangles', nameBn: 'চুড়ি', description: 'Traditional bangles', image: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg', productCount: 5 },
    { id: 'j-4', slug: 'jewelry-rings', name: 'Rings', nameBn: 'আংটি', description: 'Stunning rings', image: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg', productCount: 4 },
    { id: 'j-5', slug: 'jewelry-bridal', name: 'Bridal/Festive', nameBn: 'বিয়ে/উৎসব', description: 'Special occasion jewelry', image: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg', productCount: 3 },
  ],
};

export function getCategoryBySlug(slug: CategorySlug): Category | undefined {
  return categories.find(c => c.slug === slug);
}

export function getSubcategories(parentSlug: string): Category[] {
  return subcategories[parentSlug] || [];
}

export function getAllSlugs(): string[] {
  const allSlugs = categories.map(c => c.slug);
  Object.values(subcategories).forEach(subs => {
    subs.forEach(sub => allSlugs.push(sub.slug));
  });
  return allSlugs;
}
