import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Pencil, Plus, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ImageUploadField, { ImageUploadFieldHandle } from '../components/ImageUploadField';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { uploadProductImages } from '../../lib/imageUploadService';
import { clearCategoryCache } from '../../lib/categoryService';
import {
  AdminCategoryRow,
  CategoryInput,
  fetchCategoriesAdmin,
  saveCategoryAdmin,
  toggleCategoryActive,
} from '../../lib/categoryAdminService';

const emptyForm: CategoryInput = {
  slug: '',
  name: '',
  nameBn: '',
  description: '',
  image: '',
  displayOrder: 0,
  isActive: true,
};

export default function CategoriesAdminPage() {
  const { can } = useAdminAuth();
  const canEdit = can('manage-products');
  const imageRef = useRef<ImageUploadFieldHandle>(null);
  const [categories, setCategories] = useState<AdminCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryRow | null>(null);
  const [form, setForm] = useState<CategoryInput>(emptyForm);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCategories(await fetchCategoriesAdmin());
    } catch (err) {
      setCategories([]);
      setError(err instanceof Error ? err.message : 'Could not load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageUrls([]);
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const openEdit = (cat: AdminCategoryRow) => {
    setEditing(cat);
    setForm({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      nameBn: cat.nameBn,
      description: cat.description ?? '',
      image: cat.image ?? '',
      displayOrder: cat.displayOrder,
      parentId: cat.parentId,
      isActive: cat.isActive,
    });
    setImageUrls(cat.image ? [cat.image] : []);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setError('');
    try {
      let image = imageUrls[0] ?? form.image ?? '';
      if (imageRef.current?.hasPending()) {
        const uploaded = await imageRef.current.uploadPending(form.slug || editing?.slug || 'category');
        if (uploaded[0]) {
          image = uploaded[0];
          setImageUrls(uploaded);
        }
      }

      await saveCategoryAdmin({ ...form, image });
      clearCategoryCache();
      await load();
      setSuccess(
        editing
          ? `Updated "${form.name}". Hidden categories disappear from the shop nav.`
          : `Created "${form.name}".`
      );
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (cat: AdminCategoryRow) => {
    if (!canEdit) return;
    setTogglingId(cat.id);
    setError('');
    try {
      await toggleCategoryActive(cat);
      clearCategoryCache();
      await load();
      setSuccess(
        cat.isActive
          ? `"${cat.name}" is now hidden on the storefront.`
          : `"${cat.name}" is now visible on the storefront.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update visibility');
    } finally {
      setTogglingId(null);
    }
  };

  const parents = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Categories</h1>
          <p className="text-sm text-ink-secondary">
            Edit names, images, order, and hide whole categories from the shop
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          {canEdit && (
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          )}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>}
      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-sm text-sm text-green-700">{success}</div>}

      {!canEdit && (
        <p className="text-sm text-ink-muted bg-canvas border border-line rounded-sm p-3">
          Your role can view categories but not edit them. You need the <strong>manage-products</strong> permission.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-secondary">Loading categories…</p>
      ) : categories.length === 0 ? (
        <div className="bg-elevated rounded-lg shadow-sm p-8 text-center text-sm text-ink-secondary">
          No categories loaded. If this keeps happening, run{' '}
          <code className="text-xs bg-canvas px-1 py-0.5 rounded">supabase/FIX_CATEGORIES_ADMIN.sql</code> in Supabase.
        </div>
      ) : (
        <div className="bg-elevated rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-canvas text-ink-secondary">
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Slug</th>
                  <th className="text-left p-4">Parent</th>
                  <th className="text-left p-4">Products</th>
                  <th className="text-left p-4">Order</th>
                  <th className="text-left p-4">Status</th>
                  {canEdit && <th className="text-right p-4">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {categories.map((cat) => (
                  <motion.tr key={cat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={!cat.isActive ? 'opacity-60' : undefined}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img src={cat.image} alt="" className="w-10 h-10 rounded object-cover bg-canvas" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-canvas border border-line" />
                        )}
                        <div>
                          <p className="font-medium text-ink">{cat.name}</p>
                          <p className="text-xs text-ink-muted">{cat.nameBn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs">{cat.slug}</td>
                    <td className="p-4 text-ink-secondary">{cat.parentSlug ?? '—'}</td>
                    <td className="p-4">{cat.productCount}</td>
                    <td className="p-4">{cat.displayOrder}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium ${cat.isActive ? 'text-green-700' : 'text-red-600'}`}>
                        {cat.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => void handleToggle(cat)}
                          disabled={togglingId === cat.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-ink-secondary hover:bg-canvas rounded disabled:opacity-50"
                          title={cat.isActive ? 'Hide from storefront' : 'Show on storefront'}
                        >
                          {cat.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {cat.isActive ? 'Hide' : 'Show'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(cat)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="md">
        <form onSubmit={(e) => void handleSave(e)} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <h2 className="text-xl font-semibold">{editing ? 'Edit category' : 'Add category'}</h2>
          <Input
            label="Slug (url)"
            required
            disabled={Boolean(editing)}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="e.g. 3d-keyrings"
          />
          {editing && (
            <p className="text-xs text-ink-muted -mt-2">Slug cannot change after create</p>
          )}
          <Input label="Name (English)" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Name (Bengali)" value={form.nameBn ?? ''} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-line rounded-sm bg-elevated resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Category image</label>
            <ImageUploadField
              ref={imageRef}
              urls={imageUrls}
              onUrlsChange={(urls) => {
                setImageUrls(urls.slice(0, 1));
                setForm((f) => ({ ...f, image: urls[0] ?? '' }));
              }}
              onUpload={uploadProductImages}
              uploading={uploading}
              onUploadingChange={setUploading}
              hint="Upload one image or paste a link. Used on Shop by Category."
              buttonLabel="Upload category image"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Parent category</label>
            <select
              value={form.parentId ?? ''}
              onChange={(e) => setForm({ ...form, parentId: e.target.value || undefined })}
              className="w-full px-4 py-2.5 border border-line rounded-sm bg-elevated"
            >
              <option value="">None (top level)</option>
              {parents
                .filter((p) => p.id !== editing?.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>
          <Input
            label="Display order"
            type="number"
            value={String(form.displayOrder ?? 0)}
            onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Visible on storefront (uncheck to hide the whole category)
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving || uploading}>
              Save category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
