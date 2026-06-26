import { Link } from 'react-router-dom';
import { Facebook, Instagram, Heart, Mail, MapPin } from 'lucide-react';
import { BRAND_CONFIG, CONTACT_EMAIL, DEVELOPER_EMAIL, DEVELOPER_NAME, FOOTER_LINKS, SITE_SETTINGS } from '../../config';

export default function Footer() {
  const year = new Date().getFullYear();
  const developerMailto = `mailto:${DEVELOPER_EMAIL}?subject=Soukhin%20website`;

  return (
    <footer className="bg-[#111A14] text-white">
      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#1B4332] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-serif text-lg font-bold leading-none">শ</span>
              </div>
              <div>
                <span className="font-serif text-lg font-semibold tracking-tight">{BRAND_CONFIG.name}</span>
                <p className="text-[10px] text-white/50 font-bengali mt-0.5">{BRAND_CONFIG.taglineBn}</p>
              </div>
            </Link>

            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              Premium Bangladeshi wearables, handmade food, traditional pitha, jewelry, and curated gift hampers — delivered to your door.
            </p>

            <div className="flex items-center gap-2">
              <a
                href={SITE_SETTINGS.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href={SITE_SETTINGS.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40 mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40 mb-4">Company</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.info.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40 mb-4">Policies</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.policies.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0 text-white/30 group-hover:text-white/70" />
                  <span className="underline-offset-2 group-hover:underline break-all">{CONTACT_EMAIL}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-white/30 mt-0.5" />
                Dhaka, Bangladesh
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/35 order-2 sm:order-1">
            © {year} {BRAND_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-3 order-1 sm:order-2 flex-wrap justify-center">
            <span className="text-xs text-white/30">Accepts:</span>
            {['bKash', 'Nagad', 'Rocket', 'Cash on Delivery'].map(method => (
              <span key={method} className="text-[11px] px-2 py-0.5 border border-white/10 text-white/40 rounded-[2px]">
                {method}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-white/40">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-[#C2704A] fill-[#C2704A]/30" aria-hidden />
            <span>by</span>
            <a
              href={developerMailto}
              className="inline-flex items-center gap-1.5 text-white/55 hover:text-white transition-colors font-medium"
            >
              {DEVELOPER_NAME}
              <Mail className="w-3.5 h-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
