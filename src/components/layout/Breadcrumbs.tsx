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
      className={`flex items-center gap-2 text-xs text-ink-muted/50 ${className}`}
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1 hover:text-accent transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
          <span aria-hidden>/</span>
          {item.href ? (
            <Link to={item.href} className="hover:text-accent transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-secondary/80">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
