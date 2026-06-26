import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import CartResumeHandler from './components/cart/CartResumeHandler';

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
import AuthPage from './pages/customer/AuthPage';
import AccountPage from './pages/customer/AccountPage';
import TrackOrderPage from './pages/customer/TrackOrderPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import BkashCallbackPage from './pages/customer/BkashCallbackPage';
import AboutPage from './pages/info/AboutPage';
import ContactPage from './pages/info/ContactPage';
import FAQPage from './pages/info/FAQPage';
import { ReturnExchangePage, PrivacyPage, TermsPage } from './pages/info/PolicyPages';

// Admin
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/Dashboard';
import OrdersPage from './admin/pages/OrdersPage';
import ProductsPage from './admin/pages/ProductsPage';
import UsersPage from './admin/pages/UsersPage';
import {
  InventoryPage,
  CategoriesPage,
  CustomersPage,
  ReviewsPage,
  CouponsPage,
  MessagesPage,
  AuditLogPage,
} from './admin/pages/OtherPages';
import {
  PaymentSettingsPage,
  DeliverySettingsPage,
  StoreSettingsPage,
} from './admin/pages/SettingsPages';

function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onCartClick={() => setCartOpen(true)}
        searchOpen={searchOpen}
        onSearchToggle={() => setSearchOpen(!searchOpen)}
      />
      <main className={`flex-1 ${isHome ? 'pt-[72px] md:pt-[88px]' : 'pt-[88px] md:pt-[108px]'}`}>
        <CartResumeHandler onOpenCart={() => setCartOpen(true)} />
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
          <AuthProvider>
          <AdminAuthProvider>
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
                <ProtectedRoute requireProfile={false}>
                  <CheckoutPage />
                </ProtectedRoute>
              </CustomerLayout>
            } />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/account" element={
              <CustomerLayout>
                <ProtectedRoute requireProfile={false}>
                  <AccountPage />
                </ProtectedRoute>
              </CustomerLayout>
            } />
            <Route path="/account/orders" element={
              <CustomerLayout>
                <ProtectedRoute requireProfile={false}>
                  <OrderHistoryPage />
                </ProtectedRoute>
              </CustomerLayout>
            } />
            <Route path="/track-order" element={
              <CustomerLayout>
                <TrackOrderPage />
              </CustomerLayout>
            } />
            <Route path="/payment/bkash/callback" element={<BkashCallbackPage />} />
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
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
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
          </AdminAuthProvider>
          </AuthProvider>
        </Router>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
