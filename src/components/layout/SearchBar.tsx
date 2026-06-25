import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchProducts } from '../../data';
import { Product } from '../../types';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      setResults(searchProducts(query).slice(0, 6));
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
          >
            <div className="bg-white shadow-2xl overflow-hidden">
              {/* Input */}
              <div className="flex items-center border-b border-[#E2D9CF]">
                <Search className="w-[18px] h-[18px] text-[#9A9A9A] ml-4 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search products, categories…"
                  className="flex-1 px-3 py-4 text-[#1A1A1A] text-sm placeholder-[#ABABAB] focus:outline-none bg-transparent"
                  autoComplete="off"
                />
                <button
                  onClick={onClose}
                  className="p-2 mr-2 text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9A7535]">
                    Products
                  </p>
                  <ul>
                    {results.map(product => (
                      <li key={product.id}>
                        <Link
                          to={`/category/${product.category}`}
                          onClick={() => { onClose(); setQuery(''); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#F9F7F4] transition-colors group"
                        >
                          <div className="w-10 h-10 flex-shrink-0 overflow-hidden bg-[#F5F0E8]">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1A1A1A] line-clamp-1">{product.name}</p>
                            <p className="text-xs text-[#9A9A9A] capitalize">{product.category.replace(/-/g, ' ')}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-semibold text-[#1B4332]">
                              ৳{(product.salePrice ?? product.price).toLocaleString()}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#C0B8B0] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {query.length >= 2 && results.length === 0 && (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-[#9A9A9A]">No results for <span className="font-medium text-[#4A4A4A]">"{query}"</span></p>
                </div>
              )}

              {query.length < 2 && (
                <div className="px-4 py-4">
                  <p className="text-xs text-[#ABABAB]">Type at least 2 characters to search</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
