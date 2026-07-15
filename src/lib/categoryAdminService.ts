import { supabase } from './supabase';
import { clearCategoryCache } from './categoryService';

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

export async function fetchCategoriesAdmin(): Promise<AdminCategoryRow[]> {
  const { data, error } = await supabase.rpc('list_categories_admin');
  if (error) throw error;
  return (data as AdminCategoryRow[]) ?? [];
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
  if (error) throw error;
  clearCategoryCache();
  return data as AdminCategoryRow;
}

export async function exportSyncData(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.rpc('export_sync_data_admin');
  if (error) throw error;
  return (data as Record<string, unknown>) ?? {};
}
