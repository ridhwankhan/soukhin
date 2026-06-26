import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { AssignableCategory } from '../../lib/categoryService';
import { ProductInput, saveProduct } from '../../lib/productService';
import { uploadProductImages } from '../../lib/imageUploadService';
import Button from '../../components/ui/Button';

interface ProductFormProps {
  product: Product;
  categories: AssignableCategory[];
  isEditing: boolean;
  isNew?: boolean;
  categoryIdMap: Record<string, string>;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductForm({
  product,
  categories,
  isEditing,
  isNew = false,
  categoryIdMap,
  onClose,
  onSaved,
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(product.images.filter((u) => !u.includes('placeholder')));
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: product.name,
    nameBn: product.nameBn,
    categorySlug: product.category,
    price: product.price,
    salePrice: product.salePrice ?? '',
    stock: product.stock,
    sku: product.sku,
    description: product.description,
    descriptionBn: product.descriptionBn ?? '',
    sizeOptions: product.sizeOptions?.join(', ') ?? '',
    colorOptions: product.colorOptions?.join(', ') ?? '',
    foodNote: product.foodNote ?? '',
    deliveryNote: product.deliveryNote ?? '',
    tags: product.tags.join(', '),
    badges: product.badges.join(', '),
    isActive: product.isActive,
    isFeatured: product.isFeatured,
  });

  const canEdit = isEditing || isNew;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPendingFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removePending = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const parseList = (value: string) =>
    value.split(',').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError('');

    try {
      const categoryId = categoryIdMap[form.categorySlug];
      if (!categoryId) throw new Error('Please select a valid category.');

      let finalImages = [...imageUrls];

      if (pendingFiles.length > 0) {
        setUploading(true);
        const uploaded = await uploadProductImages(pendingFiles, product.id || 'new');
        finalImages = [...finalImages, ...uploaded];
        setUploading(false);
      }

      if (finalImages.length === 0) {
        throw new Error('Add at least one product image.');
      }

      const input: ProductInput = {
        id: isNew ? undefined : product.id,
        sku: form.sku,
        name: form.name.trim(),
        nameBn: form.nameBn.trim(),
        categoryId,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        images: finalImages,
        stock: Number(form.stock),
        description: form.description.trim(),
        descriptionBn: form.descriptionBn.trim() || undefined,
        sizeOptions: parseList(form.sizeOptions),
        colorOptions: parseList(form.colorOptions),
        foodNote: form.foodNote.trim() || undefined,
        deliveryNote: form.deliveryNote.trim() || undefined,
        tags: parseList(form.tags),
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        badges: parseList(form.badges),
      };

      await saveProduct(input);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-[#F5F0E8] z-10">
        <h2 className="text-xl font-semibold text-[#2D2D2D]">
          {isNew ? 'Add Product' : isEditing ? 'Edit Product' : 'Product Details'}
        </h2>
        {canEdit && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving || uploading}>
              {uploading ? 'Uploading images...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!canEdit}
              required
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm disabled:bg-[#F8F6F3]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name (Bengali)</label>
            <input
              type="text"
              value={form.nameBn}
              onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
              disabled={!canEdit}
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm disabled:bg-[#F8F6F3]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (৳)</label>
              <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} disabled={!canEdit} required className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm disabled:bg-[#F8F6F3]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sale Price</label>
              <input type="number" min={0} value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} disabled={!canEdit} className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm disabled:bg-[#F8F6F3]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} disabled={!canEdit} required className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm disabled:bg-[#F8F6F3]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} disabled={!canEdit} required className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm disabled:bg-[#F8F6F3]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.categorySlug}
              onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
              disabled={!canEdit}
              required
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm disabled:bg-[#F8F6F3]"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={!canEdit} rows={4} className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm disabled:bg-[#F8F6F3] resize-none" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Images</label>
            <p className="text-xs text-[#666666] mb-3">Images are auto-compressed to WebP (~400KB) for fast loading without visible quality loss.</p>

            <div className="flex flex-wrap gap-2 mb-3">
              {imageUrls.map((url, i) => (
                <div key={url} className="relative w-20 h-20 rounded overflow-hidden border border-[#D4C4B5]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {canEdit && (
                    <button type="button" onClick={() => removeImageUrl(i)} className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {previews.map((url, i) => (
                <div key={url} className="relative w-20 h-20 rounded overflow-hidden border-2 border-dashed border-[#1B4332]">
                  <img src={url} alt="" className="w-full h-full object-cover opacity-80" />
                  {canEdit && (
                    <button type="button" onClick={() => removePending(i)} className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {canEdit && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-[#D4C4B5] rounded-sm w-full hover:border-[#1B4332] hover:bg-[#F8F6F3] transition-colors text-sm text-[#666666]"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload images (auto-compressed)
                </button>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sizes (comma-separated)</label>
            <input type="text" value={form.sizeOptions} onChange={(e) => setForm({ ...form, sizeOptions: e.target.value })} disabled={!canEdit} placeholder="S, M, L, XL" className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm disabled:bg-[#F8F6F3]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Colors (comma-separated)</label>
            <input type="text" value={form.colorOptions} onChange={(e) => setForm({ ...form, colorOptions: e.target.value })} disabled={!canEdit} placeholder="Red, Blue, Green" className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm disabled:bg-[#F8F6F3]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Badges (comma-separated)</label>
            <input type="text" value={form.badges} onChange={(e) => setForm({ ...form, badges: e.target.value })} disabled={!canEdit} placeholder="new, best-seller" className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm disabled:bg-[#F8F6F3]" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} disabled={!canEdit} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} disabled={!canEdit} />
              Featured
            </label>
          </div>
        </div>
      </div>

      {!canEdit && (
        <div className="mt-6 flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        </div>
      )}
    </form>
  );
}
