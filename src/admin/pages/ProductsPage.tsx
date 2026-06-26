import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { Product } from '../../types';
import { fetchAllProducts, deleteProduct, createEmptyProduct } from '../../lib/productService';
import { fetchAssignableCategories, AssignableCategory } from '../../lib/categoryService';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import ProductForm from '../components/ProductForm';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { BRAND_CONFIG } from '../../config';

export default function ProductsPage() {
  const { can } = useAdminAuth();
  const canManage = can('manage-products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<AssignableCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const categoryIdMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.slug, c.id])),
    [categories]
  );

  const loadData = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        fetchAllProducts(false),
        fetchAssignableCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch {
      if (!options?.silent) setProducts([]);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.nameBn.includes(search);
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (product: Product) => {
    if (!confirm(`Remove "${product.name}" from the store?`)) return;
    try {
      await deleteProduct(product.id);
      await loadData();
    } catch {
      alert('Could not delete product.');
    }
  };

  const openCreate = () => {
    const defaultCat = categoryFilter !== 'all' ? categoryFilter : categories[0]?.slug;
    const empty = createEmptyProduct(defaultCat);
    setSelectedProduct(empty);
    setIsNew(true);
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Products</h1>
          <p className="text-sm text-ink-secondary">
            {loading ? 'Loading...' : `${filteredProducts.length} products — saved to database`}
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        )}
      </div>

      <div className="bg-elevated rounded-lg shadow-sm p-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-secondary" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-line rounded-sm bg-elevated focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-elevated rounded-lg shadow-sm overflow-hidden">
        {filteredProducts.length === 0 && !loading ? (
          <div className="p-12 text-center text-ink-secondary">
            <p className="mb-2">No products yet.</p>
            <p className="text-sm mb-4">Add your first product with images — they will appear on the storefront instantly.</p>
            {canManage && (
              <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Product</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-canvas text-sm text-ink-secondary">
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Stock</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredProducts.map((product) => (
                  <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-canvas">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={product.images[0]} alt="" className="w-12 h-12 object-cover rounded" />
                        <div>
                          <p className="font-medium text-ink">{product.name}</p>
                          <p className="text-xs text-ink-secondary">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-ink-secondary capitalize">{product.category.replace(/-/g, ' ')}</td>
                    <td className="p-4 font-medium text-accent">
                      {BRAND_CONFIG.currency.symbol}{(product.salePrice ?? product.price).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>{product.stock}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-xs rounded ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button onClick={() => { setSelectedProduct(product); setIsEditing(false); setIsNew(false); }} className="p-2 hover:bg-accent/10 rounded" title="View">
                        <Eye className="w-4 h-4 text-accent" />
                      </button>
                      {canManage && (
                        <>
                          <button onClick={() => { setSelectedProduct(product); setIsEditing(true); setIsNew(false); }} className="p-2 hover:bg-accent/10 rounded" title="Edit">
                            <Edit2 className="w-4 h-4 text-ink-secondary" />
                          </button>
                          <button onClick={() => handleDelete(product)} className="p-2 hover:bg-red-50 rounded" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedProduct}
        onClose={() => { setSelectedProduct(null); setIsEditing(false); setIsNew(false); }}
        size="xl"
      >
        {selectedProduct && (
          categories.length > 0 ? (
            <ProductForm
              product={selectedProduct}
              categories={categories}
              isEditing={isEditing}
              isNew={isNew}
              categoryIdMap={categoryIdMap}
              onClose={() => { setSelectedProduct(null); setIsEditing(false); setIsNew(false); }}
              onSaved={() => loadData({ silent: !!selectedProduct })}
            />
          ) : (
            <div className="p-8 text-center text-sm text-ink-secondary">Loading categories…</div>
          )
        )}
      </Modal>
    </div>
  );
}
