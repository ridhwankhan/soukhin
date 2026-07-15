import { useRef, useState } from 'react';
import { Save, UserPlus } from 'lucide-react';
import {
  createPotentialCustomer,
  updatePotentialCustomer,
  PotentialCustomer,
} from '../../lib/potentialCustomerService';
import { parseSupabaseError } from '../../lib/parseSupabaseError';
import { uploadLeadImages } from '../../lib/imageUploadService';
import { usePersistFormDraft } from '../../hooks/useAdminFormDraft';
import Button from '../../components/ui/Button';
import ImageUploadField, { ImageUploadFieldHandle } from './ImageUploadField';

interface PotentialCustomerFormProps {
  lead?: PotentialCustomer;
  onSuccess: (name: string) => void;
  onCancel: () => void;
}

export default function PotentialCustomerForm({ lead, onSuccess, onCancel }: PotentialCustomerFormProps) {
  const isEditing = Boolean(lead);
  const imageRef = useRef<ImageUploadFieldHandle>(null);
  const [name, setName] = useState(lead?.name ?? '');
  const [phone, setPhone] = useState(lead?.phone ?? '');
  const [email, setEmail] = useState(lead?.email ?? '');
  const [socialLink, setSocialLink] = useState(lead?.socialLink ?? '');
  const [interestSummary, setInterestSummary] = useState(lead?.interestSummary ?? '');
  const [notes, setNotes] = useState(lead?.notes ?? '');
  const [imageUrls, setImageUrls] = useState<string[]>(lead?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  type LeadDraft = {
    name: string;
    phone: string;
    email: string;
    socialLink: string;
    interestSummary: string;
    notes: string;
    imageUrls: string[];
  };

  const { clearDraft } = usePersistFormDraft<LeadDraft>(
    'potential_customer_new',
    () => ({ name, phone, email, socialLink, interestSummary, notes, imageUrls }),
    (draft) => {
      setName(draft.name);
      setPhone(draft.phone);
      setEmail(draft.email);
      setSocialLink(draft.socialLink);
      setInterestSummary(draft.interestSummary);
      setNotes(draft.notes);
      setImageUrls(draft.imageUrls);
    },
    [name, phone, email, socialLink, interestSummary, notes, imageUrls],
    !isEditing
  );

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
        const uploaded = await imageRef.current.uploadPending(lead?.id ?? 'new');
        images = [...images, ...uploaded];
      }

      const input = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        socialLink: socialLink.trim() || undefined,
        interestSummary: interestSummary.trim() || undefined,
        notes: notes.trim() || undefined,
        images,
      };

      const result = isEditing && lead
        ? await updatePotentialCustomer(lead.id, input)
        : await createPotentialCustomer(input);

      if (!isEditing) clearDraft();
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
        {isEditing
          ? 'Update this lead’s details. They stay under Potential Customers until the expiry date.'
          : 'Save someone who showed interest but is not ready to order yet. They appear under Potential Customers only — not in the orders list. Auto-removed after 10 days.'}
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
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-1" />
              Save Potential Customer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
