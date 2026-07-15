import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type NewReleaseSlide = {
  image: string;
  title: string;
  subtitle?: string;
  link?: string;
};

interface NewReleasesSlideshowProps {
  slides: NewReleaseSlide[];
}

export default function NewReleasesSlideshow({ slides }: NewReleasesSlideshowProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const current = slides[index];

  const body = (
    <div className="relative h-[42vh] md:h-[52vh] overflow-hidden rounded-lg">
      <img src={current.image} alt={current.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-accent text-white text-xs font-bold tracking-widest uppercase rounded-sm shadow">
        New
      </span>
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
        <h3 className="text-2xl md:text-4xl font-serif font-semibold mb-2">{current.title}</h3>
        {current.subtitle && <p className="text-white/85 text-sm md:text-lg max-w-2xl">{current.subtitle}</p>}
      </div>
    </div>
  );

  return (
    <section className="py-14 md:py-20 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-ink mb-2">New Releases</h2>
          <p className="text-ink-secondary">Fresh launches and photography from Shoukhin</p>
        </div>

        <div className="relative">
          {current.link ? (
            <Link to={current.link} className="block group">
              {body}
            </Link>
          ) : (
            body
          )}

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/55 rounded-full text-white"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((prev) => (prev + 1) % slides.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/55 rounded-full text-white"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
