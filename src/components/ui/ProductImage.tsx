import { useState } from 'react';
import { ImageOff, Sparkles } from 'lucide-react';
import Button from './Button';
import { reportBrokenImage } from '../../lib/imageReportService';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  productId?: string;
  productName?: string;
}

export default function ProductImage({ src, alt, className = '', productId, productName }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState('');

  const handleReport = async () => {
    setReportError('');
    setReporting(true);
    try {
      await reportBrokenImage({
        imageUrl: src,
        productId,
        productName: productName ?? alt,
        pagePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
      });
      setReported(true);
    } catch {
      setReportError('Could not send report. Please try again.');
    } finally {
      setReporting(false);
    }
  };

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-200 rounded-lg ${className}`}
      >
        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
          <ImageOff className="w-8 h-8 text-amber-500" />
        </div>
        <p className="font-serif text-lg text-ink mb-1">Oops — image went missing!</p>
        <p className="text-sm text-ink-secondary mb-4 max-w-[220px]">
          This picture wandered off somewhere. Our team can bring it back.
        </p>
        {reported ? (
          <p className="text-sm text-accent font-medium flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Thanks! We&apos;ll fix it soon.
          </p>
        ) : (
          <>
            <Button size="sm" onClick={() => void handleReport()} loading={reporting}>
              Notify Soukhin team
            </Button>
            {reportError && <p className="text-xs text-red-600 mt-2">{reportError}</p>}
          </>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
