import { supabase } from './supabase';
import { Review } from '../types';

export interface AdminReview extends Review {
  productName?: string;
}

export async function fetchAdminReviews(): Promise<AdminReview[]> {
  const { data, error } = await supabase.rpc('list_reviews_admin');
  if (error) throw error;
  return (data as AdminReview[]) ?? [];
}

export async function approveReview(reviewId: string): Promise<void> {
  const { error } = await supabase.rpc('set_review_approved_admin', {
    p_review_id: reviewId,
    p_approved: true,
  });
  if (error) throw error;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_review_admin', { p_review_id: reviewId });
  if (error) throw error;
}
