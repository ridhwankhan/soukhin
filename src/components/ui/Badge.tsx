import { ProductBadge } from '../../types';

interface BadgeProps {
  badge: ProductBadge;
  size?: 'sm' | 'md';
}

const badgeConfig: Record<ProductBadge, { bg: string; text: string; label: string }> = {
  'new': { bg: 'bg-accent', text: 'text-white', label: 'NEW' },
  'hot': { bg: 'bg-red-600', text: 'text-white', label: 'HOT' },
  'eid-collection': { bg: 'bg-accent', text: 'text-white', label: 'Eid' },
  'best-seller': { bg: 'bg-accent-soft', text: 'text-white', label: 'Best Seller' },
  'pre-order': { bg: 'bg-ink', text: 'text-white', label: 'Pre-order' },
  'featured': { bg: 'bg-[#1A5276]', text: 'text-white', label: 'Featured' },
  'sale': { bg: 'bg-red-600', text: 'text-white', label: 'Sale' },
  'limited-edition': { bg: 'bg-[#4A4A4A]', text: 'text-white', label: 'Limited' },
};

export default function Badge({ badge, size = 'md' }: BadgeProps) {
  const config = badgeConfig[badge];
  if (!config) return null;

  return (
    <span
      className={`${config.bg} ${config.text} font-semibold tracking-wide inline-block leading-none ${
        size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'
      }`}
    >
      {config.label}
    </span>
  );
}
