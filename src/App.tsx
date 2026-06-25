import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { AnnouncementProvider } from './context/AnnouncementContext';
import { ProductProvider } from './context/ProductContext';

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

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

// Customer Account Pages
import ProfilePage from './pages/customer/ProfilePage';

// Admin
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/Dashboard';
import OrdersPage from './admin/pages/OrdersPage';
import ProductsPage from './admin/pages/ProductsPage';
import AnnouncementsPage from './admin/pages/AnnouncementsPage';
import ProductLabelsPage from './admin/pages/ProductLabelsPage';
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
      {/* 32px announcement + 60px/68px nav */}
      <main className="flex-1 pt-[92px] md:pt-[100px]">
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
    <AuthProvider>
      <AnnouncementProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
                <Routes>
                  {/* Customer Routes */}
                  <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
                  <Route path="/category/:slug" element={<CustomerLayout><CategoryPage /></CustomerLayout>} />
                  <Route path="/wishlist" element={<CustomerLayout><WishlistPage /></CustomerLayout>} />
                  <Route path="/checkout" element={<CustomerLayout><CheckoutPage /></CustomerLayout>} />
                  <Route path="/about" element={<CustomerLayout><AboutPage /></CustomerLayout>} />
                  <Route path="/contact" element={<CustomerLayout><ContactPage /></CustomerLayout>} />
                  <Route path="/faq" element={<CustomerLayout><FAQPage /></CustomerLayout>} />
                  <Route path="/return-exchange" element={<CustomerLayout><ReturnExchangePage /></CustomerLayout>} />
                  <Route path="/privacy" element={<CustomerLayout><PrivacyPage /></CustomerLayout>} />
                  <Route path="/terms" element={<CustomerLayout><TermsPage /></CustomerLayout>} />

                  {/* Auth Routes — full-page, no layout */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  {/* Customer Account */}
                  <Route path="/profile" element={<CustomerLayout><ProfilePage /></CustomerLayout>} />

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
                    <Route path="announcements" element={<AnnouncementsPage />} />
                    <Route path="product-labels" element={<ProductLabelsPage />} />
                    <Route path="banners" element={<div className="p-8 text-center text-[#7A7A7A]">Banners — Coming Soon</div>} />
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
        </ProductProvider>
      </AnnouncementProvider>
    </AuthProvider>
  );
}

export default App;
