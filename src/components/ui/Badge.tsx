import { ProductBadge } from '../../types';

interface BadgeProps {
  badge: ProductBadge;
  size?: 'sm' | 'md';
}

const badgeStyles: Record<ProductBadge, { bg: string; text: string; label: string; labelBn: string }> = {
  'new': { bg: 'bg-[#1B4332]', text: 'text-white', label: 'New', labelBn: 'নতুন' },
  'eid-collection': { bg: 'bg-[#B8860B]', text: 'text-white', label: 'Eid Collection', labelBn: 'ঈদ সংগ্রহ' },
  'best-seller': { bg: 'bg-[#C2704A]', text: 'text-white', label: 'Best Seller', labelBn: 'সেরা বিক্রিত' },
  'pre-order': { bg: 'bg-[#666666]', text: 'text-white', label: 'Pre-order', labelBn: 'প্রি-অর্ডার' },
};

export default function Badge({ badge, size = 'md' }: BadgeProps) {
  const style = badgeStyles[badge];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`${style.bg} ${style.text} ${sizeClasses} rounded-sm font-medium`}>
      {style.label}
    </span>
  );
}
