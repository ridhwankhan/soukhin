import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { PAYMENT_CONFIG, DELIVERY_CONFIG, SITE_SETTINGS } from '../../config';

export function PaymentSettingsPage() {
  const [config, setConfig] = useState(PAYMENT_CONFIG);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    console.log('Save payment config:', config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Payment Settings</h1>
          <p className="text-sm text-ink-secondary">Configure payment gateways</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2"
        >
          Settings saved successfully!
        </motion.div>
      )}

      <div className="bg-elevated rounded-lg shadow-sm p-6 space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Important</p>
            <p className="text-sm text-amber-700">
              These credentials are stored in config files. For production, use environment variables.
            </p>
          </div>
        </div>

        {/* bKash */}
        <div className="border-b border-line pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink">bKash</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.bkash.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, bkash: { ...prev.bkash, enabled: e.target.checked } }))}
                className="w-4 h-4 accent-[#1B4332]"
              />
              <span className="text-sm">Enabled</span>
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Merchant ID</label>
              <input
                type="text"
                value={config.bkash.merchantId}
                onChange={(e) => setConfig(prev => ({ ...prev, bkash: { ...prev.bkash, merchantId: e.target.value } }))}
                placeholder="Enter merchant ID"
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">API Key</label>
              <input
                type="password"
                value={config.bkash.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, bkash: { ...prev.bkash, apiKey: e.target.value } }))}
                placeholder="Enter API key"
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Nagad */}
        <div className="border-b border-line pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink">Nagad</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.nagad.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, nagad: { ...prev.nagad, enabled: e.target.checked } }))}
                className="w-4 h-4 accent-[#1B4332]"
              />
              <span className="text-sm">Enabled</span>
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Merchant ID</label>
              <input
                type="text"
                value={config.nagad.merchantId}
                onChange={(e) => setConfig(prev => ({ ...prev, nagad: { ...prev.nagad, merchantId: e.target.value } }))}
                placeholder="Enter merchant ID"
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">API Key</label>
              <input
                type="password"
                value={config.nagad.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, nagad: { ...prev.nagad, apiKey: e.target.value } }))}
                placeholder="Enter API key"
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Rocket */}
        <div className="border-b border-line pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink">Rocket</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.rocket.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, rocket: { ...prev.rocket, enabled: e.target.checked } }))}
                className="w-4 h-4 accent-[#1B4332]"
              />
              <span className="text-sm">Enabled</span>
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Merchant ID</label>
              <input
                type="text"
                value={config.rocket.merchantId}
                onChange={(e) => setConfig(prev => ({ ...prev, rocket: { ...prev.rocket, merchantId: e.target.value } }))}
                placeholder="Enter merchant ID"
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">API Key</label>
              <input
                type="password"
                value={config.rocket.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, rocket: { ...prev.rocket, apiKey: e.target.value } }))}
                placeholder="Enter API key"
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* COD & Bank Transfer */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink">Cash on Delivery</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.cod.enabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, cod: { enabled: e.target.checked } }))}
                  className="w-4 h-4 accent-[#1B4332]"
                />
                <span className="text-sm">Enabled</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink">Bank Transfer</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.bankTransfer.enabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, bankTransfer: { ...prev.bankTransfer, enabled: e.target.checked } }))}
                  className="w-4 h-4 accent-[#1B4332]"
                />
                <span className="text-sm">Enabled</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Account Details</label>
              <textarea
                value={config.bankTransfer.accountDetails}
                onChange={(e) => setConfig(prev => ({ ...prev, bankTransfer: { ...prev.bankTransfer, accountDetails: e.target.value } }))}
                rows={3}
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeliverySettingsPage() {
  const [config, setConfig] = useState(DELIVERY_CONFIG);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Delivery Settings</h1>
        <p className="text-sm text-ink-secondary">Configure delivery fees and options</p>
      </div>

      <div className="bg-elevated rounded-lg shadow-sm p-6 space-y-6">
        {/* Inside Dhaka */}
        <div className="border-b border-line pb-6">
          <h3 className="font-semibold text-ink mb-4">Inside Dhaka</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Delivery Fee (BDT)</label>
              <input
                type="number"
                value={config.insideDhaka.fee}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  insideDhaka: { ...prev.insideDhaka, fee: parseInt(e.target.value) }
                }))}
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Estimated Days</label>
              <input
                type="text"
                value={config.insideDhaka.estimatedDays}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  insideDhaka: { ...prev.insideDhaka, estimatedDays: e.target.value }
                }))}
                placeholder="1-2"
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Outside Dhaka */}
        <div className="border-b border-line pb-6">
          <h3 className="font-semibold text-ink mb-4">Outside Dhaka</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Delivery Fee (BDT)</label>
              <input
                type="number"
                value={config.outsideDhaka.fee}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  outsideDhaka: { ...prev.outsideDhaka, fee: parseInt(e.target.value) }
                }))}
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Estimated Days</label>
              <input
                type="text"
                value={config.outsideDhaka.estimatedDays}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  outsideDhaka: { ...prev.outsideDhaka, estimatedDays: e.target.value }
                }))}
                placeholder="3-5"
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Pickup */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink">Store Pickup</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.pickup.enabled}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  pickup: { ...prev.pickup, enabled: e.target.checked }
                }))}
                className="w-4 h-4 accent-[#1B4332]"
              />
              <span className="text-sm">Enabled</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Pickup Address</label>
            <textarea
              value={config.pickup.address}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                pickup: { ...prev.pickup, address: e.target.value }
              }))}
              rows={2}
              className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoreSettingsPage() {
  const [settings, setSettings] = useState(SITE_SETTINGS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Store Settings</h1>
        <p className="text-sm text-ink-secondary">General store configuration</p>
      </div>

      <div className="bg-elevated rounded-lg shadow-sm p-6 space-y-6">
        {/* Hero Section */}
        <div className="border-b border-line pb-6">
          <h3 className="font-semibold text-ink mb-4">Hero Section</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Title (English)</label>
              <input
                type="text"
                value={settings.hero.title}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  hero: { ...prev.hero, title: e.target.value }
                }))}
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Title (Bengali)</label>
              <input
                type="text"
                value={settings.hero.titleBn}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  hero: { ...prev.hero, titleBn: e.target.value }
                }))}
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Subtitle (English)</label>
              <input
                type="text"
                value={settings.hero.subtitle}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  hero: { ...prev.hero, subtitle: e.target.value }
                }))}
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Subtitle (Bengali)</label>
              <input
                type="text"
                value={settings.hero.subtitleBn}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  hero: { ...prev.hero, subtitleBn: e.target.value }
                }))}
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="border-b border-line pb-6">
          <h3 className="font-semibold text-ink mb-4">Announcement Bar</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Text (English)</label>
              <input
                type="text"
                value={settings.announcementBar}
                onChange={(e) => setSettings(prev => ({ ...prev, announcementBar: e.target.value }))}
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Text (Bengali)</label>
              <input
                type="text"
                value={settings.announcementBarBn}
                onChange={(e) => setSettings(prev => ({ ...prev, announcementBarBn: e.target.value }))}
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-semibold text-ink mb-4">Contact & Social</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                placeholder="880XXXXXXXXXX"
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Facebook Page URL</label>
              <input
                type="url"
                value={settings.facebookLink}
                onChange={(e) => setSettings(prev => ({ ...prev, facebookLink: e.target.value }))}
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Instagram URL</label>
              <input
                type="url"
                value={settings.instagramLink}
                onChange={(e) => setSettings(prev => ({ ...prev, instagramLink: e.target.value }))}
                className="w-full px-4 py-2 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        <Button>
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  );
}
