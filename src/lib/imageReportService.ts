import { supabase } from './supabase';

export interface ReportBrokenImageInput {
  imageUrl: string;
  productId?: string;
  productName?: string;
  pagePath?: string;
  reporterEmail?: string;
}

export async function reportBrokenImage(input: ReportBrokenImageInput): Promise<void> {
  const { error } = await supabase.rpc('report_broken_image', {
    p_payload: {
      image_url: input.imageUrl,
      product_id: input.productId ?? '',
      product_name: input.productName ?? '',
      page_path: input.pagePath ?? '',
      reporter_email: input.reporterEmail ?? '',
    },
  });
  if (error) throw error;
}
