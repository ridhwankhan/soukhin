import { CategorySlug, Product, ProductBadge } from '../types';
import { supabase } from './supabase';
import { getCategoryIdBySlug } from './categoryService';

interface DbProductRow {
  id: string;
  sku: string;
  name: string;
  name_bn: string | null;
  category_slug: string;
  category_id?: string;
  price: number;
  sale_price: number | null;
  images: string[];
  stock: number;
  description: string | null;
  description_bn: string | null;
  size_options: string[];
  color_options: string[];
  food_note: string | null;
  delivery_note: string | null;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  badges: string[];
  created_at: string;
  updated_at: string;
}

export function mapDbProduct(row: DbProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    nameBn: row.name_bn ?? '',
    category: row.category_slug as CategorySlug,
    price: row.price,
    salePrice: row.sale_price ?? undefined,
    images: row.images?.length ? row.images : [],
    stock: row.stock,
    sku: row.sku,
    description: row.description ?? '',
    descriptionBn: row.description_bn ?? undefined,
    sizeOptions: row.size_options?.length ? row.size_options : undefined,
    colorOptions: row.color_options?.length ? row.color_options : undefined,
    foodNote: row.food_note ?? undefined,
    deliveryNote: row.delivery_note ?? undefined,
    tags: row.tags ?? [],
    isActive: row.is_active,
    isFeatured: row.is_featured,
    badges: (row.badges ?? []) as ProductBadge[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchProductsByCategory(
  categorySlug: string,
  activeOnly = true
): Promise<Product[]> {
  const { data, error } = await supabase.rpc('get_products_by_category_slug', {
    p_slug: categorySlug,
    p_active_only: activeOnly,
  });
  if (error) throw error;
  return ((data as DbProductRow[]) ?? []).map(mapDbProduct);
}

export async function fetchAllProducts(activeOnly = false): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, sku, name, name_bn, price, sale_price, images, stock,
      description, description_bn, size_options, color_options,
      food_note, delivery_note, tags, is_active, is_featured, badges,
      created_at, updated_at, category_id,
      categories ( slug )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .filter((row) => !activeOnly || row.is_active)
    .map((row) =>
      mapDbProduct({
        ...(row as unknown as DbProductRow),
        category_slug: (row.categories as { slug: string } | null)?.slug ?? 'gifts',
      })
    );
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, sku, name, name_bn, price, sale_price, images, stock,
      description, size_options, color_options, food_note, delivery_note,
      tags, is_active, is_featured, badges, created_at, updated_at,
      categories ( slug )
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) =>
    mapDbProduct({
      ...(row as unknown as DbProductRow),
      category_slug: (row.categories as { slug: string } | null)?.slug ?? 'gifts',
    })
  );
}

export async function fetchNewArrivals(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, sku, name, name_bn, price, sale_price, images, stock,
      description, size_options, color_options, food_note, delivery_note,
      tags, is_active, is_featured, badges, created_at, updated_at,
      categories ( slug )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) =>
    mapDbProduct({
      ...(row as unknown as DbProductRow),
      category_slug: (row.categories as { slug: string } | null)?.slug ?? 'gifts',
    })
  );
}

export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  const { data, error } = await supabase.rpc('search_products_query', {
    p_query: query.trim(),
    p_limit: limit,
  });
  if (error) throw error;
  return ((data as DbProductRow[]) ?? []).map(mapDbProduct);
}

export interface ProductInput {
  id?: string;
  sku: string;
  name: string;
  nameBn: string;
  categoryId: string;
  price: number;
  salePrice?: number;
  images: string[];
  stock: number;
  description: string;
  descriptionBn?: string;
  sizeOptions: string[];
  colorOptions: string[];
  foodNote?: string;
  deliveryNote?: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  badges: string[];
}

export async function saveProduct(input: ProductInput): Promise<Product> {
  const payload = {
    id: input.id ?? '',
    sku: input.sku,
    name: input.name,
    name_bn: input.nameBn,
    category_id: input.categoryId,
    price: input.price,
    sale_price: input.salePrice ?? '',
    images: input.images,
    stock: input.stock,
    description: input.description,
    description_bn: input.descriptionBn ?? '',
    size_options: input.sizeOptions,
    color_options: input.colorOptions,
    food_note: input.foodNote ?? '',
    delivery_note: input.deliveryNote ?? '',
    tags: input.tags,
    is_active: input.isActive,
    is_featured: input.isFeatured,
    badges: input.badges,
  };

  const { data, error } = await supabase.rpc('upsert_product_admin', { p_payload: payload });
  if (error) throw error;
  return mapDbProduct(data as DbProductRow);
}

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_product_admin', { p_product_id: productId });
  if (error) throw error;
}

export async function fetchLowStockProducts(threshold = 10): Promise<Product[]> {
  const all = await fetchAllProducts(false);
  return all
    .filter((p) => p.stock <= threshold)
    .sort((a, b) => a.stock - b.stock);
}

export async function updateProductStock(productId: string, stock: number): Promise<void> {
  const { error } = await supabase.rpc('update_product_stock_admin', {
    p_product_id: productId,
    p_stock: stock,
  });
  if (error) throw error;
}

export function createEmptyProduct(categorySlug?: string): Product {
  return {
    id: '',
    name: '',
    nameBn: '',
    category: (categorySlug ?? 'gifts') as CategorySlug,
    price: 0,
    images: [],
    stock: 0,
    sku: `SK-${Date.now().toString(36).toUpperCase()}`,
    description: '',
    tags: [],
    isActive: true,
    isFeatured: false,
    badges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function resolveCategoryIdForProduct(categorySlug: string): Promise<string> {
  const id = await getCategoryIdBySlug(categorySlug);
  if (!id) throw new Error(`Category not found: ${categorySlug}`);
  return id;
}
