import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Plus, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  AdminCategoryRow,
  CategoryInput,
  fetchCategoriesAdmin,
  saveCategoryAdmin,
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
  const [categories, setCategories] = useState<AdminCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryRow | null>(null);
  const [form, setForm] = useState<CategoryInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await fetchCategoriesAdmin());
    } catch {
      setCategories([]);
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
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setError('');
    try {
      await saveCategoryAdmin(form);
      await load();
      setSuccess(editing ? 'Category updated.' : 'Category created.');
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const parents = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Categories</h1>
          <p className="text-sm text-ink-secondary">Manage your store category tree — names, images, order, visibility</p>
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

      {loading ? (
        <p className="text-sm text-ink-secondary">Loading categories…</p>
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
                  <motion.tr key={cat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {cat.image && (
                          <img src={cat.image} alt="" className="w-10 h-10 rounded object-cover" />
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
                      <td className="p-4 text-right">
                        <button onClick={() => openEdit(cat)} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded">
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
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">{editing ? 'Edit category' : 'Add category'}</h2>
          <Input label="Slug (url)" required disabled={Boolean(editing)} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input label="Name (English)" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Name (Bengali)" value={form.nameBn ?? ''} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} />
          <Input label="Image URL" value={form.image ?? ''} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Parent category</label>
            <select
              value={form.parentId ?? ''}
              onChange={(e) => setForm({ ...form, parentId: e.target.value || undefined })}
              className="w-full px-4 py-2.5 border border-line rounded-sm bg-elevated"
            >
              <option value="">None (top level)</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <Input label="Display order" type="number" value={String(form.displayOrder ?? 0)} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Visible on storefront
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={saving}>Save category</Button>
        </form>
      </Modal>
    </div>
  );
}
