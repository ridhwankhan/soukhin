import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, Filter } from 'lucide-react';
import { products, categories, subcategories } from '../../data';
import { Product } from '../../types';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { BRAND_CONFIG } from '../../config';

const allCategories = [
  ...categories,
  ...Object.values(subcategories).flat(),
];

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.nameBn.includes(search);
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Products</h1>
          <p className="text-sm text-[#666666]">{filteredProducts.length} products found</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-[#D4C4B5] rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
        >
          <option value="all">All Categories</option>
          <optgroup label="Main Categories">
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </optgroup>
          {Object.entries(subcategories).map(([parentSlug, subs]) => (
            <optgroup key={parentSlug} label={`${parentSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Subcategories`}>
              {subs.map(sub => (
                <option key={sub.id} value={sub.slug}>{sub.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F6F3] text-sm text-[#666666]">
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]">
              {filteredProducts.map((product) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#F8F6F3] transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-[#2D2D2D]">{product.name}</p>
                        <p className="text-xs text-[#666666]">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#666666] capitalize">
                    {product.category.replace('-', ' ')}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-[#1B4332]">
                        {BRAND_CONFIG.currency.symbol}{(product.salePrice ?? product.price).toLocaleString()}
                      </p>
                      {product.salePrice && (
                        <p className="text-xs text-[#666666] line-through">
                          {BRAND_CONFIG.currency.symbol}{product.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      product.stock <= 5 ? 'bg-red-100 text-red-600' :
                      product.stock <= 10 ? 'bg-amber-100 text-amber-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {product.isFeatured && (
                        <span className="px-2 py-0.5 bg-[#B8860B]/10 text-[#B8860B] text-xs rounded">Featured</span>
                      )}
                      {!product.isActive && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Inactive</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => { setSelectedProduct(product); setIsEditing(false); }}
                      className="p-2 hover:bg-[#1B4332]/10 rounded transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-[#1B4332]" />
                    </button>
                    <button
                      onClick={() => { setSelectedProduct(product); setIsEditing(true); }}
                      className="p-2 hover:bg-[#1B4332]/10 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-[#666666]" />
                    </button>
                    <button
                      className="p-2 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => { setSelectedProduct(null); setIsEditing(false); }}
        size="xl"
      >
        {selectedProduct && (
          <ProductForm
            product={selectedProduct}
            isEditing={isEditing}
            onClose={() => { setSelectedProduct(null); setIsEditing(false); }}
          />
        )}
      </Modal>
    </div>
  );
}

function ProductForm({ product, isEditing, onClose }: { product: Product; isEditing: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    ...product,
    images: product.images.join('\n'),
    tags: product.tags.join(', '),
    badges: product.badges.join(', '),
    sizeOptions: product.sizeOptions?.join(', ') || '',
    colorOptions: product.colorOptions?.join(', ') || '',
  });

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Save product:', formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#2D2D2D]">
          {isEditing ? 'Edit Product' : 'Product Details'}
        </h2>
        {isEditing && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] disabled:bg-[#F8F6F3] disabled:text-[#666666]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Name (Bengali)</label>
            <input
              type="text"
              value={formData.nameBn}
              onChange={(e) => handleChange('nameBn', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] disabled:bg-[#F8F6F3] disabled:text-[#666666]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', parseInt(e.target.value))}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] disabled:bg-[#F8F6F3] disabled:text-[#666666]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Sale Price</label>
              <input
                type="number"
                value={formData.salePrice || ''}
                onChange={(e) => handleChange('salePrice', e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] disabled:bg-[#F8F6F3] disabled:text-[#666666]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange('stock', parseInt(e.target.value))}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] disabled:bg-[#F8F6F3] disabled:text-[#666666]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] disabled:bg-[#F8F6F3] disabled:text-[#666666]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] disabled:bg-[#F8F6F3] disabled:text-[#666666]"
            >
              <optgroup label="Main Categories">
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </optgroup>
              {Object.entries(subcategories).map(([parentSlug, subs]) => (
                <optgroup key={parentSlug} label={`${parentSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}>
                  {subs.map(sub => (
                    <option key={sub.id} value={sub.slug}>{sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={!isEditing}
              rows={4}
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] disabled:bg-[#F8F6F3] disabled:text-[#666666] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Image URLs (one per line)</label>
            <textarea
              value={formData.images}
              onChange={(e) => handleChange('images', e.target.value)}
              disabled={!isEditing}
              rows={3}
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] disabled:bg-[#F8F6F3] disabled:text-[#666666] resize-none font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Sizes (comma separated)</label>
              <input
                type="text"
                value={formData.sizeOptions}
                onChange={(e) => handleChange('sizeOptions', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] disabled:bg-[#F8F6F3] disabled:text-[#666666]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Colors (comma separated)</label>
              <input
                type="text"
                value={formData.colorOptions}
                onChange={(e) => handleChange('colorOptions', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] disabled:bg-[#F8F6F3] disabled:text-[#666666]"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-4 h-4 accent-[#1B4332]"
                />
                <span className="text-sm text-[#2D2D2D]">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleChange('isFeatured', e.target.checked)}
                  className="w-4 h-4 accent-[#1B4332]"
                />
                <span className="text-sm text-[#2D2D2D]">Featured</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Images</label>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {product.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt=""
              className="w-24 h-24 object-cover rounded border border-[#D4C4B5]"
            />
          ))}
        </div>
      </div>
    </form>
  );
}
