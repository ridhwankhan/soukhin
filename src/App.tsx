import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Customer Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import SearchBar from './components/layout/SearchBar';
import WhatsAppButton from './components/layout/WhatsAppButton';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import CategoryPage from './pages/customer/CategoryPage';
import WishlistPage from './pages/customer/WishlistPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import AboutPage from './pages/info/AboutPage';
import ContactPage from './pages/info/ContactPage';
import FAQPage from './pages/info/FAQPage';
import { ReturnExchangePage, PrivacyPage, TermsPage } from './pages/info/PolicyPages';

// Admin
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/Dashboard';
import OrdersPage from './admin/pages/OrdersPage';
import ProductsPage from './admin/pages/ProductsPage';
import {
  InventoryPage,
  CategoriesPage,
  CustomersPage,
  ReviewsPage,
  CouponsPage,
  MessagesPage,
  AuditLogPage,
  UsersPage,
} from './admin/pages/OtherPages';
import {
  PaymentSettingsPage,
  DeliverySettingsPage,
  StoreSettingsPage,
} from './admin/pages/SettingsPages';

function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onCartClick={() => setCartOpen(true)}
        searchOpen={searchOpen}
        onSearchToggle={() => setSearchOpen(!searchOpen)}
      />
      <main className="flex-1 pt-[88px] md:pt-[108px]">
        {children}
      </main>
      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <WhatsAppButton />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <Router>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={
              <CustomerLayout>
                <HomePage />
              </CustomerLayout>
            } />
            <Route path="/category/:slug" element={
              <CustomerLayout>
                <CategoryPage />
              </CustomerLayout>
            } />
            <Route path="/wishlist" element={
              <CustomerLayout>
                <WishlistPage />
              </CustomerLayout>
            } />
            <Route path="/checkout" element={
              <CustomerLayout>
                <CheckoutPage />
              </CustomerLayout>
            } />
            <Route path="/about" element={
              <CustomerLayout>
                <AboutPage />
              </CustomerLayout>
            } />
            <Route path="/contact" element={
              <CustomerLayout>
                <ContactPage />
              </CustomerLayout>
            } />
            <Route path="/faq" element={
              <CustomerLayout>
                <FAQPage />
              </CustomerLayout>
            } />
            <Route path="/return-exchange" element={
              <CustomerLayout>
                <ReturnExchangePage />
              </CustomerLayout>
            } />
            <Route path="/privacy" element={
              <CustomerLayout>
                <PrivacyPage />
              </CustomerLayout>
            } />
            <Route path="/terms" element={
              <CustomerLayout>
                <TermsPage />
              </CustomerLayout>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="banners" element={<div className="p-8 text-center">Banners Management - Coming Soon</div>} />
              <Route path="hero" element={<div className="p-8 text-center">Hero Section Editor - Coming Soon</div>} />
              <Route path="announcements" element={<div className="p-8 text-center">Announcements Editor - Coming Soon</div>} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="settings/payment" element={<PaymentSettingsPage />} />
              <Route path="settings/delivery" element={<DeliverySettingsPage />} />
              <Route path="settings/store" element={<StoreSettingsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="audit-log" element={<AuditLogPage />} />
            </Route>
          </Routes>
        </Router>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
