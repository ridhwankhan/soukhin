import type { AssignableCategory } from './categoryService';
import type { Category } from '../types';

const ROOT_LABELS: Record<string, string> = {
  wearables: 'Wearables',
  'home-living': 'Home & Living',
  'food-pitha': 'Food & Pitha',
  jewelry: 'Jewelry',
  gifts: 'Gifts & Artisan',
  'new-arrivals': 'New Arrivals',
  '3d-prints': 'Artisan Luxe',
  '3d-models': "Collector's Edition",
};

export interface LabeledGroup<T> {
  label: string;
  items: T[];
}

export function groupAssignableCategories(
  categories: AssignableCategory[]
): LabeledGroup<AssignableCategory>[] {
  const buckets = new Map<string, AssignableCategory[]>();

  for (const cat of categories) {
    const groupKey = cat.rootSlug ?? cat.parentSlug ?? cat.slug;
    const list = buckets.get(groupKey) ?? [];
    list.push(cat);
    buckets.set(groupKey, list);
  }

  return Array.from(buckets.entries())
    .map(([key, items]) => ({
      label: ROOT_LABELS[key] ?? items[0]?.name ?? key,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export interface CategoryNavRow {
  id: string;
  slug: string;
  name: string;
  name_bn: string | null;
  description: string | null;
  image: string | null;
  display_order: number;
  parent_id: string | null;
}

export function buildSubcategoryGroups(
  all: CategoryNavRow[],
  parentSlug: string,
  mapRow: (row: CategoryNavRow) => Category
): LabeledGroup<Category>[] {
  const parent = all.find((c) => c.slug === parentSlug);
  if (!parent) return [];

  const directChildren = all
    .filter((c) => c.parent_id === parent.id)
    .sort((a, b) => a.display_order - b.display_order);

  const groups: LabeledGroup<Category>[] = [];

  for (const child of directChildren) {
    const grandchildren = all
      .filter((c) => c.parent_id === child.id)
      .sort((a, b) => a.display_order - b.display_order);

    if (grandchildren.length > 0) {
      groups.push({
        label: child.name,
        items: grandchildren.map(mapRow),
      });
    } else {
      groups.push({
        label: child.name,
        items: [mapRow(child)],
      });
    }
  }

  return groups;
}
