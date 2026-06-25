import { MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../../config';

export default function WhatsAppButton() {
  if (!WHATSAPP_NUMBER) return null;

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-[1.04] transition-all duration-200"
    >
      <MessageCircle className="w-5 h-5 fill-white" />
    </a>
  );
}
