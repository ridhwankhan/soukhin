# Soukhin (শৌখিন) — Premium Bangladeshi Lifestyle Ecommerce

[![Repository](https://img.shields.io/badge/GitHub-ridhwankhan%2Fsoukhin-1B4332?style=flat-square&logo=github)](https://github.com/ridhwankhan/soukhin)

> **Status: Initial draft outline complete** — storefront, admin dashboard, and Supabase schema are scaffolded with mock data. Payment gateways, WhatsApp, and production backend wiring are next.

A premium Bangladeshi lifestyle ecommerce website and admin system built with React, TypeScript, Tailwind CSS, and Three.js.

## Features

### Customer Website
- Premium 3D hero section with Three.js
- Product browsing by categories
- Advanced filtering (price, size, color, badges)
- Sorting (newest, popular, price)
- Product badges (New, Eid Collection, Best Seller, Pre-order)
- Shopping cart with quantity controls
- Wishlist functionality
- Checkout with multiple payment options
- WhatsApp order generation for COD
- Responsive mobile-first design
- Floating WhatsApp button

### Admin Dashboard
- Role-based access control (Owner, Admin, Moderator, Order Manager, Inventory Manager)
- Dashboard overview with stats
- Order management with status updates
- Product management
- Inventory tracking
- Customer management
- Review moderation
- Coupon/discount management
- Content management (banners, hero, announcements)
- Message/inquiry management
- Payment settings
- Delivery settings
- User management
- Audit log

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Configuration

### WhatsApp Number

Edit `src/config/site.ts`:

```typescript
export const WHATSAPP_NUMBER = '8801712345678'; // Your number here
```

Format: Country code + number without spaces or symbols.
Example: For Bangladesh number 0171-2345678, use `8801712345678`

### Payment Gateways

Edit `src/config/payment.ts`:

```typescript
export const PAYMENT_CONFIG: PaymentConfig = {
  bkash: {
    merchantId: 'YOUR_BKASH_MERCHANT_ID',
    apiKey: 'YOUR_BKASH_API_KEY',
    enabled: true,
  },
  nagad: {
    merchantId: 'YOUR_NAGAD_MERCHANT_ID',
    apiKey: 'YOUR_NAGAD_API_KEY',
    enabled: true,
  },
  rocket: {
    merchantId: 'YOUR_ROCKET_MERCHANT_ID',
    apiKey: 'YOUR_ROCKET_API_KEY',
    enabled: true,
  },
  card: {
    gatewayPublicKey: 'YOUR_CARD_GATEWAY_KEY',
    enabled: true, // Enable when ready
  },
  // ... cod and bankTransfer
};
```

### Delivery Settings

Edit `src/config/delivery.ts`:

```typescript
export const DELIVERY_CONFIG: DeliveryConfig = {
  insideDhaka: {
    fee: 60,
    estimatedDays: '1-2',
  },
  outsideDhaka: {
    fee: 120,
    estimatedDays: '3-5',
  },
  pickup: {
    enabled: true,
    address: 'Your store address',
  },
};
```

### Brand Settings

Edit `src/config/brand.ts` to customize:
- Brand name and tagline
- Colors (primary, secondary, accent, etc.)
- Typography
- Social media links
- Currency settings

## Admin Roles & Permissions

| Role | Permissions |
|------|-------------|
| Owner | Full access to everything |
| Admin | Products, orders, customers, coupons, content, settings |
| Moderator | Reviews, messages, content management |
| Order Manager | View and update orders only |
| Inventory Manager | Stock and product availability |

### Adding Admin Users

Currently uses mock data in `src/data/admin.ts`. For production:
1. Connect to Supabase or your backend
2. Create admin_users table
3. Update `src/admin/AdminLayout.tsx` to fetch current user from auth

## Project Structure

```
src/
├── admin/                    # Admin dashboard
│   ├── AdminLayout.tsx      # Admin layout with sidebar
│   └── pages/               # Admin pages
├── components/
│   ├── cart/                # Cart drawer component
│   ├── hero/                # 3D hero scene (Three.js)
│   ├── layout/              # Header, Footer, WhatsApp button
│   ├── product/             # Product card, detail
│   └── ui/                  # Reusable UI components
├── config/                   # Configuration files
│   ├── brand.ts            # Brand colors, fonts
│   ├── delivery.ts         # Delivery settings
│   ├── payment.ts          # Payment gateway config
│   ├── roles.ts            # Admin role permissions
│   └── site.ts             # Site settings, WhatsApp, social
├── context/                  # React contexts
│   ├── CartContext.tsx     # Shopping cart state
│   └── WishlistContext.tsx # Wishlist state
├── data/                     # Mock data
│   ├── admin.ts            # Admin users
│   ├── categories.ts       # Product categories
│   ├── content.ts          # Banners, coupons, messages
│   ├── customers.ts        # Customer data, reviews
│   ├── orders.ts           # Order data
│   └── products.ts         # Product catalog
├── pages/
│   ├── customer/           # Customer-facing pages
│   └── info/               # About, Contact, Policies
├── types/                   # TypeScript interfaces
│   └── index.ts
├── App.tsx                  # Main router
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## Customizing Products

Edit `src/data/products.ts` to add your products:

```typescript
{
  id: 'unique-id',
  name: 'Product Name',
  nameBn: 'পণ্যের নাম', // Bengali name
  category: 'ladies-wear', // Category slug
  price: 1500,
  salePrice: 1200, // Optional, for discounts
  images: ['url1', 'url2'],
  stock: 25,
  sku: 'LW-001',
  description: 'Product description',
  sizeOptions: ['S', 'M', 'L', 'XL'], // Optional
  colorOptions: ['Red', 'Blue'], // Optional
  foodNote: 'Pre-order recommended', // For food items
  deliveryNote: 'Same-day delivery', // Optional
  tags: ['tag1', 'tag2'],
  isActive: true,
  isFeatured: true,
  badges: ['new', 'best-seller'], // new, eid-collection, best-seller, pre-order
  createdAt: '2024-01-01',
  updatedAt: '2024-06-01',
}
```

## Replacing Images

All product images use Pexels URLs as placeholders. Replace with your own:

1. Upload images to your CDN or hosting
2. Update URLs in `src/data/products.ts`
3. Update category images in `src/data/categories.ts`
4. Update banner images in `src/data/content.ts`

## Connecting to a Backend

The app is structured for easy backend integration:

1. **Supabase**: Replace mock data imports with Supabase queries
2. **Firebase**: Use Firebase SDK for real-time data
3. **Custom API**: Create API service layer in `src/lib/api.ts`

### Example: Supabase Integration

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Then in components:
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('isActive', true);
```

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js + @react-three/fiber + @react-three/drei
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **Icons**: Lucide React
- **State**: React Context + localStorage

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Notes

- 3D hero uses reduced motion fallback for accessibility
- Mobile devices get optimized 3D rendering
- Images use lazy loading
- Cart/wishlist persist in localStorage

## License

MIT

---

Built with care for the Bangladeshi ecommerce community.
