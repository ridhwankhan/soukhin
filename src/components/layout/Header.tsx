import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ShoppingBag, Heart, Search, ChevronDown, User, LogOut, UserCircle } from 'lucide-react';
import { NAV_LINKS, NAV_DROPDOWNS, BRAND_CONFIG, SITE_SETTINGS } from '../../config';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useAnnouncements } from '../../context/AnnouncementContext';

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { customer, logoutCustomer } = useAuth();
  const { activeAnnouncement } = useAnnouncements();
  const navRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActiveDropdown(null);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDropdown = (slug: string) => {
    const key = slug.replace('/category/', '');
    return NAV_DROPDOWNS[key as keyof typeof NAV_DROPDOWNS];
  };

  const toggleMobile = (label: string) =>
    setExpandedMobile(prev => prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]);

  const cartCount = getItemCount();
  const wishCount = wishlistItems.length;
  const announcementText = activeAnnouncement?.text ?? SITE_SETTINGS.announcementBar;
  const announcementBg = {
    green: 'bg-[#1B4332]',
    gold: 'bg-[#9A7535]',
    terracotta: 'bg-[#B5603E]',
    dark: 'bg-[#1A1A1A]',
  }[activeAnnouncement?.bgColor ?? 'green'];

  const handleLogout = () => {
    logoutCustomer();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white shadow-[0_1px_0_0_#E2D9CF]' : 'bg-white'}`}>
      {/* Announcement */}
      <div className={`${announcementBg} text-white/90 text-center py-2 text-xs tracking-wide`}>
        {activeAnnouncement?.link
          ? <a href={activeAnnouncement.link} className="hover:underline">{announcementText}</a>
          : announcementText
        }
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
                <div key={link.href} className="relative"
                  onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.href)}
                  onMouseLeave={() => setActiveDropdown(null)}>
                  <Link to={link.href} className={`flex items-center gap-0.5 px-3.5 py-2 text-sm font-medium transition-colors duration-150 rounded-sm ${isActive ? 'text-[#1B4332]' : 'text-[#4A4A4A] hover:text-[#1B4332]'}`}>
                    {link.label}
                    {link.hasDropdown && <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${activeDropdown === link.href ? 'rotate-180' : ''}`} />}
                  </Link>
                  <AnimatePresence>
                    {link.hasDropdown && activeDropdown === link.href && dropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
                      >
                        <div className="bg-white border border-[#E2D9CF] shadow-lg p-5 flex gap-8 min-w-max">
                          {Object.entries(dropdown).map(([section, items]) => (
                            <div key={section}>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9A7535] mb-3 pb-2 border-b border-[#E2D9CF]">{section}</p>
                              <ul className="space-y-1.5">
                                {items.map(item => (
                                  <li key={item.href}>
                                    <Link to={item.href} className="flex items-baseline gap-1.5 text-sm text-[#4A4A4A] hover:text-[#1B4332] transition-colors duration-100 py-0.5">
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
            <button onClick={onSearchToggle} aria-label="Search"
              className={`p-2 rounded-sm transition-colors ${searchOpen ? 'bg-[#F5F0E8] text-[#1B4332]' : 'text-[#4A4A4A] hover:bg-[#F5F0E8] hover:text-[#1B4332]'}`}>
              <Search className="w-[18px] h-[18px]" />
            </button>

            <Link to="/wishlist" aria-label={`Wishlist${wishCount ? `, ${wishCount} items` : ''}`}
              className="relative p-2 rounded-sm text-[#4A4A4A] hover:bg-[#F5F0E8] hover:text-[#1B4332] transition-colors">
              <Heart className="w-[18px] h-[18px]" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#B5603E] text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                  {wishCount > 9 ? '9+' : wishCount}
                </span>
              )}
            </Link>

            <button onClick={onCartClick} aria-label={`Cart${cartCount ? `, ${cartCount} items` : ''}`}
              className="relative p-2 rounded-sm text-[#4A4A4A] hover:bg-[#F5F0E8] hover:text-[#1B4332] transition-colors">
              <ShoppingBag className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1B4332] text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* User auth icon */}
            <div className="relative hidden sm:block" ref={userMenuRef}>
              {customer ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    aria-label="Account"
                    className="flex items-center gap-1.5 p-1.5 rounded-sm text-[#4A4A4A] hover:bg-[#F5F0E8] hover:text-[#1B4332] transition-colors"
                  >
                    <div className="w-7 h-7 bg-[#1B4332] rounded-full flex items-center justify-center">
                      <span className="text-white text-[11px] font-semibold leading-none">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white border border-[#E2D9CF] shadow-lg z-50"
                      >
                        <div className="px-4 py-3 border-b border-[#F0EBE3]">
                          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{customer.name}</p>
                          <p className="text-xs text-[#9A9A9A] truncate">{customer.email}</p>
                        </div>
                        <div className="py-1">
                          <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#4A4A4A] hover:bg-[#F9F7F4] hover:text-[#1B4332] transition-colors">
                            <UserCircle className="w-3.5 h-3.5" /> My Profile
                          </Link>
                          <Link to="/wishlist" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#4A4A4A] hover:bg-[#F9F7F4] hover:text-[#1B4332] transition-colors">
                            <Heart className="w-3.5 h-3.5" /> Wishlist
                          </Link>
                        </div>
                        <div className="py-1 border-t border-[#F0EBE3]">
                          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#B5603E] hover:bg-[#FEF4EF] transition-colors">
                            <LogOut className="w-3.5 h-3.5" /> Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link to="/login" aria-label="Sign in"
                  className="p-2 rounded-sm text-[#4A4A4A] hover:bg-[#F5F0E8] hover:text-[#1B4332] transition-colors">
                  <User className="w-[18px] h-[18px]" />
                </Link>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(v => !v)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="lg:hidden p-2 rounded-sm text-[#4A4A4A] hover:bg-[#F5F0E8] transition-colors ml-1">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
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
                        <button onClick={() => toggleMobile(link.label)}
                          className={`w-full flex items-center justify-between px-2 py-3.5 text-sm font-medium transition-colors ${isActive ? 'text-[#1B4332]' : 'text-[#4A4A4A]'}`}>
                          <span>{link.label}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="pb-3 pl-4">
                                {Object.entries(dropdown).map(([section, items]) => (
                                  <div key={section} className="mb-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9A7535] mb-1.5">{section}</p>
                                    {items.map(item => (
                                      <Link key={item.href} to={item.href} className="block py-1.5 text-sm text-[#4A4A4A] hover:text-[#1B4332]">{item.label}</Link>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link to={link.href} className={`flex items-center justify-between px-2 py-3.5 text-sm font-medium transition-colors ${isActive ? 'text-[#1B4332]' : 'text-[#4A4A4A]'}`}>
                        {link.label}
                      </Link>
                    )}
                  </div>
                );
              })}

              {/* Mobile user section */}
              <div className="pt-3 border-t border-[#E2D9CF] mt-1 space-y-1">
                {customer ? (
                  <>
                    <div className="px-2 py-2">
                      <p className="text-xs font-semibold text-[#1A1A1A]">{customer.name}</p>
                      <p className="text-xs text-[#9A9A9A]">{customer.email}</p>
                    </div>
                    <Link to="/profile" className="block px-2 py-3 text-sm text-[#4A4A4A] hover:text-[#1B4332]">My Profile</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-2 py-3 text-sm text-[#B5603E]">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-2 py-3 text-sm font-medium text-[#1B4332]">Sign in</Link>
                    <Link to="/signup" className="block px-2 py-3 text-sm text-[#4A4A4A] hover:text-[#1B4332]">Create account</Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
