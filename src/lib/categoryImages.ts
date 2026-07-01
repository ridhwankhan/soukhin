import { categories, subcategories } from '../data/categories';

const DEFAULT_IMAGE =
  'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg';

const ARTISAN_IMAGE = 'https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg';

const SLUG_IMAGES: Record<string, string> = {
  '3d-prints': ARTISAN_IMAGE,
  '3d-bookmarks': ARTISAN_IMAGE,
  '3d-character-models': ARTISAN_IMAGE,
  '3d-coasters': ARTISAN_IMAGE,
  '3d-printed-gifts': ARTISAN_IMAGE,
  '3d-keyrings': ARTISAN_IMAGE,
  '3d-wall-decor': ARTISAN_IMAGE,
  bedsheets: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg',
  '2d-art': 'https://images.pexels.com/photos/606554/pexels-photo-606554.jpeg',
  'dp-covers': 'https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg',
  '3d-models': ARTISAN_IMAGE,
  '3d-night-lights': ARTISAN_IMAGE,
};

export function getCategoryImageFallback(slug: string): string {
  if (SLUG_IMAGES[slug]) return SLUG_IMAGES[slug];

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
