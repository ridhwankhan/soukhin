import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

const BUCKET = 'product-images';

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.4,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  fileType: 'image/webp' as const,
  initialQuality: 0.85,
};

export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([compressed], `${baseName}.webp`, { type: 'image/webp' });
}

export async function uploadProductImage(file: File, productId?: string): Promise<string> {
  const optimized = await compressImage(file);
  const folder = productId ?? 'new';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, optimized, {
    cacheControl: '31536000',
    upsert: false,
    contentType: 'image/webp',
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function uploadProductImages(files: File[], productId?: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadProductImage(file, productId));
  }
  return urls;
}

export async function deleteProductImage(publicUrl: string): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;

  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
