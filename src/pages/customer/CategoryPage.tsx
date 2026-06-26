import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import Modal from '../../components/ui/Modal';
import ProductDetail from '../../components/product/ProductDetail';
import EmptyCategoryModal from '../../components/category/EmptyCategoryModal';
import { Category, Product, SortOption } from '../../types';
import { fetchProductsByCategory } from '../../lib/productService';
import { findCategoryBySlug, getSubcategoriesForParent, getTopLevelCategories } from '../../lib/categoryService';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcats, setSubcats] = useState<Category[]>([]);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [emptyModalOpen, setEmptyModalOpen] = useState(false);

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      setLoading(true);
      try {
        const [cat, subs, products, topLevel] = await Promise.all([
          findCategoryBySlug(slug),
          getSubcategoriesForParent(slug),
          fetchProductsByCategory(slug),
          getTopLevelCategories(),
        ]);

        const isTopLevel = topLevel.some((c) => c.slug === slug);
        setCategory(cat ?? (isTopLevel ? topLevel.find((c) => c.slug === slug) ?? null : null));
        setSubcats(subs);
        setRawProducts(products);

        if (products.length === 0) {
          setEmptyModalOpen(true);
        }
      } catch {
        setRawProducts([]);
        setEmptyModalOpen(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    rawProducts.forEach((p) => p.sizeOptions?.forEach((s) => sizes.add(s)));
    return Array.from(sizes);
  }, [rawProducts]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    rawProducts.forEach((p) => p.colorOptions?.forEach((c) => colors.add(c)));
    return Array.from(colors);
  }, [rawProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = [...rawProducts];

    if (priceMin !== null) filtered = filtered.filter((p) => (p.salePrice ?? p.price) >= priceMin);
    if (priceMax !== null) filtered = filtered.filter((p) => (p.salePrice ?? p.price) <= priceMax);
    if (selectedBadges.length > 0) filtered = filtered.filter((p) => p.badges.some((b) => selectedBadges.includes(b)));
    if (selectedSizes.length > 0) filtered = filtered.filter((p) => p.sizeOptions?.some((s) => selectedSizes.includes(s)));
    if (selectedColors.length > 0) filtered = filtered.filter((p) => p.colorOptions?.some((c) => selectedColors.includes(c)));

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low-high':
        filtered.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price-high-low':
        filtered.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return filtered;
  }, [rawProducts, sortBy, priceMin, priceMax, selectedBadges, selectedSizes, selectedColors]);

  const clearFilters = () => {
    setPriceMin(null);
    setPriceMax(null);
    setSelectedBadges([]);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const hasActiveFilters =
    priceMin !== null || priceMax !== null || selectedBadges.length > 0 ||
    selectedSizes.length > 0 || selectedColors.length > 0;

  const isCategoryEmpty = !loading && rawProducts.length === 0;

  if (!loading && !category && subcats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#2D2D2D] mb-4">Category not found</h1>
          <Link to="/" className="text-[#1B4332] hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const displayCategory = category || (subcats[0] ? { name: subcats[0].name, nameBn: subcats[0].nameBn } : { name: 'Products', nameBn: '' });

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <div className="bg-[#1B4332] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-serif font-semibold mb-2">
            {displayCategory?.name || 'Products'}
          </motion.h1>
          {displayCategory?.nameBn && <p className="text-white/70">{displayCategory.nameBn}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {subcats.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              <Link to={`/category/${slug}`} className="px-4 py-2 text-sm rounded-sm bg-[#1B4332] text-white">All {category?.name || 'Products'}</Link>
              {subcats.map((subcat) => (
                <Link key={subcat.slug} to={`/category/${subcat.slug}`} className="px-4 py-2 text-sm rounded-sm border border-[#D4C4B5] text-[#2D2D2D] hover:border-[#1B4332] hover:text-[#1B4332]">
                  {subcat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!isCategoryEmpty && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button onClick={() => setFiltersOpen(true)} className="flex items-center gap-2 px-4 py-2 border border-[#D4C4B5] rounded-sm hover:bg-white">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm text-[#C2704A] hover:underline">Clear all</button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#666666]">{filteredProducts.length} products</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="appearance-none pl-4 pr-10 py-2 border border-[#D4C4B5] rounded-sm bg-white text-sm">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#666666]">No products match your filters.</p>
                <button onClick={clearFilters} className="mt-4 text-[#1B4332] hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="text-center py-16 text-[#666666]">Loading products...</div>
        )}
      </div>

      <EmptyCategoryModal
        isOpen={emptyModalOpen && isCategoryEmpty}
        onClose={() => setEmptyModalOpen(false)}
        categoryName={displayCategory?.name || 'This category'}
        categoryNameBn={displayCategory?.nameBn}
      />

      <Modal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} size="md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button onClick={() => setFiltersOpen(false)} className="p-2 hover:bg-[#F5F0E8] rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="flex gap-4">
                <input type="number" value={priceMin ?? ''} onChange={(e) => setPriceMin(e.target.value ? parseInt(e.target.value) : null)} placeholder="Min" className="flex-1 px-3 py-2 border rounded-sm" />
                <input type="number" value={priceMax ?? ''} onChange={(e) => setPriceMax(e.target.value ? parseInt(e.target.value) : null)} placeholder="Max" className="flex-1 px-3 py-2 border rounded-sm" />
              </div>
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <button onClick={clearFilters} className="flex-1 py-3 border rounded-sm">Clear All</button>
            <button onClick={() => setFiltersOpen(false)} className="flex-1 py-3 bg-[#1B4332] text-white rounded-sm">Apply</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} size="xl">
        {selectedProduct && <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </Modal>
    </div>
  );
}
