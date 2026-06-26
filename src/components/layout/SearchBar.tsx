import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { searchProducts } from '../../lib/productService';
import { useDebounce } from '../../hooks/useDebounce';
import { Product } from '../../types';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 3) {
      searchProducts(debouncedQuery)
        .then((searchResults) => setResults(searchResults.slice(0, 6)))
        .catch(() => setResults([]));
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      onClose();
      setQuery('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-elevated rounded-lg shadow-xl overflow-hidden">
              <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-secondary" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-12 py-4 text-lg border-0 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-surface rounded-full"
                >
                  <X className="w-5 h-5 text-ink-secondary" />
                </button>
              </form>

              {results.length > 0 && (
                <div className="border-t border-line p-4">
                  <p className="text-xs text-ink-secondary mb-3">Suggestions</p>
                  <div className="space-y-2">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => { onClose(); setQuery(''); }}
                        className="flex items-center gap-3 p-2 hover:bg-surface rounded-sm transition-colors"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-sm"
                        />
                        <div>
                          <p className="font-medium text-ink text-sm">{product.name}</p>
                          <p className="text-xs text-ink-secondary">{product.category.replace('-', ' ')}</p>
                        </div>
                        <span className="ml-auto text-accent font-medium">
                          ৳{(product.salePrice ?? product.price).toLocaleString()}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {debouncedQuery.length >= 3 && results.length === 0 && (
                <div className="border-t border-line p-4 text-center text-ink-secondary">
                  No products found for "{debouncedQuery}"
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
