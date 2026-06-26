import { supabase } from './supabase';

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  statusCounts: Record<string, number>;
  paymentBreakdown: { method: string; count: number }[];
}

export interface CategoryRevenue {
  categorySlug: string;
  categoryName: string;
  revenue: number;
  orderCount: number;
}

export interface TopLevelCategory {
  slug: string;
  name: string;
}

export type TimeFrame = 'today' | '7d' | '30d' | 'year' | 'all' | 'custom';

export function getDateRange(timeFrame: TimeFrame, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  const end = customEnd ?? new Date();
  const start = customStart ?? new Date(end);

  if (!customStart) {
    switch (timeFrame) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case 'year':
        start.setFullYear(end.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'all':
        start.setFullYear(2020, 0, 1);
        break;
      case 'custom':
        break;
    }
  }

  return { start, end };
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data, error } = await supabase.rpc('get_dashboard_summary');
  if (error) throw error;
  return data as DashboardSummary;
}

export async function fetchTopLevelCategories(): Promise<TopLevelCategory[]> {
  const { data, error } = await supabase.rpc('get_top_level_categories');
  if (error) throw error;
  return (data ?? []).map((row: { slug: string; name: string }) => ({
    slug: row.slug,
    name: row.name,
  }));
}

export async function fetchCategoryRevenue(
  start: Date,
  end: Date,
  categorySlugs?: string[]
): Promise<CategoryRevenue[]> {
  const { data, error } = await supabase.rpc('get_category_revenue', {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
    p_category_slugs: categorySlugs?.length ? categorySlugs : null,
  });
  if (error) throw error;

  return (data ?? []).map((row: {
    category_slug: string;
    category_name: string;
    revenue: number;
    order_count: number;
  }) => ({
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    revenue: Number(row.revenue),
    orderCount: Number(row.order_count),
  }));
}
