import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Heart, Search, User, ChevronDown, LogIn, Home, Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { NAV_LINKS, NAV_DROPDOWNS, BRAND_CONFIG } from '../../config';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { canStaffUseStorefront, hasStaffDashboardAccess } from '../../lib/staffAuth';

interface HeaderProps {
  onCartClick: () => void;
  searchOpen: boolean;
  onSearchToggle: () => void;
}

export default function Header({ onCartClick, searchOpen, onSearchToggle }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<string[]>([]);
  const location = useLocation();
  const { getItemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, profile, isEmailVerified } = useAuth();
  const { admin, loading: adminLoading } = useAdminAuth();
  const canShopAsStaff = admin ? canStaffUseStorefront(admin.role) : false;
  const showStaffDashboard = hasStaffDashboardAccess(admin);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileSubmenu = (label: string) => {
    setExpandedMobileMenus(prev =>
      prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
    );
  };

  const getDropdownContent = (slug: string) => {
    const key = slug.replace('/category/', '');
    return NAV_DROPDOWNS[key as keyof typeof NAV_DROPDOWNS];
  };

  const headerSurface = scrolled
    ? 'bg-elevated/95 supports-[backdrop-filter]:bg-elevated/80 supports-[backdrop-filter]:backdrop-blur-md shadow-md border-b border-line'
    : isHome
    ? 'bg-canvas/90 supports-[backdrop-filter]:bg-canvas/75 supports-[backdrop-filter]:backdrop-blur-md border-b border-line shadow-sm'
    : 'bg-elevated/95 supports-[backdrop-filter]:bg-elevated/85 supports-[backdrop-filter]:backdrop-blur-md shadow-sm';

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 text-ink ${headerSurface}`}>
      {/* Announcement bar */}
      <div className="bg-announcement text-announcement-fg text-center py-2 text-sm">
        {user && isEmailVerified && showStaffDashboard && !location.pathname.startsWith('/admin') && (
          <>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2 hover:text-white/90 transition-colors mr-3"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Dashboard
            </Link>
            <span className="opacity-60 mr-3" aria-hidden>|</span>
          </>
        )}
        <span>Free delivery on orders over ৳2000 | Use code: SOUKHIN10</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-sm flex items-center justify-center">
              <span className="text-accent-fg font-serif text-xl font-bold">শ</span>
            </div>
            <div className="hidden sm:block">
              <span className={`font-serif text-xl font-semibold transition-colors ${
                scrolled ? 'text-accent' : 'text-accent'
              }`}>{BRAND_CONFIG.name}</span>
              <p className={`text-xs transition-colors ${
                scrolled ? 'text-ink-secondary' : 'text-ink-secondary'
              }`}>{BRAND_CONFIG.nameBn}</p>
            </div>
          </Link>

          {/* Desktop Nav with Dropdowns */}
          <div className="hidden lg:flex items-center gap-6" ref={dropdownRef}>
            {NAV_LINKS.map(link => {
              const dropdownContent = link.hasDropdown ? getDropdownContent(link.href) : null;

              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.href)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={link.href}
                    className={`flex items-center gap-1 text-sm font-semibold transition-colors hover:text-accent-soft ${
                      location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href))
                        ? 'text-accent'
                        : 'text-ink'
                    }`}
                  >
                    {link.label}
                    {link.hasDropdown && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        activeDropdown === link.href ? 'rotate-180' : ''
                      }`} />
                    )}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  <AnimatePresence>
                    {link.hasDropdown && activeDropdown === link.href && dropdownContent && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-max"
                      >
                        <div className="bg-elevated rounded-lg shadow-xl border border-line p-6 flex gap-8">
                          {Object.entries(dropdownContent).map(([section, items]) => (
                            <div key={section}>
                              <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 border-b border-accent/20 pb-2">
                                {section}
                              </h3>
                              <div className="space-y-2">
                                {items.map((item) => (
                                  <Link
                                    key={item.href}
                                    to={item.href}
                                    className="block text-sm text-ink hover:text-accent py-1 transition-colors"
                                  >
                                    <span>{item.label}</span>
                                    <span className="text-xs text-ink-muted ml-1">{item.labelBn}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {!isHome && (
              <Link
                to="/"
                className="p-2 hover:bg-surface rounded-full transition-colors"
                title="Back to Home"
                aria-label="Back to Home"
              >
                <Home className="w-5 h-5 text-ink/90" />
              </Link>
            )}

            <ThemeToggle />

            <button
              onClick={onSearchToggle}
              className="p-2 hover:bg-surface rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-ink" />
            </button>

            <Link
              to="/wishlist"
              className="p-2 hover:bg-surface rounded-full transition-colors relative"
            >
              <Heart className="w-5 h-5 text-ink" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-soft text-white text-xs rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <button
              onClick={onCartClick}
              className="p-2 hover:bg-surface rounded-full transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5 text-ink" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>

            {user && isEmailVerified && showStaffDashboard ? (
              <Link
                to="/admin"
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full border border-accent/25 bg-accent/5 hover:bg-surface transition-colors text-sm font-semibold text-accent"
                title="Staff dashboard"
              >
                <Shield className="w-4 h-4" />
                Dashboard
              </Link>
            ) : null}

            {user && isEmailVerified && (!admin || canShopAsStaff) ? (
              <Link
                to="/account"
                className="hidden md:flex items-center gap-2 p-2 hover:bg-surface rounded-full transition-colors"
                title={profile?.name || admin?.name || 'My Account'}
              >
                <User className="w-5 h-5 text-ink" />
              </Link>
            ) : user && isEmailVerified && admin ? null : (
              <Link
                to="/auth"
                className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-surface rounded-full transition-colors text-sm font-semibold text-ink"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-surface rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-elevated border-t border-line max-h-[80vh] overflow-y-auto"
          >
            <div className="px-4 py-4">
              {NAV_LINKS.map(link => {
                const dropdownContent = link.hasDropdown ? getDropdownContent(link.href) : null;
                const isExpanded = expandedMobileMenus.includes(link.label);

                return (
                  <div key={link.href}>
                    {link.hasDropdown && dropdownContent ? (
                      <>
                        <button
                          onClick={() => toggleMobileSubmenu(link.label)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-sm text-sm font-medium transition-colors ${
                            location.pathname.startsWith(link.href)
                              ? 'bg-accent text-white'
                              : 'hover:bg-surface'
                          }`}
                        >
                          <span>
                            <span>{link.label}</span>
                            <span className="ml-2 text-xs opacity-70">{link.labelBn}</span>
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-canvas ml-4 rounded-md my-1"
                            >
                              {Object.entries(dropdownContent).map(([section, items]) => (
                                <div key={section} className="py-2">
                                  <p className="px-4 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                                    {section}
                                  </p>
                                  {items.map((item) => (
                                    <Link
                                      key={item.href}
                                      to={item.href}
                                      className="block px-4 py-2 text-sm text-ink hover:text-accent hover:bg-elevated transition-colors"
                                    >
                                      {item.label}
                                      <span className="text-xs text-ink-muted ml-1">{item.labelBn}</span>
                                    </Link>
                                  ))}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={link.href}
                        className={`block px-4 py-3 rounded-sm text-sm font-medium transition-colors ${
                          location.pathname === link.href
                            ? 'bg-accent text-white'
                            : 'hover:bg-surface'
                        }`}
                      >
                        <span>{link.label}</span>
                        <span className="ml-2 text-xs opacity-70">{link.labelBn}</span>
                      </Link>
                    )}
                  </div>
                );
              })}
              {user && isEmailVerified && showStaffDashboard ? (
                <Link
                  to="/admin"
                  className="block px-4 py-3 rounded-sm text-sm font-semibold bg-accent/5 border border-accent/20 hover:bg-surface mt-2 flex items-center gap-2 text-accent"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              ) : null}
              {user && isEmailVerified && adminLoading && !admin ? (
                <p className="px-4 py-3 text-xs text-ink-muted mt-2 border-t border-line pt-4">
                  Checking staff access…
                </p>
              ) : null}
              {user && isEmailVerified && (!admin || canShopAsStaff) ? (
                <Link
                  to="/account"
                  className="block px-4 py-3 rounded-sm text-sm font-semibold hover:bg-surface mt-2 border-t border-line pt-4 text-ink"
                >
                  My Account
                </Link>
              ) : !user || !isEmailVerified ? (
                <Link
                  to="/auth"
                  className="block px-4 py-3 rounded-sm text-sm font-semibold hover:bg-surface mt-2 border-t border-line pt-4 text-ink"
                >
                  Sign In / Register
                </Link>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
