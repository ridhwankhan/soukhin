import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, Settings, LogOut, Edit2, Check, X, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

type Tab = 'overview' | 'orders' | 'wishlist' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'settings', label: 'Account', icon: Settings },
];

export default function ProfilePage() {
  const { customer, logoutCustomer, updateCustomer } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!customer) navigate('/login', { state: { from: '/profile' } });
  }, [customer, navigate]);

  if (!customer) return null;

  const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = new Date(customer.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-canvas">
      {/* Profile Header */}
      <div className="bg-elevated border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-white font-serif text-2xl font-semibold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-xl md:text-2xl font-medium text-ink truncate">{customer.name}</h1>
              <p className="text-sm text-ink-muted mt-0.5">{customer.email}</p>
              <p className="text-xs text-[#C0B8B0] mt-1">Member since {memberSince}</p>
            </div>
            <button
              onClick={() => { logoutCustomer(); navigate('/'); }}
              className="hidden md:flex items-center gap-1.5 text-sm text-[#B5603E] hover:underline font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-6 border-b border-line -mb-px">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'overview' && <OverviewTab customer={customer} wishlistCount={wishlistItems.length} onTabChange={setTab} />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'wishlist' && <WishlistTabContent wishlistItems={wishlistItems} />}
        {tab === 'settings' && <SettingsTab customer={customer} updateCustomer={updateCustomer} onLogout={() => { logoutCustomer(); navigate('/'); }} />}
      </div>
    </div>
  );
}

function OverviewTab({ customer, wishlistCount, onTabChange }: {
  customer: { name: string; email: string; phone?: string; address?: string };
  wishlistCount: number;
  onTabChange: (tab: Tab) => void;
}) {
  const cards = [
    { label: 'Orders', value: '0', sub: 'placed', tab: 'orders' as Tab, icon: Package },
    { label: 'Wishlist', value: String(wishlistCount), sub: 'items saved', tab: 'wishlist' as Tab, icon: Heart },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {cards.map(c => (
          <button
            key={c.label}
            onClick={() => onTabChange(c.tab)}
            className="bg-elevated border border-line p-5 text-left hover:border-accent transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <c.icon className="w-4 h-4 text-ink-muted group-hover:text-accent transition-colors" />
              <span className="text-xs text-ink-muted uppercase tracking-wide font-semibold">{c.label}</span>
            </div>
            <p className="text-2xl font-serif font-medium text-ink">{c.value}</p>
            <p className="text-xs text-ink-muted mt-0.5">{c.sub}</p>
          </button>
        ))}
      </div>

      {/* Account info */}
      <div className="bg-elevated border border-line p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">Account Information</h2>
        <dl className="space-y-3">
          {[
            { label: 'Full Name', value: customer.name },
            { label: 'Email', value: customer.email },
            { label: 'Phone', value: customer.phone || '—' },
            { label: 'Delivery Address', value: customer.address || '—' },
          ].map(row => (
            <div key={row.label} className="flex items-start gap-4">
              <dt className="w-32 flex-shrink-0 text-xs text-ink-muted uppercase tracking-wide font-semibold pt-0.5">{row.label}</dt>
              <dd className="text-sm text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
        <button
          onClick={() => onTabChange('settings')}
          className="mt-5 text-xs font-semibold text-accent hover:underline uppercase tracking-wide"
        >
          Edit details →
        </button>
      </div>
    </motion.div>
  );
}

function OrdersTab() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="bg-elevated border border-line py-20 text-center">
        <div className="w-12 h-12 bg-canvas flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-5 h-5 text-[#C0B8B0]" />
        </div>
        <p className="text-sm font-medium text-ink mb-1.5">No orders yet</p>
        <p className="text-xs text-ink-muted mb-6">Your order history will appear here after you place your first order.</p>
        <Link to="/" className="inline-flex px-6 py-2.5 bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors">
          Start Shopping
        </Link>
      </div>
    </motion.div>
  );
}

function WishlistTabContent({ wishlistItems }: { wishlistItems: any[] }) {
  if (!wishlistItems.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <div className="bg-elevated border border-line py-20 text-center">
          <div className="w-12 h-12 bg-canvas flex items-center justify-center mx-auto mb-4">
            <Heart className="w-5 h-5 text-[#C0B8B0]" />
          </div>
          <p className="text-sm font-medium text-ink mb-1.5">Your wishlist is empty</p>
          <p className="text-xs text-ink-muted mb-6">Save items you love by clicking the heart icon.</p>
          <Link to="/" className="inline-flex px-6 py-2.5 bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors">
            Explore Collection
          </Link>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {wishlistItems.map((product: any) => (
          <Link key={product.id} to={`/category/${product.category}`} className="group">
            <div className="aspect-[3/4] overflow-hidden bg-surface mb-2">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <p className="text-xs font-medium text-ink line-clamp-1">{product.name}</p>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

function SettingsTab({ customer, updateCustomer, onLogout }: {
  customer: { name: string; email: string; phone?: string; address?: string };
  updateCustomer: (updates: any) => void;
  onLogout: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: customer.name, phone: customer.phone ?? '', address: customer.address ?? '' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateCustomer({ name: form.name, phone: form.phone || undefined, address: form.address || undefined });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-sm text-green-700">
          <Check className="w-4 h-4" /> Profile updated successfully.
        </div>
      )}

      {/* Personal info */}
      <div className="bg-elevated border border-line p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-ink">Personal Information</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline uppercase tracking-wide">
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => setEditing(false)} className="text-xs text-ink-muted hover:text-ink"><X className="w-4 h-4" /></button>
              <button onClick={handleSave} className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline uppercase tracking-wide">
                <Check className="w-3 h-3" /> Save
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {[
            { id: 'name', label: 'Full Name', type: 'text' },
            { id: 'phone', label: 'Phone', type: 'tel' },
            { id: 'address', label: 'Delivery Address', type: 'text' },
          ].map(({ id, label, type }) => (
            <div key={id}>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5">{label}</label>
              {editing ? (
                <input
                  type={type}
                  value={(form as any)[id]}
                  onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-line text-sm text-ink focus:outline-none focus:border-accent transition-colors"
                />
              ) : (
                <p className="text-sm text-ink py-2.5">{(form as any)[id] || <span className="text-[#C0B8B0]">Not set</span>}</p>
              )}
            </div>
          ))}

          {/* Email (non-editable) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5">Email address</label>
            <p className="text-sm text-ink py-2.5">{customer.email}</p>
            <p className="text-xs text-[#C0B8B0]">Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-elevated border border-line p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">Session</h2>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#B5603E] text-sm font-medium text-[#B5603E] hover:bg-[#B5603E] hover:text-white transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out of your account
        </button>
      </div>
    </motion.div>
  );
}
