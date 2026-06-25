import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How do I place an order?',
    a: 'Browse our products, add items to your cart, and proceed to checkout. Fill in your shipping details, select your preferred delivery area and payment method, and confirm your order. You will receive an order confirmation via SMS or WhatsApp.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept bKash, Nagad, Rocket, Cash on Delivery (COD), Bank Transfer, and Card payments. Payment gateway integration for card payments is coming soon.',
  },
  {
    q: 'How much does delivery cost?',
    a: 'Delivery inside Dhaka is ৳60. Outside Dhaka is ৳120. Store pickup is free. Orders over ৳2000 qualify for free delivery within Dhaka.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Inside Dhaka: 1-2 business days. Outside Dhaka: 3-5 business days. Store pickup is available same day after order confirmation.',
  },
  {
    q: 'Can I return or exchange products?',
    a: 'Yes! We accept returns and exchanges within 7 days of delivery for clothing items in original condition. Food items are non-returnable. Please see our Return & Exchange policy for details.',
  },
  {
    q: 'How do I track my order?',
    a: 'After your order is confirmed, you will receive updates via SMS or WhatsApp. You can also contact us directly for order status.',
  },
  {
    q: 'Are food items fresh?',
    a: 'Yes! Our homemade food items are prepared fresh. Pre-order is recommended for certain items. Frozen items should be stored properly on arrival.',
  },
  {
    q: 'Do you offer gift wrapping?',
    a: 'Yes, we offer premium gift wrapping for an additional charge. Select the gift wrap option during checkout.',
  },
  {
    q: 'Can I customize a gift hamper?',
    a: 'For custom gift hampers, contact us via WhatsApp or call. We will help you create the perfect gift for any occasion.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently we only deliver within Bangladesh. International shipping will be available soon.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <div className="bg-[#1B4332] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-semibold mb-4"
          >
            Frequently Asked Questions
          </motion.h1>
          <p className="text-white/70">Find answers to common questions</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-sm shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F8F6F3] transition-colors"
              >
                <span className="font-medium text-[#2D2D2D] pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#666666] flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-[#666666] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[#666666] mb-4">Can't find your answer?</p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-[#1B4332] text-white rounded-sm font-medium hover:bg-[#163828] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
