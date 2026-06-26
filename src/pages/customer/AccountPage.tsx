import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AccountPage() {
  const { user, profile, loading, updateProfile, signOut, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const result = await updateProfile(form);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess('Your profile has been updated.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-accent text-white py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold">My Account</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-elevated rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-line">
            <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-semibold text-ink">{profile?.name || user?.user_metadata?.name || 'Customer'}</p>
              <p className="text-sm text-ink-secondary flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-sm text-sm text-green-700">{success}</div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Delivery Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="House, road, area, landmark..."
              />
            </div>

            {profile && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-canvas rounded-sm text-sm">
                <div>
                  <p className="text-ink-secondary">Total Orders</p>
                  <p className="font-semibold text-accent">{profile.totalOrders}</p>
                </div>
                <div>
                  <p className="text-ink-secondary">Total Spent</p>
                  <p className="font-semibold text-accent">৳{profile.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/account/orders"><Button type="button" variant="secondary">My Orders</Button></Link>
              <Link to="/track-order"><Button type="button" variant="outline">Track Order</Button></Link>
              <Button type="submit" loading={saving}>Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => signOut()}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </form>
        </motion.div>

        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-accent hover:underline">
            ← Continue shopping
          </Link>
        </p>
      </div>
    </div>
  );
}
