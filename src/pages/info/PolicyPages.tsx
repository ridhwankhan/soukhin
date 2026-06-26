import { motion } from 'framer-motion';
import { CONTACT_EMAIL } from '../../config';

export function ReturnExchangePage() {
  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <div className="bg-[#1B4332] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-serif font-semibold"
          >
            Return & Exchange Policy
          </motion.h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div className="prose prose-sm max-w-none text-[#666666]">
            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">Our Commitment</h2>
            <p className="mb-6">
              At Soukhin, we want you to be completely satisfied with your purchase. If you're not happy with your order, we're here to help with our Return & Exchange policy.
            </p>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">Clothing & Gift Items</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Return or exchange within <strong>7 days</strong> of delivery</li>
              <li>Items must be unworn, unwashed, with all tags attached</li>
              <li>Original packaging should be intact</li>
              <li>Return shipping is the responsibility of the customer</li>
              <li>Refunds will be processed within 5-7 business days after we receive the item</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">Food Items</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Food items cannot be returned due to safety regulations</li>
              <li>If you receive a damaged or incorrect item, contact us immediately</li>
              <li>We will replace or refund defective food products</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">Non-Returnable Items</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Items marked as "Final Sale"</li>
              <li>Customized or personalized products</li>
              <li>Intimate wear</li>
              <li>Opened food items</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">How to Request a Return</h2>
            <p className="mb-4">Contact us via email or WhatsApp within 7 days of delivery:</p>
            <ol className="list-decimal pl-6 mb-6 space-y-2">
              <li>Provide your order number</li>
              <li>Explain the reason for return/exchange</li>
              <li>Wait for confirmation and return instructions</li>
              <li>Ship the item or arrange pickup</li>
            </ol>

            <p className="mt-8">
              For any questions about returns, please contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1B4332] font-medium hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <div className="bg-[#1B4332] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-serif font-semibold"
          >
            Privacy Policy
          </motion.h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div className="prose prose-sm max-w-none text-[#666666]">
            <p className="mb-6">
              Last updated: June 2024
            </p>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">Information We Collect</h2>
            <p className="mb-4">When you place an order, we collect:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Name, phone number, and delivery address</li>
              <li>Email address (if provided)</li>
              <li>Payment information (processed securely by our payment partners)</li>
              <li>Order history and preferences</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Process and deliver your orders</li>
              <li>Communicate about your orders via SMS or WhatsApp</li>
              <li>Send promotional content (with your consent)</li>
              <li>Improve our products and services</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">Data Security</h2>
            <p className="mb-6">
              We implement appropriate security measures to protect your personal information. Payment data is processed through secure, PCI-compliant payment gateways.
            </p>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">Your Rights</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Request access to your data</li>
              <li>Request correction or deletion of your data</li>
              <li>Opt out of marketing communications</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">Contact Us</h2>
            <p>
              For privacy-related inquiries, contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1B4332] font-medium hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <div className="bg-[#1B4332] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-serif font-semibold"
          >
            Terms & Conditions
          </motion.h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div className="prose prose-sm max-w-none text-[#666666]">
            <p className="mb-6">
              Last updated: June 2024
            </p>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">Acceptance of Terms</h2>
            <p className="mb-6">
              By accessing and using the Soukhin website, you accept and agree to comply with these Terms & Conditions.
            </p>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">Products & Pricing</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Product images are for illustration; actual products may vary slightly</li>
              <li>Prices are in Bangladeshi Taka (BDT) and are subject to change</li>
              <li>We reserve the right to modify or discontinue any product</li>
              <li>Product availability is subject to change</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">Orders & Payment</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Orders are confirmed after payment verification</li>
              <li>We may cancel orders due to product unavailability, pricing errors, or suspected fraud</li>
              <li>Cash on Delivery orders require valid phone verification</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">Delivery</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Delivery times are estimates and may vary</li>
              <li>Risk of loss passes to customer upon delivery</li>
              <li>Signature may be required for certain orders</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">Intellectual Property</h2>
            <p className="mb-6">
              All content on this website, including logos, images, and text, is property of Soukhin and protected by intellectual property laws.
            </p>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">Limitation of Liability</h2>
            <p className="mb-6">
              Soukhin is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services.
            </p>

            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4 mt-8">Governing Law</h2>
            <p>
              These terms are governed by the laws of Bangladesh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
