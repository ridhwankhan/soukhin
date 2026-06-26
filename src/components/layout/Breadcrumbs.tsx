import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-xs text-[#9A9A9A] dark:text-white/50 ${className}`}
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1 hover:text-[#1B4332] dark:hover:text-white transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
          <span aria-hidden>/</span>
          {item.href ? (
            <Link to={item.href} className="hover:text-[#1B4332] dark:hover:text-white transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#4A4A4A] dark:text-white/80">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
