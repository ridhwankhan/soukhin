import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react';
import { BRAND_CONFIG, WHATSAPP_NUMBER, SITE_SETTINGS } from '../../config';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <div className="bg-[#1B4332] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-semibold mb-4"
          >
            Contact Us
          </motion.h1>
          <p className="text-white/70">We'd love to hear from you</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-4">Message Sent!</h2>
            <p className="text-[#666666]">Thank you for reaching out. We'll get back to you within 24 hours.</p>
            <Button onClick={() => setSubmitted(false)} className="mt-6">Send Another Message</Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="bg-white rounded-lg p-8 shadow-sm mb-6">
                <h2 className="text-xl font-semibold text-[#2D2D2D] mb-6">Get in Touch</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Input
                    label="Subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#D4C4B5] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <Button type="submit" className="w-full">Send Message</Button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-[#2D2D2D] mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#1B4332]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-[#1B4332]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2D2D2D]">Phone</h3>
                      <p className="text-sm text-[#666666]">+880 XXX XXX XXXX</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#1B4332]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#1B4332]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2D2D2D]">Email</h3>
                      <p className="text-sm text-[#666666]">hello@soukhin.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#1B4332]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#1B4332]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2D2D2D]">Address</h3>
                      <p className="text-sm text-[#666666]">Dhaka, Bangladesh</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#25D366]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2D2D2D]">WhatsApp</h3>
                      <p className="text-sm text-[#666666]">Message us anytime</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1B4332] rounded-lg p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6" />
                  <h3 className="font-semibold text-lg">Business Hours</h3>
                </div>
                <div className="space-y-2 text-sm text-white/80">
                  <div className="flex justify-between">
                    <span>Saturday - Thursday</span>
                    <span>10:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Friday</span>
                    <span>3:00 PM - 8:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
