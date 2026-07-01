import { useState, useRef, useEffect } from 'react';
import { Product } from '../../types';
import { AssignableCategory } from '../../lib/categoryService';
import { ProductInput, saveProduct } from '../../lib/productService';
import { uploadProductImages } from '../../lib/imageUploadService';
import Button from '../../components/ui/Button';
import ImageUploadField, { ImageUploadFieldHandle } from './ImageUploadField';

interface ProductFormProps {
  product: Product;
  categories: AssignableCategory[];
  isEditing: boolean;
  isNew?: boolean;
  categoryIdMap: Record<string, string>;
  onClose: () => void;
  onSaved: () => void;
}

const PRODUCT_DRAFT_KEY = 'soukhin_admin_product_draft';

type ProductDraft = {
  form: {
    name: string;
    nameBn: string;
    categorySlug: string;
    price: number;
    salePrice: number | '';
    stock: number;
    sku: string;
    description: string;
    descriptionBn: string;
    sizeOptions: string;
    colorOptions: string;
    foodNote: string;
    deliveryNote: string;
    tags: string;
    badges: string;
    isActive: boolean;
    isFeatured: boolean;
  };
  imageUrls: string[];
};

function clearProductDraft() {
  try {
    sessionStorage.removeItem(PRODUCT_DRAFT_KEY);
  } catch {
    // ignore
  }
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
  const imageRef = useRef<ImageUploadFieldHandle>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(product.images.filter((u) => !u.includes('placeholder')));

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

  useEffect(() => {
    if (!isNew) return;
    try {
      const raw = sessionStorage.getItem(PRODUCT_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as ProductDraft;
      setForm(draft.form);
      setImageUrls(draft.imageUrls ?? []);
    } catch {
      // ignore corrupt draft
    }
  }, [isNew]);

  useEffect(() => {
    if (!isNew || !canEdit) return;
    const timer = window.setTimeout(() => {
      try {
        const draft: ProductDraft = { form, imageUrls };
        sessionStorage.setItem(PRODUCT_DRAFT_KEY, JSON.stringify(draft));
      } catch {
        // ignore quota errors
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [isNew, canEdit, form, imageUrls]);

  const handleClose = () => {
    if (isNew) clearProductDraft();
    onClose();
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

      if (imageRef.current?.hasPending()) {
        const uploaded = await imageRef.current.uploadPending(product.id || 'new');
        finalImages = [...finalImages, ...uploaded];
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
      if (isNew) clearProductDraft();
      onSaved();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-elevated pb-4 border-b border-line z-10">
        <h2 className="text-xl font-semibold text-ink">
          {isNew ? 'Add Product' : isEditing ? 'Edit Product' : 'Product Details'}
        </h2>
        {canEdit && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
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
              className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name (Bengali)</label>
            <input
              type="text"
              value={form.nameBn}
              onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
              disabled={!canEdit}
              className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (৳)</label>
              <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} disabled={!canEdit} required className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sale Price</label>
              <input type="number" min={0} value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} disabled={!canEdit} className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} disabled={!canEdit} required className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} disabled={!canEdit} required className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.categorySlug}
              onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
              disabled={!canEdit}
              required
              className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={!canEdit} rows={4} className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas resize-none" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Images</label>
            <ImageUploadField
              ref={imageRef}
              urls={imageUrls}
              onUrlsChange={setImageUrls}
              onUpload={uploadProductImages}
              disabled={!canEdit}
              uploading={uploading}
              onUploadingChange={setUploading}
              hint="Upload multiple images or paste links. First image = main photo. JPEG/PNG → WebP. GIFs keep animation."
              buttonLabel="Upload from computer (multiple allowed)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sizes (comma-separated)</label>
            <input type="text" value={form.sizeOptions} onChange={(e) => setForm({ ...form, sizeOptions: e.target.value })} disabled={!canEdit} placeholder="S, M, L, XL" className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Colors (comma-separated)</label>
            <input type="text" value={form.colorOptions} onChange={(e) => setForm({ ...form, colorOptions: e.target.value })} disabled={!canEdit} placeholder="Red, Blue, Green" className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Badges (comma-separated)</label>
            <input type="text" value={form.badges} onChange={(e) => setForm({ ...form, badges: e.target.value })} disabled={!canEdit} placeholder="new, best-seller" className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas" />
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
