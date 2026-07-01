import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Upload, X, Loader2, Link2 } from 'lucide-react';

export interface ImageUploadFieldHandle {
  uploadPending: (folderId: string) => Promise<string[]>;
  hasPending: () => boolean;
}

interface ImageUploadFieldProps {
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
  onUpload: (files: File[], folderId: string) => Promise<string[]>;
  disabled?: boolean;
  hint?: string;
  buttonLabel?: string;
  allowUrl?: boolean;
  uploading?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
}

const ImageUploadField = forwardRef<ImageUploadFieldHandle, ImageUploadFieldProps>(
  ({ urls, onUrlsChange, onUpload, disabled, hint, buttonLabel = 'Add images', allowUrl = true, uploading, onUploadingChange }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [urlInput, setUrlInput] = useState('');
    const [urlError, setUrlError] = useState('');

    useImperativeHandle(ref, () => ({
      uploadPending: async (folderId: string) => {
        if (!pendingFiles.length) return [];
        onUploadingChange?.(true);
        try {
          const uploaded = await onUpload(pendingFiles, folderId);
          setPendingFiles([]);
          setPreviews([]);
          return uploaded;
        } finally {
          onUploadingChange?.(false);
        }
      },
      hasPending: () => pendingFiles.length > 0,
    }));

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;
      setPendingFiles((prev) => [...prev, ...files]);
      setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
      e.target.value = '';
    };

    const removePending = (index: number) => {
      setPendingFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeUrl = (index: number) => {
      onUrlsChange(urls.filter((_, i) => i !== index));
    };

    const addImageUrl = () => {
      setUrlError('');
      const trimmed = urlInput.trim();
      if (!trimmed) return;
      if (!/^https?:\/\/.+/i.test(trimmed)) {
        setUrlError('Paste a full link starting with http:// or https://');
        return;
      }
      if (urls.includes(trimmed)) {
        setUrlError('This link is already added.');
        return;
      }
      onUrlsChange([...urls, trimmed]);
      setUrlInput('');
    };

    return (
      <div>
        {hint && <p className="text-xs text-ink-secondary mb-3">{hint}</p>}

        <div className="flex flex-wrap gap-2 mb-3">
          {urls.map((url, i) => (
            <div key={`${url}-${i}`} className="relative w-20 h-20 rounded overflow-hidden border border-line">
              <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
              <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center truncate px-0.5">
                {url.startsWith('http') && !url.includes('supabase') ? 'URL' : 'File'}
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeUrl(i)}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {previews.map((url, i) => (
            <div key={url} className="relative w-20 h-20 rounded overflow-hidden border-2 border-dashed border-accent">
              <img src={url} alt="" className="w-full h-full object-cover opacity-80" />
              {pendingFiles[i]?.type === 'image/gif' && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                  GIF
                </span>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removePending(i)}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {!disabled && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-line rounded-sm w-full hover:border-accent hover:bg-canvas transition-colors text-sm text-ink-secondary"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {buttonLabel}
            </button>
            {allowUrl && (
              <div className="mt-3">
                <p className="text-xs text-ink-secondary mb-1.5">Or paste an image link (Google Drive, Imgur, CDN…)</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => { setUrlInput(e.target.value); setUrlError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full pl-9 pr-3 py-2 border border-line rounded-sm text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-3 py-2 text-sm border border-line rounded-sm hover:border-accent hover:text-accent whitespace-nowrap"
                  >
                    Add link
                  </button>
                </div>
                {urlError && <p className="text-xs text-red-600 mt-1">{urlError}</p>}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

ImageUploadField.displayName = 'ImageUploadField';

export default ImageUploadField;
