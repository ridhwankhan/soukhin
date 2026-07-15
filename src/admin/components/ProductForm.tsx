import { useState, useRef, useEffect, useCallback } from 'react';
import { Product } from '../../types';
import { AssignableCategory, getCategoryIdBySlug } from '../../lib/categoryService';
import { ProductInput, saveProduct } from '../../lib/productService';
import { uploadProductImages } from '../../lib/imageUploadService';
import { parseSupabaseError } from '../../lib/parseSupabaseError';
import { useFlushOnPageHide } from '../../hooks/useFlushOnPageHide';
import Button from '../../components/ui/Button';
import CategorySelect from '../../components/admin/CategorySelect';
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
  productId: string | 'new';
  form: {
    name: string;
    nameBn: string;
    categorySlug: string;
    priceInput: string;
    salePrice: string;
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

function priceToInput(price: number): string {
  return price > 0 ? String(price) : '';
}

function parsePriceInput(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

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

  const draftKey = isNew ? 'new' : product.id || 'new';

  const [form, setForm] = useState({
    name: product.name,
    nameBn: product.nameBn,
    categorySlug: product.category,
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
  const [priceInput, setPriceInput] = useState(priceToInput(product.price));
  const [salePriceInput, setSalePriceInput] = useState(
    product.salePrice && product.salePrice > 0 ? String(product.salePrice) : ''
  );

  const canEdit = isEditing || isNew;

  const persistDraft = useCallback(() => {
    if (!canEdit) return;
    try {
      const draft: ProductDraft = {
        productId: draftKey,
        form: { ...form, priceInput, salePrice: salePriceInput },
        imageUrls,
      };
      sessionStorage.setItem(PRODUCT_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore quota errors
    }
  }, [canEdit, draftKey, form, priceInput, salePriceInput, imageUrls]);

  useEffect(() => {
    if (!canEdit) return;
    try {
      const raw = sessionStorage.getItem(PRODUCT_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as ProductDraft;
      if (draft.productId !== draftKey) return;
      setForm({
        name: draft.form.name,
        nameBn: draft.form.nameBn,
        categorySlug: draft.form.categorySlug,
        stock: draft.form.stock,
        sku: draft.form.sku,
        description: draft.form.description,
        descriptionBn: draft.form.descriptionBn,
        sizeOptions: draft.form.sizeOptions,
        colorOptions: draft.form.colorOptions,
        foodNote: draft.form.foodNote,
        deliveryNote: draft.form.deliveryNote,
        tags: draft.form.tags,
        badges: draft.form.badges,
        isActive: draft.form.isActive,
        isFeatured: draft.form.isFeatured,
      });
      setPriceInput(draft.form.priceInput ?? '');
      setSalePriceInput(draft.form.salePrice ?? '');
      setImageUrls(draft.imageUrls ?? []);
    } catch {
      // ignore corrupt draft
    }
  }, [canEdit, draftKey]);

  useEffect(() => {
    if (!canEdit) return;
    const timer = window.setTimeout(() => persistDraft(), 400);
    return () => window.clearTimeout(timer);
  }, [canEdit, persistDraft]);

  useFlushOnPageHide(persistDraft);

  const handleClose = () => {
    if (canEdit) clearProductDraft();
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
      let categoryId = categoryIdMap[form.categorySlug];
      if (!categoryId) {
        categoryId = (await getCategoryIdBySlug(form.categorySlug)) ?? undefined;
      }
      if (!categoryId) {
        throw new Error('Please select a valid category from the list.');
      }

      let finalImages = [...imageUrls];

      if (imageRef.current?.hasPending()) {
        const uploaded = await imageRef.current.uploadPending(product.id || 'new');
        finalImages = [...finalImages, ...uploaded];
      }

      if (finalImages.length === 0) {
        throw new Error('Add at least one product image.');
      }

      const price = parsePriceInput(priceInput);
      const salePrice = parsePriceInput(salePriceInput);

      const input: ProductInput = {
        id: isNew ? undefined : product.id,
        sku: form.sku,
        name: form.name.trim(),
        nameBn: form.nameBn.trim(),
        categoryId,
        price,
        salePrice: salePrice > 0 ? salePrice : undefined,
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
      if (canEdit) clearProductDraft();
      onSaved();
      handleClose();
    } catch (err) {
      setError(parseSupabaseError(err));
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
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={priceInput}
                onChange={(e) => {
                  const next = e.target.value;
                  if (next !== '' && !/^\d+$/.test(next)) return;
                  setPriceInput(next);
                }}
                onBlur={() => {
                  if (!priceInput.trim()) setPriceInput('');
                }}
                disabled={!canEdit}
                placeholder="UNDECLARED"
                className={`w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas ${
                  !priceInput.trim() ? 'text-ink-secondary italic' : ''
                }`}
              />
              {!priceInput.trim() && (
                <p className="mt-1 text-xs text-ink-secondary">Price not set — shows as UNDECLARED on the store.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sale Price</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={salePriceInput}
                onChange={(e) => {
                  const next = e.target.value;
                  if (next !== '' && !/^\d+$/.test(next)) return;
                  setSalePriceInput(next);
                }}
                disabled={!canEdit}
                placeholder="Optional"
                className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas"
              />
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
            <CategorySelect
              categories={categories}
              value={form.categorySlug}
              onChange={(categorySlug) => setForm({ ...form, categorySlug })}
              disabled={!canEdit}
              required
            />
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
            <input type="text" value={form.badges} onChange={(e) => setForm({ ...form, badges: e.target.value })} disabled={!canEdit} placeholder="new, hot, best-seller" className="w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas" />
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
