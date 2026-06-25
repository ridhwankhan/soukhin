import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../../config';

export default function WhatsAppButton() {
  const phoneNumber = WHATSAPP_NUMBER || '880XXXXXXXXXX';

  const handleClick = () => {
    if (!WHATSAPP_NUMBER) {
      alert('WhatsApp number not configured. Please add your number in src/config/site.ts');
      return;
    }
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 p-4 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" fill="white" />
      <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />
      <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full" />
    </motion.button>
  );
}
