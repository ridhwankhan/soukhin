import { useRef, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { createPotentialCustomer } from '../../lib/potentialCustomerService';
import { parseSupabaseError } from '../../lib/parseSupabaseError';
import { uploadLeadImages } from '../../lib/imageUploadService';
import Button from '../../components/ui/Button';
import ImageUploadField, { ImageUploadFieldHandle } from './ImageUploadField';

interface PotentialCustomerFormProps {
  onSuccess: (name: string) => void;
  onCancel: () => void;
}

export default function PotentialCustomerForm({ onSuccess, onCancel }: PotentialCustomerFormProps) {
  const imageRef = useRef<ImageUploadFieldHandle>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [interestSummary, setInterestSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    const hasContact = Boolean(phone.trim() || email.trim() || socialLink.trim());
    const hasImages = imageUrls.length > 0 || imageRef.current?.hasPending();
    if (!hasContact && !hasImages) {
      setError('Add at least one contact (phone, email, social) or a reference image.');
      return;
    }

    setSaving(true);
    try {
      let images = [...imageUrls];
      if (imageRef.current?.hasPending()) {
        const uploaded = await imageRef.current.uploadPending('new');
        images = [...images, ...uploaded];
      }

      const result = await createPotentialCustomer({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        socialLink: socialLink.trim() || undefined,
        interestSummary: interestSummary.trim() || undefined,
        notes: notes.trim() || undefined,
        images,
      });
      onSuccess(result.name);
    } catch (e) {
      setError(parseSupabaseError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      <p className="text-sm text-ink-secondary bg-amber-50 border border-amber-200 rounded p-3">
        Save someone who showed interest but is not ready to order yet. They appear under{' '}
        <strong>Potential Customers</strong> only — not in the orders list. Auto-removed after 10 days.
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="Customer name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Phone (optional)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="01XXXXXXXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="customer@email.com"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Social account link (optional)</label>
          <input
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="Facebook / Instagram / WhatsApp profile URL"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Reference images (optional)</label>
          <ImageUploadField
            ref={imageRef}
            urls={imageUrls}
            onUrlsChange={setImageUrls}
            onUpload={uploadLeadImages}
            uploading={uploading}
            onUploadingChange={setUploading}
            hint="Photos they sent (product refs, screenshots). JPEG/PNG auto-optimize to WebP; GIFs stay animated."
            buttonLabel="Add reference images (optional)"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">What are they interested in?</label>
          <textarea
            value={interestSummary}
            onChange={(e) => setInterestSummary(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="e.g. Red saree, size M panjabi, gift hamper..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-line rounded-sm"
            placeholder="How they found you, follow-up plan..."
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-line">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => void handleSubmit()} loading={saving || uploading}>
          <UserPlus className="w-4 h-4 mr-1" />
          Save Potential Customer
        </Button>
      </div>
    </div>
  );
}
