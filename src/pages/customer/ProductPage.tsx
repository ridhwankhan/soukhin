import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductDetail from '../../components/product/ProductDetail';
import { fetchProductById } from '../../lib/productService';
import { Product } from '../../types';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchProductById(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-secondary">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-semibold text-ink mb-2">Product not found</h1>
        <p className="text-ink-secondary text-sm mb-6">This item may have been removed or is no longer available.</p>
        <Link to="/" className="btn-primary inline-flex">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elevated">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-accent mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-elevated rounded-lg border border-line shadow-sm">
          <ProductDetail product={product} />
        </div>
      </div>
    </div>
  );
}
