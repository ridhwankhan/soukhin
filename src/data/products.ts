import { Product } from '../types';

export const products: Product[] = [
  // Wearables - Women Three Piece
  {
    id: 'prod-1',
    name: 'Designer Three Piece - Midnight Bloom',
    nameBn: 'ডিজাইনার থ্রি-পিস - মিডনাইট ব্লুম',
    category: 'women-three-piece',
    price: 4200,
    salePrice: 3800,
    images: [
      'https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg',
      'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg',
    ],
    stock: 15,
    sku: 'W-TP001',
    description: 'Premium three-piece set with kameez, palazzo, and matching dupatta. Features hand embroidery on premium cotton fabric.',
    sizeOptions: ['S', 'M', 'L', 'XL'],
    colorOptions: ['Midnight Blue', 'Maroon', 'Emerald'],
    tags: ['three-piece', 'designer', 'hand-embroidery'],
    isActive: true,
    isFeatured: true,
    badges: ['best-seller'],
    createdAt: '2024-02-10',
    updatedAt: '2024-06-01',
  },
  {
    id: 'prod-2',
    name: 'Elegant Three Piece - Royal Gold',
    nameBn: 'এলিগ্যান্ট থ্রি-পিস - রয়্যাল গোল্ড',
    category: 'women-three-piece',
    price: 6500,
    images: [
      'https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg',
    ],
    stock: 8,
    sku: 'W-TP002',
    description: 'Exclusive three-piece with intricate gold embroidery. Limited edition for special occasions.',
    sizeOptions: ['S', 'M', 'L'],
    colorOptions: ['Gold', 'Rose Gold'],
    tags: ['three-piece', 'eid', 'limited-edition'],
    isActive: true,
    isFeatured: true,
    badges: ['eid-collection', 'new'],
    createdAt: '2024-05-28',
    updatedAt: '2024-06-01',
  },

  // Wearables - Women Sarees
  {
    id: 'prod-3',
    name: 'Muslin Saree - Golden Twilight',
    nameBn: 'মসলিন শাড়ি - গোল্ডেন টোইলাইট',
    category: 'women-sarees',
    price: 3500,
    images: [
      'https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg',
    ],
    stock: 12,
    sku: 'W-SR001',
    description: 'Delicate muslin saree with golden border. A timeless piece for special occasions.',
    tags: ['saree', 'muslin', 'occasion'],
    isActive: true,
    isFeatured: true,
    badges: ['new'],
    createdAt: '2024-05-20',
    updatedAt: '2024-06-01',
  },

  // Wearables - Women Kurtis
  {
    id: 'prod-4',
    name: 'Cotton Kurti - Spring Bloom',
    nameBn: 'সুতি কুর্তি - স্প্রিং ব্লুম',
    category: 'women-kurtis',
    price: 1450,
    salePrice: 1250,
    images: [
      'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg',
    ],
    stock: 30,
    sku: 'W-KT001',
    description: 'Fresh cotton kurti with floral print. Lightweight cotton fabric for everyday comfort.',
    sizeOptions: ['S', 'M', 'L', 'XL'],
    colorOptions: ['Soft Peach', 'Lilac', 'Mint'],
    tags: ['kurti', 'cotton', 'everyday'],
    isActive: true,
    isFeatured: true,
    badges: ['best-seller'],
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'prod-5',
    name: 'Festive Kurti - Ruby Red',
    nameBn: 'ফেস্টিভ কুর্তি - রুবি রেড',
    category: 'women-kurtis',
    price: 1850,
    images: [
      'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg',
    ],
    stock: 25,
    sku: 'W-KT002',
    description: 'Elegant kurti in rich ruby red with block print design. Perfect for Eid celebrations.',
    sizeOptions: ['S', 'M', 'L', 'XL'],
    tags: ['kurti', 'festive', 'block-print'],
    isActive: true,
    isFeatured: false,
    badges: ['eid-collection'],
    createdAt: '2024-04-01',
    updatedAt: '2024-06-01',
  },

  // Wearables - Men Panjabi
  {
    id: 'prod-6',
    name: 'Panjabi - Classic Elegance',
    nameBn: 'পাঞ্জাবি - ক্লাসিক এলিগ্যান্স',
    category: 'men-panjabi',
    price: 2500,
    images: [
      'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    ],
    stock: 20,
    sku: 'M-PB001',
    description: 'Traditional panjabi with modern styling. Perfect for Eid and special occasions.',
    sizeOptions: ['S', 'M', 'L', 'XL', 'XXL'],
    colorOptions: ['White', 'Light Blue', 'Cream'],
    tags: ['panjabi', 'traditional', 'eid'],
    isActive: true,
    isFeatured: true,
    badges: ['eid-collection'],
    createdAt: '2024-03-15',
    updatedAt: '2024-06-01',
  },

  // Wearables - Men Shirts
  {
    id: 'prod-7',
    name: 'Formal Shirt - Navy Blue',
    nameBn: 'ফর্মাল শার্ট - নেভি ব্লু',
    category: 'men-shirts',
    price: 1800,
    images: [
      'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg',
    ],
    stock: 25,
    sku: 'M-SH001',
    description: 'Premium cotton formal shirt. Perfect for office and formal occasions.',
    sizeOptions: ['S', 'M', 'L', 'XL'],
    colorOptions: ['Navy', 'White', 'Light Blue'],
    tags: ['shirt', 'formal', 'office'],
    isActive: true,
    isFeatured: false,
    badges: [],
    createdAt: '2024-02-20',
    updatedAt: '2024-06-01',
  },

  // Wearables - Kids Girls
  {
    id: 'prod-8',
    name: 'Girls Dress - Floral Dreams',
    nameBn: 'মেয়েদের পোশাক - ফ্লোরাল ড্রিমস',
    category: 'kids-girls',
    price: 950,
    images: [
      'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg',
    ],
    stock: 18,
    sku: 'K-GL001',
    description: 'Pretty floral dress for girls. Comfortable cotton fabric.',
    sizeOptions: ['3-4Y', '5-6Y', '7-8Y', '9-10Y'],
    tags: ['dress', 'girls', 'floral'],
    isActive: true,
    isFeatured: true,
    badges: ['new'],
    createdAt: '2024-05-10',
    updatedAt: '2024-06-01',
  },

  // Wearables - Accessories Bags
  {
    id: 'prod-9',
    name: 'Leather Handbag - Classic Brown',
    nameBn: 'লেদার হ্যান্ডব্যাগ - ক্লাসিক ব্রাউন',
    category: 'accessories-bags',
    price: 2800,
    images: [
      'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    ],
    stock: 15,
    sku: 'A-BG001',
    description: 'Premium leather handbag. Spacious and stylish for everyday use.',
    colorOptions: ['Brown', 'Black', 'Tan'],
    tags: ['bag', 'leather', 'premium'],
    isActive: true,
    isFeatured: false,
    badges: [],
    createdAt: '2024-04-05',
    updatedAt: '2024-06-01',
  },

  // Home & Living - Bed Sheets
  {
    id: 'prod-10',
    name: 'Premium Bed Sheet Set - Royal Blue',
    nameBn: 'প্রিমিয়াম বিছানার চাদর সেট - রয়্যাল ব্লু',
    category: 'home-sheets',
    price: 2200,
    images: [
      'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg',
    ],
    stock: 15,
    sku: 'H-BS001',
    description: 'Luxurious cotton bed sheet set with pillow covers. 100% premium cotton.',
    tags: ['bedding', 'bedroom', 'premium'],
    isActive: true,
    isFeatured: true,
    badges: ['best-seller'],
    createdAt: '2024-03-01',
    updatedAt: '2024-06-01',
  },

  // Home & Living - Cushion Covers
  {
    id: 'prod-11',
    name: 'Cushion Cover Set - Block Print',
    nameBn: 'তাকিয়া সেট - ব্লক প্রিন্ট',
    category: 'home-cushions',
    price: 650,
    images: [
      'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg',
    ],
    stock: 30,
    sku: 'H-DC001',
    description: 'Hand block printed cushion covers. Set of 4. Traditional designs.',
    tags: ['cushion', 'decor', 'handmade'],
    isActive: true,
    isFeatured: false,
    badges: [],
    createdAt: '2024-02-15',
    updatedAt: '2024-06-01',
  },

  // Home & Living - Curtains
  {
    id: 'prod-12',
    name: 'Elegant Curtains - Living Room',
    nameBn: 'এলিগ্যান্ট পর্দা - লিভিং রুম',
    category: 'home-curtains',
    price: 3500,
    images: [
      'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg',
    ],
    stock: 10,
    sku: 'H-CT001',
    description: 'Premium curtains for your living room. Elegant design with blackout lining.',
    tags: ['curtain', 'living-room', 'premium'],
    isActive: true,
    isFeatured: true,
    badges: ['new'],
    createdAt: '2024-05-20',
    updatedAt: '2024-06-01',
  },

  // Food & Pitha
  {
    id: 'prod-13',
    name: 'Traditional Pitha Box - Winter Collection',
    nameBn: 'ট্রেডিশনাল পিঠা বক্স - উইন্টার কালেকশন',
    category: 'food-pitha',
    price: 850,
    images: [
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    ],
    stock: 50,
    sku: 'F-PT001',
    description: 'Assorted traditional pitha including chitoi, patishapta, and bhapa. Made fresh to order.',
    foodNote: 'Pre-order recommended. Pitha is made fresh and may have 2-3 day preparation time.',
    deliveryNote: 'Frozen items require temperature-controlled delivery. Additional fee may apply.',
    tags: ['pitha', 'traditional', 'winter-special'],
    isActive: true,
    isFeatured: true,
    badges: ['pre-order'],
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'prod-14',
    name: 'Homecooked Beef Bhuna - 500g',
    nameBn: 'হোমকুকড বিফ ভুনা - ৫০০ গ্রাম',
    category: 'food-pitha',
    price: 650,
    images: [
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    ],
    stock: 30,
    sku: 'F-HM001',
    description: 'Authentic homemade beef bhuna with traditional spices. No preservatives.',
    foodNote: 'Freshly prepared. Best consumed within 3 days or freeze on arrival.',
    deliveryNote: 'Same-day delivery available in Dhaka.',
    tags: ['cooked-food', 'beef', 'homemade'],
    isActive: true,
    isFeatured: true,
    badges: ['best-seller'],
    createdAt: '2024-03-15',
    updatedAt: '2024-06-01',
  },

  // Jewelry - Earrings
  {
    id: 'prod-15',
    name: 'Gold Plated Earrings - Jhumka Style',
    nameBn: 'গোল্ড প্লেটেড কানের দুল - ঝুমকা স্টাইল',
    category: 'jewelry-earrings',
    price: 550,
    images: [
      'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg',
    ],
    stock: 25,
    sku: 'J-ER001',
    description: 'Elegant gold plated jhumka earrings. Traditional design with modern finish.',
    tags: ['earrings', 'jhumka', 'gold-plated'],
    isActive: true,
    isFeatured: true,
    badges: ['best-seller'],
    createdAt: '2024-04-01',
    updatedAt: '2024-06-01',
  },

  // Jewelry - Necklaces
  {
    id: 'prod-16',
    name: 'Layered Necklace - Modern Elegance',
    nameBn: 'লেয়ার্ড নেকলেস - মডার্ন এলিগ্যান্স',
    category: 'jewelry-necklaces',
    price: 850,
    images: [
      'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg',
    ],
    stock: 18,
    sku: 'J-NK001',
    description: 'Trendy layered necklace set. Perfect for modern styling.',
    tags: ['necklace', 'layered', 'modern'],
    isActive: true,
    isFeatured: true,
    badges: ['new'],
    createdAt: '2024-05-15',
    updatedAt: '2024-06-01',
  },

  // Jewelry - Bridal/Festive
  {
    id: 'prod-17',
    name: 'Bridal Jewelry Set - Complete',
    nameBn: 'ব্রাইডাল জুয়েলারি সেট - সম্পূর্ণ',
    category: 'jewelry-bridal',
    price: 3500,
    images: [
      'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg',
    ],
    stock: 8,
    sku: 'J-BN001',
    description: 'Complete bridal jewelry set with necklace, earrings, and bangles. Perfect for weddings.',
    tags: ['bridal', 'wedding', 'complete-set'],
    isActive: true,
    isFeatured: true,
    badges: ['eid-collection'],
    createdAt: '2024-04-10',
    updatedAt: '2024-06-01',
  },

  // Gifts
  {
    id: 'prod-18',
    name: 'Eid Gift Hamper - Premium',
    nameBn: 'ঈদ গিফট হ্যাম্পার - প্রিমিয়াম',
    category: 'gifts',
    price: 2500,
    images: [
      'https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg',
    ],
    stock: 20,
    sku: 'G-HM001',
    description: 'Curated gift hamper with pitha, snacks, sweets, and a small handicraft item. Beautifully wrapped.',
    tags: ['gift', 'eid', 'premium'],
    isActive: true,
    isFeatured: true,
    badges: ['eid-collection'],
    createdAt: '2024-04-15',
    updatedAt: '2024-06-01',
  },
  {
    id: 'prod-19',
    name: 'Housewarming Gift Set',
    nameBn: 'হোমওয়ার্মিং গিফট সেট',
    category: 'gifts',
    price: 1800,
    images: [
      'https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg',
    ],
    stock: 15,
    sku: 'G-HM002',
    description: 'Elegant gift set with artisan snacks, decorative plate, and scented candles.',
    tags: ['gift', 'housewarming', 'home-decor'],
    isActive: true,
    isFeatured: false,
    badges: [],
    createdAt: '2024-03-20',
    updatedAt: '2024-06-01',
  },
  {
    id: 'prod-20',
    name: 'Birthday Celebration Box',
    nameBn: 'বার্থডে সেলিব্রেশন বক্স',
    category: 'gifts',
    price: 1500,
    images: [
      'https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg',
    ],
    stock: 25,
    sku: 'G-HM003',
    description: 'Birthday gift box with cookies, chocolates, and a personalized card option.',
    tags: ['gift', 'birthday', 'celebration'],
    isActive: true,
    isFeatured: true,
    badges: ['new'],
    createdAt: '2024-05-10',
    updatedAt: '2024-06-01',
  },

  // New Arrivals
  {
    id: 'prod-21',
    name: 'Handmade Clay Jewelry Set',
    nameBn: 'হ্যান্ডমেড ক্লে জুয়েলারি সেট',
    category: 'new-arrivals',
    price: 850,
    images: [
      'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg',
    ],
    stock: 18,
    sku: 'N-JW001',
    description: 'Artisan-crafted clay jewelry set with necklace and matching earrings. Every piece is unique.',
    tags: ['jewelry', 'clay', 'handmade', 'artisan'],
    isActive: true,
    isFeatured: true,
    badges: ['new'],
    createdAt: '2024-06-05',
    updatedAt: '2024-06-05',
  },
  {
    id: 'prod-22',
    name: 'Frozen Pitha Pack - Instant Pack',
    nameBn: 'ফ্রোজেন পিঠা প্যাক - ইনস্ট্যান্ট প্যাক',
    category: 'new-arrivals',
    price: 600,
    images: [
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    ],
    stock: 40,
    sku: 'N-PT001',
    description: 'Ready-to-steam frozen pitha pack. Quick preparation, authentic taste. 10 pieces.',
    foodNote: 'Keep frozen. Steam for 8-10 minutes before serving.',
    tags: ['pitha', 'frozen', 'instant'],
    isActive: true,
    isFeatured: false,
    badges: ['new', 'pre-order'],
    createdAt: '2024-06-08',
    updatedAt: '2024-06-08',
  },
];

export function getProductsByCategory(categorySlug: string): Product[] {
  // Include subcategory matching for parent categories
  const allSlugs = getAllCategorySlugs(categorySlug);
  return products.filter(p => allSlugs.includes(p.category) && p.isActive);
}

function getAllCategorySlugs(slug: string): string[] {
  // Map parent categories to their subcategories
  const categoryMap: Record<string, string[]> = {
    'wearables': [
      'women-three-piece', 'women-dresses', 'women-sarees', 'women-kurtis', 'women-shawls',
      'men-panjabi', 'men-shirts', 'men-tshirts', 'men-waistcoats',
      'kids-girls', 'kids-boys', 'kids-baby',
      'accessories-bags', 'accessories-scarves', 'accessories-watches',
    ],
    'home-living': ['home-sheets', 'home-cushions', 'home-curtains', 'home-runners', 'home-towels', 'home-decor'],
    'jewelry': ['jewelry-earrings', 'jewelry-necklaces', 'jewelry-bangles', 'jewelry-rings', 'jewelry-bridal'],
  };

  if (categoryMap[slug]) {
    return [slug, ...categoryMap[slug]];
  }
  return [slug];
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.isFeatured && p.isActive);
}

export function getNewArrivals(): Product[] {
  return products.filter(p => p.badges.includes('new') && p.isActive);
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    p =>
      p.isActive &&
      (p.name.toLowerCase().includes(lowerQuery) ||
        p.nameBn.includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
  );
}

export function getLowStockProducts(threshold: number = 10): Product[] {
  return products.filter(p => p.stock <= threshold && p.isActive);
}
