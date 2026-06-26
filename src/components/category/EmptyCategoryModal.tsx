import { Link } from 'react-router-dom';
import { Package, Sparkles } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface EmptyCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  categoryNameBn?: string;
}

export default function EmptyCategoryModal({
  isOpen,
  onClose,
  categoryName,
  categoryNameBn,
}: EmptyCategoryModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-[#1B4332]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Package className="w-8 h-8 text-[#1B4332]" />
        </div>
        <h2 className="text-xl font-serif font-semibold text-[#2D2D2D] mb-2">
          {categoryName} — Coming Soon
        </h2>
        {categoryNameBn && (
          <p className="text-sm text-[#B8860B] mb-3">{categoryNameBn}</p>
        )}
        <p className="text-[#666666] text-sm leading-relaxed mb-6">
          We are curating beautiful products for this category. Check back soon — new items will be added regularly.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-[#999999] mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Fresh collections on the way</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" onClick={onClose}>
            <Button className="w-full sm:w-auto">Browse Other Categories</Button>
          </Link>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
