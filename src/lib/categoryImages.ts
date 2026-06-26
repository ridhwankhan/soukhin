import { categories, subcategories } from '../data/categories';

const DEFAULT_IMAGE =
  'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg';

export function getCategoryImageFallback(slug: string): string {
  const top = categories.find((c) => c.slug === slug);
  if (top?.image) return top.image;

  for (const subs of Object.values(subcategories)) {
    const sub = subs.find((c) => c.slug === slug);
    if (sub?.image) return sub.image;
  }

  return DEFAULT_IMAGE;
}

export function resolveCategoryImage(slug: string, image?: string | null): string {
  if (image?.trim()) return image;
  return getCategoryImageFallback(slug);
}
