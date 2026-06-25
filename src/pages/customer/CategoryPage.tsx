import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ArrowLeft } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import Modal from '../../components/ui/Modal';
import ProductDetail from '../../components/product/ProductDetail';
import { categories, subcategories, getProductsByCategory } from '../../data';
import { CategorySlug, Product, SortOption } from '../../types';
import { useProducts } from '../../context/ProductContext';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = categories.find(c => c.slug === slug);
  const subcats = subcategories[slug as string] || [];
  const { products: allProducts } = useProducts();
  const categoryProductIds = useMemo(
    () => new Set(getProductsByCategory(slug as CategorySlug).map(p => p.id)),
    [slug]
  );
  const rawProducts = useMemo(
    () => allProducts.filter(p => categoryProductIds.has(p.id)),
    [allProducts, categoryProductIds]
  );

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const allSizes = useMemo(() => {
    const s = new Set<string>();
    rawProducts.forEach(p => p.sizeOptions?.forEach(size => s.add(size)));
    return Array.from(s);
  }, [rawProducts]);

  const allColors = useMemo(() => {
    const c = new Set<string>();
    rawProducts.forEach(p => p.colorOptions?.forEach(color => c.add(color)));
    return Array.from(c);
  }, [rawProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = [...rawProducts];
    if (priceMin !== null) filtered = filtered.filter(p => (p.salePrice ?? p.price) >= priceMin);
    if (priceMax !== null) filtered = filtered.filter(p => (p.salePrice ?? p.price) <= priceMax);
    if (selectedBadges.length > 0) filtered = filtered.filter(p => p.badges.some(b => selectedBadges.includes(b)));
    if (selectedSizes.length > 0) filtered = filtered.filter(p => p.sizeOptions?.some(s => selectedSizes.includes(s)));
    if (selectedColors.length > 0) filtered = filtered.filter(p => p.colorOptions?.some(c => selectedColors.includes(c)));

    switch (sortBy) {
      case 'newest': filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'price-low-high': filtered.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)); break;
      case 'price-high-low': filtered.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)); break;
      case 'popular': filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)); break;
    }
    return filtered;
  }, [rawProducts, sortBy, priceMin, priceMax, selectedBadges, selectedSizes, selectedColors]);

  const clearFilters = () => {
    setPriceMin(null); setPriceMax(null);
    setSelectedBadges([]); setSelectedSizes([]); setSelectedColors([]);
  };

  const activeFilterCount =
    selectedBadges.length + selectedSizes.length + selectedColors.length +
    (priceMin !== null ? 1 : 0) + (priceMax !== null ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const displayCategory = category || (subcats[0] ? { name: subcats[0].name, nameBn: subcats[0].nameBn } : null);

  if (!displayCategory && !rawProducts.length && !subcats.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#7A7A7A] mb-4">Category not found.</p>
          <Link to="/" className="text-[#1B4332] text-sm font-medium hover:underline flex items-center gap-1 justify-center">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Category Header */}
      <div className="bg-[#F9F7F4] border-b border-[#E2D9CF] py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-[#9A9A9A] mb-4">
            <Link to="/" className="hover:text-[#1B4332] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#4A4A4A]">{displayCategory?.name || 'Products'}</span>
          </nav>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#1A1A1A] tracking-tight">
            {displayCategory?.name || 'Products'}
          </h1>
          {displayCategory?.nameBn && (
            <p className="text-[#9A9A9A] font-bengali mt-1 text-sm">{displayCategory.nameBn}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Subcategory tabs */}
        {subcats.length > 0 && (
          <div className="mb-8 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-1 min-w-max">
              <Link
                to={`/category/${slug}`}
                className="px-4 py-2 text-sm font-medium bg-[#1B4332] text-white whitespace-nowrap"
              >
                All {category?.name}
              </Link>
              {subcats.map(subcat => (
                <Link
                  key={subcat.slug}
                  to={`/category/${subcat.slug}`}
                  className="px-4 py-2 text-sm font-medium border border-[#E2D9CF] text-[#4A4A4A] hover:border-[#1B4332] hover:text-[#1B4332] transition-colors whitespace-nowrap"
                >
                  {subcat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-[#E2D9CF]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-[#E2D9CF] text-sm font-medium text-[#4A4A4A] hover:border-[#1B4332] hover:text-[#1B4332] transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {hasActiveFilters && (
                <span className="w-4 h-4 bg-[#1B4332] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-[#B5603E] hover:underline font-medium">
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#9A9A9A]">{filteredProducts.length} products</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-3 pr-8 py-2 border border-[#E2D9CF] bg-white text-sm text-[#4A4A4A] focus:outline-none focus:border-[#1B4332] cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9A9A9A]" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[#9A9A9A] mb-4">No products match your current filters.</p>
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-[#1B4332] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
              >
                <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Filters Modal */}
      <Modal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} size="md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Filter Products</h2>
            <button
              onClick={() => setFiltersOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors"
              aria-label="Close filters"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="space-y-7 divide-y divide-[#F0EBE4]">
            {/* Price Range */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#9A7535] mb-4">Price Range (৳)</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={priceMin ?? ''}
                    onChange={e => setPriceMin(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Min"
                    className="input-field"
                  />
                </div>
                <span className="text-[#9A9A9A] text-sm">—</span>
                <div className="flex-1">
                  <input
                    type="number"
                    value={priceMax ?? ''}
                    onChange={e => setPriceMax(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Max"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#9A7535] mb-4">Type</h3>
              <div className="flex flex-wrap gap-2">
                {['new', 'eid-collection', 'best-seller', 'pre-order'].map(badge => (
                  <button
                    key={badge}
                    onClick={() => setSelectedBadges(prev =>
                      prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
                    )}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                      selectedBadges.includes(badge)
                        ? 'border-[#1B4332] bg-[#1B4332] text-white'
                        : 'border-[#E2D9CF] text-[#4A4A4A] hover:border-[#1B4332]'
                    }`}
                  >
                    {badge.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            {allSizes.length > 0 && (
              <div className="pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#9A7535] mb-4">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSizes(prev =>
                        prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                      )}
                      className={`min-w-[2.5rem] px-3 py-1.5 text-xs font-medium border transition-colors ${
                        selectedSizes.includes(size)
                          ? 'border-[#1B4332] bg-[#1B4332] text-white'
                          : 'border-[#E2D9CF] text-[#4A4A4A] hover:border-[#1B4332]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {allColors.length > 0 && (
              <div className="pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#9A7535] mb-4">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {allColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColors(prev =>
                        prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                      )}
                      className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                        selectedColors.includes(color)
                          ? 'border-[#1B4332] bg-[#1B4332] text-white'
                          : 'border-[#E2D9CF] text-[#4A4A4A] hover:border-[#1B4332]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={clearFilters}
              className="flex-1 py-3 border border-[#E2D9CF] text-sm font-medium text-[#4A4A4A] hover:bg-[#F9F7F4] transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setFiltersOpen(false)}
              className="flex-1 py-3 bg-[#1B4332] text-white text-sm font-medium hover:bg-[#163828] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>

      {/* Product Detail Modal */}
      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} size="xl">
        {selectedProduct && (
          <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
      </Modal>
    </div>
  );
}
