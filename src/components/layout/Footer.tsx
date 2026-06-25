import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { BRAND_CONFIG, FOOTER_LINKS, SITE_SETTINGS } from '../../config';

export default function Footer() {
  return (
    <footer className="bg-[#1B4332] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#B8860B] rounded-sm flex items-center justify-center">
                <span className="text-white font-serif text-xl font-bold">শ</span>
              </div>
              <div>
                <span className="font-serif text-xl font-semibold">{BRAND_CONFIG.name}</span>
                <p className="text-xs opacity-70">{BRAND_CONFIG.nameBn}</p>
              </div>
            </div>
            <p className="text-sm text-white/70">{BRAND_CONFIG.description}</p>
            <div className="flex gap-4">
              <a
                href={SITE_SETTINGS.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={SITE_SETTINGS.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-medium text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.shop.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-medium text-lg mb-4">Information</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.info.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {FOOTER_LINKS.policies.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+880 XXX XXX XXXX</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>hello@soukhin.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50">Payment methods:</span>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white/10 rounded text-xs">bKash</span>
              <span className="px-2 py-1 bg-white/10 rounded text-xs">Nagad</span>
              <span className="px-2 py-1 bg-white/10 rounded text-xs">Rocket</span>
              <span className="px-2 py-1 bg-white/10 rounded text-xs">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
