import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Mail } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_MAILTO, WHATSAPP_URL } from '../../config';

export default function SupportFab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-56 rounded-lg border border-line bg-elevated shadow-xl overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-line">
            <p className="text-sm font-medium text-ink">Need help?</p>
            <p className="text-xs text-ink-secondary mt-0.5">We usually reply within a few hours.</p>
          </div>
          <div className="p-2 space-y-1">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-ink hover:bg-surface transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 fill-white" />
              </span>
              WhatsApp
            </a>
            <a
              href={CONTACT_MAILTO}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-ink hover:bg-surface transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-accent text-accent-fg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4" />
              </span>
              Email {CONTACT_EMAIL}
            </a>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-ink hover:bg-surface transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-muted text-ink flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4" />
              </span>
              Contact form
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close support menu' : 'Open support menu'}
        className="flex items-center justify-center w-12 h-12 bg-accent text-accent-fg shadow-lg hover:bg-accent-hover hover:shadow-xl hover:scale-[1.04] active:scale-[0.98] transition-all duration-200 rounded-full"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}
