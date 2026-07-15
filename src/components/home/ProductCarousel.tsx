import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../product/ProductCard';

interface ProductCarouselProps {
  title: string;
  subtitle: string;
  products: Product[];
  viewAllHref?: string;
  accent?: 'default' | 'hot';
}

export default function ProductCarousel({
  title,
  subtitle,
  products,
  viewAllHref,
  accent = 'default',
}: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (dir: -1 | 1) => {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section className={`py-14 md:py-20 ${accent === 'hot' ? 'bg-accent/5' : 'bg-elevated'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-ink mb-2">{title}</h2>
            <p className="text-ink-secondary">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {viewAllHref && (
              <Link to={viewAllHref} className="hidden sm:inline text-sm text-accent font-medium hover:underline mr-2">
                View all
              </Link>
            )}
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="p-2 border border-line rounded-full hover:bg-canvas transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="p-2 border border-line rounded-full hover:bg-canvas transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin"
          style={{ scrollbarWidth: 'thin' }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-none w-[72vw] sm:w-[280px] md:w-[300px] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
