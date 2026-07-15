import { supabase } from './supabase';
import { clearCategoryCache } from './categoryService';
import { parseSupabaseError } from './parseSupabaseError';

export interface AdminCategoryRow {
  id: string;
  slug: string;
  name: string;
  nameBn: string;
  description?: string;
  image?: string;
  displayOrder: number;
  parentId?: string;
  parentSlug?: string;
  isActive: boolean;
  productCount: number;
}

export interface CategoryInput {
  id?: string;
  slug: string;
  name: string;
  nameBn?: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  parentId?: string;
  isActive?: boolean;
}

function mapDirectRow(
  row: {
    id: string;
    slug: string;
    name: string;
    name_bn: string | null;
    description: string | null;
    image: string | null;
    display_order: number;
    parent_id: string | null;
    is_active: boolean;
  },
  slugById: Map<string, string>,
  productCount: number
): AdminCategoryRow {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameBn: row.name_bn ?? '',
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    displayOrder: row.display_order,
    parentId: row.parent_id ?? undefined,
    parentSlug: row.parent_id ? slugById.get(row.parent_id) : undefined,
    isActive: row.is_active,
    productCount,
  };
}

async function fetchCategoriesAdminFallback(): Promise<AdminCategoryRow[]> {
  const { data: rows, error } = await supabase
    .from('categories')
    .select('id, slug, name, name_bn, description, image, display_order, parent_id, is_active')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;

  const list = rows ?? [];
  const slugById = new Map(list.map((r) => [r.id, r.slug]));

  const { data: products } = await supabase.from('products').select('category_id');
  const counts = new Map<string, number>();
  for (const p of products ?? []) {
    if (!p.category_id) continue;
    counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  }

  return list.map((row) => mapDirectRow(row, slugById, counts.get(row.id) ?? 0));
}

export async function fetchCategoriesAdmin(): Promise<AdminCategoryRow[]> {
  const { data, error } = await supabase.rpc('list_categories_admin');

  if (!error && Array.isArray(data)) {
    return data as AdminCategoryRow[];
  }

  // Live DB had a broken ORDER BY alias in list_categories_admin — fall back.
  try {
    return await fetchCategoriesAdminFallback();
  } catch (fallbackErr) {
    throw new Error(
      parseSupabaseError(error ?? fallbackErr) ||
        'Could not load categories. Run supabase/FIX_CATEGORIES_ADMIN.sql in Supabase.'
    );
  }
}

export async function saveCategoryAdmin(input: CategoryInput): Promise<AdminCategoryRow> {
  const { data, error } = await supabase.rpc('save_category_admin', {
    p_payload: {
      id: input.id ?? null,
      slug: input.slug,
      name: input.name,
      nameBn: input.nameBn ?? '',
      description: input.description ?? '',
      image: input.image ?? '',
      displayOrder: input.displayOrder ?? 0,
      parentId: input.parentId ?? null,
      isActive: input.isActive ?? true,
    },
  });

  if (error) {
    const msg = error.message || '';
    if (msg.includes('permission_denied') || error.code === '42501') {
      throw new Error('Your staff role cannot manage categories (needs manage-products).');
    }
    throw new Error(parseSupabaseError(error));
  }

  clearCategoryCache();
  return data as AdminCategoryRow;
}

export async function toggleCategoryActive(cat: AdminCategoryRow): Promise<AdminCategoryRow> {
  return saveCategoryAdmin({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    nameBn: cat.nameBn,
    description: cat.description,
    image: cat.image,
    displayOrder: cat.displayOrder,
    parentId: cat.parentId,
    isActive: !cat.isActive,
  });
}

export async function exportSyncData(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.rpc('export_sync_data_admin');
  if (error) throw error;
  return (data as Record<string, unknown>) ?? {};
}
