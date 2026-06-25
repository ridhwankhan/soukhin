import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import Modal from '../../components/ui/Modal';
import ProductDetail from '../../components/product/ProductDetail';
import { categories, subcategories, getProductsByCategory } from '../../data';
import { CategorySlug, Product, SortOption } from '../../types';

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
  const rawProducts = getProductsByCategory(slug as CategorySlug);

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    rawProducts.forEach(p => p.sizeOptions?.forEach(s => sizes.add(s)));
    return Array.from(sizes);
  }, [rawProducts]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    rawProducts.forEach(p => p.colorOptions?.forEach(c => colors.add(c)));
    return Array.from(colors);
  }, [rawProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = [...rawProducts];

    if (priceMin !== null) {
      filtered = filtered.filter(p => (p.salePrice ?? p.price) >= priceMin);
    }
    if (priceMax !== null) {
      filtered = filtered.filter(p => (p.salePrice ?? p.price) <= priceMax);
    }
    if (selectedBadges.length > 0) {
      filtered = filtered.filter(p => p.badges.some(b => selectedBadges.includes(b)));
    }
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => p.sizeOptions?.some(s => selectedSizes.includes(s)));
    }
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => p.colorOptions?.some(c => selectedColors.includes(c)));
    }

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

  const hasActiveFilters = priceMin !== null || priceMax !== null || selectedBadges.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0;

  if (!category && !subcats.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#2D2D2D] mb-4">Category not found</h1>
          <Link to="/" className="text-[#1B4332] hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const displayCategory = category || (subcats[0] ? { name: subcats[0].name, nameBn: subcats[0].nameBn } : null);

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      {/* Header */}
      <div className="bg-[#1B4332] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-serif font-semibold mb-2"
          >
            {displayCategory?.name || 'Products'}
          </motion.h1>
          {displayCategory?.nameBn && (
            <p className="text-white/70">{displayCategory.nameBn}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subcategories */}
        {subcats.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/category/${slug}`}
                className="px-4 py-2 text-sm rounded-sm bg-[#1B4332] text-white transition-colors"
              >
                All {category?.name || 'Products'}
              </Link>
              {subcats.map((subcat) => (
                <Link
                  key={subcat.slug}
                  to={`/category/${subcat.slug}`}
                  className="px-4 py-2 text-sm rounded-sm border border-[#D4C4B5] text-[#2D2D2D] hover:border-[#1B4332] hover:text-[#1B4332] transition-colors"
                >
                  {subcat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-[#D4C4B5] rounded-sm hover:bg-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-[#1B4332] text-white text-xs rounded-full flex items-center justify-center">
                  {selectedBadges.length + selectedSizes.length + selectedColors.length + (priceMin !== null ? 1 : 0) + (priceMax !== null ? 1 : 0)}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-[#C2704A] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#666666]">{filteredProducts.length} products</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-2 border border-[#D4C4B5] rounded-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666]" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#666666]">No products found with current filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-[#1B4332] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Filters Modal */}
      <Modal
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#2D2D2D]">Filters</h2>
            <button
              onClick={() => setFiltersOpen(false)}
              className="p-2 hover:bg-[#F5F0E8] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Price Range */}
            <div>
              <h3 className="font-medium text-[#2D2D2D] mb-3">Price Range</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-[#666666]">Min</label>
                  <input
                    type="number"
                    value={priceMin ?? ''}
                    onChange={(e) => setPriceMin(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="0"
                    className="w-full mt-1 px-3 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>
                <span className="mt-5">-</span>
                <div className="flex-1">
                  <label className="text-xs text-[#666666]">Max</label>
                  <input
                    type="number"
                    value={priceMax ?? ''}
                    onChange={(e) => setPriceMax(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="10000+"
                    className="w-full mt-1 px-3 py-2 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h3 className="font-medium text-[#2D2D2D] mb-3">Product Type</h3>
              <div className="flex flex-wrap gap-2">
                {['new', 'eid-collection', 'best-seller', 'pre-order'].map(badge => (
                  <button
                    key={badge}
                    onClick={() => {
                      setSelectedBadges(prev =>
                        prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
                      );
                    }}
                    className={`px-3 py-1.5 text-sm rounded-sm border transition-colors ${
                      selectedBadges.includes(badge)
                        ? 'border-[#1B4332] bg-[#1B4332] text-white'
                        : 'border-[#D4C4B5] hover:border-[#1B4332]'
                    }`}
                  >
                    {badge.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            {allSizes.length > 0 && (
              <div>
                <h3 className="font-medium text-[#2D2D2D] mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSizes(prev =>
                          prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                        );
                      }}
                      className={`px-4 py-2 text-sm rounded-sm border transition-colors ${
                        selectedSizes.includes(size)
                          ? 'border-[#1B4332] bg-[#1B4332] text-white'
                          : 'border-[#D4C4B5] hover:border-[#1B4332]'
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
              <div>
                <h3 className="font-medium text-[#2D2D2D] mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {allColors.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColors(prev =>
                          prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                        );
                      }}
                      className={`px-4 py-2 text-sm rounded-sm border transition-colors ${
                        selectedColors.includes(color)
                          ? 'border-[#1B4332] bg-[#1B4332] text-white'
                          : 'border-[#D4C4B5] hover:border-[#1B4332]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={clearFilters}
              className="flex-1 py-3 border border-[#D4C4B5] rounded-sm hover:bg-[#F5F0E8] transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setFiltersOpen(false)}
              className="flex-1 py-3 bg-[#1B4332] text-white rounded-sm hover:bg-[#163828] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>

      {/* Product Detail Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        size="xl"
      >
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </Modal>
    </div>
  );
}
