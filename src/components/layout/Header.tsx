import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ShoppingBag, Heart, Search, ChevronDown } from 'lucide-react';
import { NAV_LINKS, NAV_DROPDOWNS, BRAND_CONFIG, SITE_SETTINGS } from '../../config';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface HeaderProps {
  onCartClick: () => void;
  searchOpen: boolean;
  onSearchToggle: () => void;
}

export default function Header({ onCartClick, searchOpen, onSearchToggle }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<string[]>([]);
  const location = useLocation();
  const { getItemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDropdown = (slug: string) => {
    const key = slug.replace('/category/', '');
    return NAV_DROPDOWNS[key as keyof typeof NAV_DROPDOWNS];
  };

  const toggleMobile = (label: string) => {
    setExpandedMobile(prev =>
      prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
    );
  };

  const cartCount = getItemCount();
  const wishCount = wishlistItems.length;

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white shadow-[0_1px_0_0_#E2D9CF]' : 'bg-white'}`}>
      {/* Announcement */}
      <div className="bg-[#1B4332] text-white/90 text-center py-2 text-xs tracking-wide">
        {SITE_SETTINGS.announcementBar}
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={navRef}>
        <div className="flex items-center justify-between h-[60px] md:h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="Soukhin home">
            <div className="w-9 h-9 bg-[#1B4332] flex items-center justify-center">
              <span className="text-white font-serif text-lg font-bold leading-none">শ</span>
            </div>
            <div className="leading-none">
              <span className="font-serif text-[1.15rem] font-semibold text-[#1A1A1A] tracking-tight">{BRAND_CONFIG.name}</span>
              <p className="text-[10px] text-[#7A7A7A] font-bengali mt-0.5">{BRAND_CONFIG.taglineBn}</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(link => {
              const dropdown = link.hasDropdown ? getDropdown(link.href) : null;
              const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href));

              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.href)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={link.href}
                    className={`flex items-center gap-0.5 px-3.5 py-2 text-sm font-medium transition-colors duration-150 rounded-sm ${
                      isActive ? 'text-[#1B4332]' : 'text-[#4A4A4A] hover:text-[#1B4332]'
                    }`}
                  >
                    {link.label}
                    {link.hasDropdown && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${activeDropdown === link.href ? 'rotate-180' : ''}`} />
                    )}
                  </Link>

                  <AnimatePresence>
                    {link.hasDropdown && activeDropdown === link.href && dropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
                      >
                        <div className="bg-white border border-[#E2D9CF] shadow-lg p-5 flex gap-8 min-w-max">
                          {Object.entries(dropdown).map(([section, items]) => (
                            <div key={section}>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9A7535] mb-3 pb-2 border-b border-[#E2D9CF]">
                                {section}
                              </p>
                              <ul className="space-y-1.5">
                                {items.map(item => (
                                  <li key={item.href}>
                                    <Link
                                      to={item.href}
                                      className="flex items-baseline gap-1.5 text-sm text-[#4A4A4A] hover:text-[#1B4332] transition-colors duration-100 py-0.5"
                                    >
                                      <span>{item.label}</span>
                                      <span className="text-[11px] text-[#9A9A9A] font-bengali">{item.labelBn}</span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
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
          <div className="flex items-center gap-1">
            <button
              onClick={onSearchToggle}
              aria-label="Search"
              className={`p-2 rounded-sm transition-colors ${searchOpen ? 'bg-[#F5F0E8] text-[#1B4332]' : 'text-[#4A4A4A] hover:bg-[#F5F0E8] hover:text-[#1B4332]'}`}
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <Link
              to="/wishlist"
              aria-label={`Wishlist${wishCount ? `, ${wishCount} items` : ''}`}
              className="relative p-2 rounded-sm text-[#4A4A4A] hover:bg-[#F5F0E8] hover:text-[#1B4332] transition-colors"
            >
              <Heart className="w-[18px] h-[18px]" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#B5603E] text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                  {wishCount > 9 ? '9+' : wishCount}
                </span>
              )}
            </Link>

            <button
              onClick={onCartClick}
              aria-label={`Cart${cartCount ? `, ${cartCount} items` : ''}`}
              className="relative p-2 rounded-sm text-[#4A4A4A] hover:bg-[#F5F0E8] hover:text-[#1B4332] transition-colors"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1B4332] text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="lg:hidden p-2 rounded-sm text-[#4A4A4A] hover:bg-[#F5F0E8] transition-colors ml-1"
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
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-[#E2D9CF] overflow-hidden"
          >
            <nav className="px-4 py-3 max-h-[75vh] overflow-y-auto">
              {NAV_LINKS.map(link => {
                const dropdown = link.hasDropdown ? getDropdown(link.href) : null;
                const isExpanded = expandedMobile.includes(link.label);
                const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href));

                return (
                  <div key={link.href} className="border-b border-[#F5F0E8] last:border-0">
                    {dropdown ? (
                      <>
                        <button
                          onClick={() => toggleMobile(link.label)}
                          className={`w-full flex items-center justify-between px-2 py-3.5 text-sm font-medium transition-colors ${isActive ? 'text-[#1B4332]' : 'text-[#4A4A4A]'}`}
                        >
                          <span>{link.label}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pb-3 pl-4">
                                {Object.entries(dropdown).map(([section, items]) => (
                                  <div key={section} className="mb-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9A7535] mb-1.5">{section}</p>
                                    {items.map(item => (
                                      <Link
                                        key={item.href}
                                        to={item.href}
                                        className="block py-1.5 text-sm text-[#4A4A4A] hover:text-[#1B4332]"
                                      >
                                        {item.label}
                                      </Link>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={link.href}
                        className={`flex items-center justify-between px-2 py-3.5 text-sm font-medium transition-colors ${isActive ? 'text-[#1B4332]' : 'text-[#4A4A4A]'}`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                );
              })}

              <div className="pt-3 pb-1 border-t border-[#E2D9CF] mt-1">
                <Link to="/admin" className="block px-2 py-3 text-sm text-[#7A7A7A] hover:text-[#1B4332] transition-colors">
                  Admin
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
