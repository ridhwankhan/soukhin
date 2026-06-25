import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG, WHATSAPP_NUMBER } from '../../config';
import Input from '../../components/ui/Input';

const contactInfo = [
  { icon: Phone, label: 'Phone', value: '+880 XXX XXX XXXX', href: 'tel:+880XXXXXXXXX' },
  { icon: Mail, label: 'Email', value: 'hello@soukhin.com', href: 'mailto:hello@soukhin.com' },
  { icon: MapPin, label: 'Location', value: 'Dhaka, Bangladesh', href: null },
  { icon: MessageCircle, label: 'WhatsApp', value: 'Message us anytime', href: WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : null },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F9F7F4] border-b border-[#E2D9CF] py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-[#9A9A9A] mb-5">
            <Link to="/" className="hover:text-[#1B4332] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#4A4A4A]">Contact</span>
          </nav>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7535] mb-3">Get in Touch</p>
            <h1 className="font-serif text-4xl md:text-5xl font-medium text-[#1A1A1A] tracking-tight">
              We'd love to hear from you
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-14 h-14 bg-[#F0FAF4] flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-7 h-7 text-[#1B4332]" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-[#1A1A1A] mb-2">Message sent!</h2>
            <p className="text-[#7A7A7A] text-sm mb-8">Thank you for reaching out. We'll get back to you within 24 hours.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 border border-[#1B4332] text-sm font-medium text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-5 gap-10">
            {/* Form */}
            <div className="md:col-span-3">
              <h2 className="text-base font-semibold text-[#1A1A1A] mb-6">Send a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
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
                  <label className="block text-xs font-semibold text-[#4A4A4A] uppercase tracking-wide mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E2D9CF] focus:outline-none focus:border-[#1B4332] resize-none text-sm text-[#1A1A1A] bg-white transition-colors"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#1B4332] text-white text-sm font-medium hover:bg-[#163828] transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Info sidebar */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-base font-semibold text-[#1A1A1A] mb-5">Contact information</h2>
                <ul className="space-y-4">
                  {contactInfo.map(({ icon: Icon, label, value, href }) => (
                    <li key={label} className="flex items-start gap-3">
                      <div className="w-8 h-8 flex-shrink-0 bg-[#F9F7F4] flex items-center justify-center mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-[#1B4332]" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-xs text-[#9A9A9A] mb-0.5">{label}</p>
                        {href ? (
                          <a href={href} className="text-sm text-[#1A1A1A] hover:text-[#1B4332] transition-colors">{value}</a>
                        ) : (
                          <p className="text-sm text-[#1A1A1A]">{value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#1B4332] p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <Clock className="w-4 h-4 text-[#9A7535]" />
                  <h3 className="text-sm font-semibold text-white">Business Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Saturday – Thursday</span>
                    <span className="text-white">10 AM – 8 PM</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Friday</span>
                    <span className="text-white">3 PM – 8 PM</span>
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
