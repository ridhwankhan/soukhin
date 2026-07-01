import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

export const PRODUCT_IMAGES_BUCKET = 'product-images';
export const LEAD_IMAGES_BUCKET = 'lead-images';

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.4,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  fileType: 'image/webp' as const,
  initialQuality: 0.85,
};

function isGif(file: File): boolean {
  return file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
}

export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([compressed], `${baseName}.webp`, { type: 'image/webp' });
}

export async function prepareImageFile(file: File): Promise<{ file: File; ext: string; contentType: string }> {
  if (isGif(file)) {
    return { file, ext: 'gif', contentType: 'image/gif' };
  }
  const optimized = await compressImage(file);
  return { file: optimized, ext: 'webp', contentType: 'image/webp' };
}

export async function uploadImage(
  file: File,
  bucket: string,
  folder: string
): Promise<string> {
  const { file: uploadFile, ext, contentType } = await prepareImageFile(file);
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, uploadFile, {
    cacheControl: '31536000',
    upsert: false,
    contentType,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function uploadImages(
  files: File[],
  bucket: string,
  folder: string
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadImage(file, bucket, folder));
  }
  return urls;
}

export async function uploadProductImages(files: File[], productId?: string): Promise<string[]> {
  return uploadImages(files, PRODUCT_IMAGES_BUCKET, productId ?? 'new');
}

export async function uploadLeadImages(files: File[], leadId?: string): Promise<string[]> {
  return uploadImages(files, LEAD_IMAGES_BUCKET, leadId ?? 'new');
}

export async function deleteStorageImage(publicUrl: string, bucket: string): Promise<void> {
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;

  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(bucket).remove([path]);
}

export async function deleteProductImage(publicUrl: string): Promise<void> {
  return deleteStorageImage(publicUrl, PRODUCT_IMAGES_BUCKET);
}

export async function deleteLeadImage(publicUrl: string): Promise<void> {
  return deleteStorageImage(publicUrl, LEAD_IMAGES_BUCKET);
}
