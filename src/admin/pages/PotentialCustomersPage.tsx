import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2, UserPlus, ExternalLink } from 'lucide-react';
import {
  fetchPotentialCustomers,
  deletePotentialCustomer,
  PotentialCustomer,
} from '../../lib/potentialCustomerService';
import { parseSupabaseError } from '../../lib/parseSupabaseError';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import PotentialCustomerForm from '../components/PotentialCustomerForm';

export default function PotentialCustomersPage() {
  const [leads, setLeads] = useState<PotentialCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setLeads(await fetchPotentialCustomers(search || undefined));
    } catch (e) {
      setLeads([]);
      setError(parseSupabaseError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (lead: PotentialCustomer) => {
    if (!window.confirm(`Remove ${lead.name} from potential customers?`)) return;
    try {
      await deletePotentialCustomer(lead.id);
      await load();
    } catch (e) {
      setError(parseSupabaseError(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Potential Customers</h1>
          <p className="text-sm text-ink-secondary">
            People showing interest — not orders. Reach out later. Auto-removed after 10 days.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <UserPlus className="w-4 h-4 mr-1" />
          Add Potential Customer
        </Button>
      </div>

      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
          {successMessage}{' '}
          <Link to="/admin" className="font-medium text-accent hover:underline">
            View on Dashboard →
          </Link>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
      )}

      <div className="bg-elevated rounded-lg shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email, social..."
            className="w-full pl-10 pr-4 py-2 border border-line rounded-sm"
          />
        </div>
      </div>

      <div className="bg-elevated rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-canvas text-sm text-ink-secondary">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Photos</th>
                <th className="text-left p-4 font-medium">Contact</th>
                <th className="text-left p-4 font-medium">Interest</th>
                <th className="text-left p-4 font-medium">Added by</th>
                <th className="text-left p-4 font-medium">Expires</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!loading && leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-ink-secondary">
                    No potential customers yet. Add someone who showed interest but did not order.
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-canvas">
                  <td className="p-4 font-medium text-ink">{lead.name}</td>
                  <td className="p-4">
                    {lead.images && lead.images.length > 0 ? (
                      <div className="flex gap-1">
                        {lead.images.slice(0, 3).map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-10 h-10 rounded overflow-hidden border border-line"
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </a>
                        ))}
                        {lead.images.length > 3 && (
                          <span className="text-xs text-ink-secondary self-center">+{lead.images.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="p-4 text-sm space-y-1">
                    {lead.phone && <p>{lead.phone}</p>}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="text-accent hover:underline block">
                        {lead.email}
                      </a>
                    )}
                    {lead.socialLink && (
                      <a
                        href={lead.socialLink.startsWith('http') ? lead.socialLink : `https://${lead.socialLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline inline-flex items-center gap-1"
                      >
                        Social <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="p-4 text-sm text-ink-secondary max-w-xs">
                    <p>{lead.interestSummary || '—'}</p>
                    {lead.notes && <p className="text-xs mt-1 text-ink-muted">{lead.notes}</p>}
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">{lead.createdByAdminName ?? '—'}</td>
                  <td className="p-4 text-sm text-ink-secondary">
                    {new Date(lead.purgeAfter).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => void handleDelete(lead)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} size="lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-ink mb-4 pr-8">Add Potential Customer</h2>
          <PotentialCustomerForm
            onCancel={() => setShowAdd(false)}
            onSuccess={(name) => {
              setShowAdd(false);
              setSuccessMessage(`${name} saved as potential customer.`);
              void load();
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
