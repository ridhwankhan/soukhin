import { Category, CategorySlug } from '../types';
import { supabase } from './supabase';
import { resolveCategoryImage } from './categoryImages';

interface DbCategoryRow {
  id: string;
  slug: string;
  name: string;
  name_bn: string | null;
  description: string | null;
  image: string | null;
  display_order: number;
  parent_id: string | null;
}

export interface AssignableCategory {
  id: string;
  slug: string;
  name: string;
  nameBn: string;
  parentSlug?: string;
  rootSlug?: string;
}

let navCache: DbCategoryRow[] | null = null;

function mapCategory(row: DbCategoryRow, productCount = 0): Category {
  return {
    id: row.id,
    slug: row.slug as CategorySlug,
    name: row.name,
    nameBn: row.name_bn ?? '',
    description: row.description ?? '',
    image: resolveCategoryImage(row.slug, row.image),
    productCount,
    parentId: row.parent_id ?? undefined,
  };
}

export async function fetchCategoryNav(): Promise<DbCategoryRow[]> {
  if (navCache) return navCache;

  const { data, error } = await supabase.rpc('get_category_nav');
  if (error) throw error;

  navCache = (data as DbCategoryRow[]) ?? [];
  return navCache;
}

export function clearCategoryCache(): void {
  navCache = null;
}

export async function getTopLevelCategories(): Promise<Category[]> {
  const all = await fetchCategoryNav();
  return all
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.display_order - b.display_order)
    .map((c) => mapCategory(c));
}

export async function getSubcategoriesForParent(parentSlug: string): Promise<Category[]> {
  const all = await fetchCategoryNav();
  const parent = all.find((c) => c.slug === parentSlug);
  if (!parent) return [];

  const directChildren = all.filter((c) => c.parent_id === parent.id);

  // Flatten: if children have their own children (wearables-women), show leaf subcats for storefront nav
  const leaves: DbCategoryRow[] = [];
  for (const child of directChildren) {
    const grandchildren = all.filter((c) => c.parent_id === child.id);
    if (grandchildren.length > 0) {
      leaves.push(...grandchildren);
    } else {
      leaves.push(child);
    }
  }

  return leaves
    .sort((a, b) => a.display_order - b.display_order)
    .map((c) => mapCategory(c));
}

export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await fetchCategoryNav();
  const row = all.find((c) => c.slug === slug);
  return row ? mapCategory(row) : null;
}

export async function fetchAssignableCategories(): Promise<AssignableCategory[]> {
  const { data, error } = await supabase.rpc('get_assignable_categories');
  if (error) throw error;

  return ((data as {
    id: string;
    slug: string;
    name: string;
    name_bn: string | null;
    parent_slug: string | null;
    root_slug: string | null;
  }[]) ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameBn: row.name_bn ?? '',
    parentSlug: row.parent_slug ?? undefined,
    rootSlug: row.root_slug ?? undefined,
  }));
}

export async function getCategoryIdBySlug(slug: string): Promise<string | null> {
  const all = await fetchCategoryNav();
  return all.find((c) => c.slug === slug)?.id ?? null;
}
