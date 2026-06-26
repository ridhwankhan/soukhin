import { supabase } from './supabase';
import { Coupon } from '../types';

export async function fetchAdminCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase.rpc('list_coupons_admin');
  if (error) throw error;
  return (data as Coupon[]) ?? [];
}

export interface CouponInput {
  id?: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxUses?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export async function saveCoupon(input: CouponInput): Promise<Coupon> {
  const { data, error } = await supabase.rpc('upsert_coupon_admin', {
    p_payload: {
      id: input.id ?? '',
      code: input.code,
      type: input.type,
      value: input.value,
      minOrderAmount: input.minOrderAmount,
      maxUses: input.maxUses ?? '',
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      isActive: input.isActive,
    },
  });
  if (error) throw error;
  return data as Coupon;
}

export async function setCouponActive(couponId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_coupon_active_admin', {
    p_coupon_id: couponId,
    p_is_active: isActive,
  });
  if (error) throw error;
}
