import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Plus, Shield, UserCheck, UserX } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  fetchStaffMembers,
  inviteStaffByEmail,
  linkStaffMember,
  mapStaffError,
  saveStaffMember,
  setStaffActive,
  StaffMember,
} from '../../lib/staffService';
import { ROLE_LABELS, getPermissionsForRoles } from '../../config/roles';
import { AdminRole } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

const ALL_ROLES: AdminRole[] = ['owner', 'admin', 'moderator', 'order-manager', 'inventory-manager'];

function assignableRoles(actorRole: AdminRole): AdminRole[] {
  if (actorRole === 'owner') return ALL_ROLES;
  if (actorRole === 'admin') return ['moderator', 'order-manager', 'inventory-manager'];
  return [];
}

const emptyForm = { name: '', email: '', role: 'inventory-manager' as AdminRole, additionalRoles: [] as AdminRole[] };

export default function UsersPage() {
  const { admin, can } = useAdminAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [success, setSuccess] = useState('');

  const canManage = can('manage-staff') || can('manage-users');
  const roles = useMemo(() => (admin ? assignableRoles(admin.role) : []), [admin]);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setStaff(await fetchStaffMembers());
    } catch (err) {
      setStaff([]);
      setLoadError(mapStaffError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, role: roles[0] ?? 'inventory-manager' });
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditing(member);
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
      additionalRoles: member.additionalRoles ?? [],
    });
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const saved = await saveStaffMember({
        id: editing?.id,
        name: form.name,
        email: form.email,
        role: form.role,
        additionalRoles: form.additionalRoles.filter((r) => r !== form.role),
      });
      await loadStaff();
      const linkedNote = saved.isLinked
        ? ' Their existing account was linked automatically.'
        : ' Click Link account if they already registered, or Send invite for new users.';
      setSuccess((editing ? 'Staff member updated.' : 'Staff member added.') + linkedNote);
      if (!editing) {
        setEditing(saved);
      }
    } catch (err) {
      setError(mapStaffError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLink = async (member: StaffMember) => {
    setLinkingId(member.id);
    setError('');
    setSuccess('');
    try {
      await linkStaffMember(member.id);
      await loadStaff();
      setSuccess(`${member.email} is linked. They can sign in at /auth and open the Dashboard.`);
    } catch (err) {
      setError(mapStaffError(err));
    } finally {
      setLinkingId(null);
    }
  };

  const handleInvite = async (member: StaffMember) => {
    setInvitingId(member.id);
    setError('');
    setSuccess('');
    try {
      const result = await inviteStaffByEmail(member.email);
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invite failed');
    } finally {
      setInvitingId(null);
    }
  };

  const handleToggleActive = async (member: StaffMember) => {
    const action = member.isActive ? 'Remove staff access from' : 'Restore staff access for';
    if (!confirm(`${action} ${member.name}? They will ${member.isActive ? 'no longer see the admin dashboard' : 'be able to open the dashboard again'}.`)) return;
    setError('');
    try {
      await setStaffActive(member.id, !member.isActive);
      await loadStaff();
    } catch (err) {
      setError(mapStaffError(err));
    }
  };

  if (!can('view-users')) {
    return (
      <div className="p-8 text-center text-ink-secondary">
        You do not have permission to view staff members.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Staff & Roles</h1>
          <p className="text-sm text-ink-secondary">
            {loading ? 'Loading...' : `${staff.filter((s) => s.isActive).length} active staff — assign roles and invite team members`}
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Staff Member
          </Button>
        )}
      </div>

      {loadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">
          <p className="font-medium">Could not load staff list</p>
          <p className="mt-1">{loadError}</p>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-sm text-sm text-green-700">{success}</div>
      )}

      <div className="bg-accent/5 border border-accent/10 rounded-lg p-4 text-sm text-ink-secondary">
        <p className="font-medium text-ink mb-1">Promote, demote & remove staff</p>
        <ol className="list-decimal list-inside space-y-1">
          <li><strong>Make staff</strong> — add email + role, or promote from <Link to="/admin/customers" className="text-accent hover:underline">Customers</Link>.</li>
          <li><strong>Change role</strong> — pick a new role and save.</li>
          <li><strong>Remove staff access</strong> — they become a normal customer again (keeps their store account).</li>
          <li><strong>Link account</strong> if they already signed up; <strong>Send invite</strong> for new users.</li>
        </ol>
        <p className="mt-2 text-xs text-ink-muted">
          You cannot remove your own access while you are the only owner. Add another owner first, then they can remove you.
        </p>
        {admin?.role === 'admin' && (
          <p className="mt-2 text-amber-700">As Admin you can assign Moderator, Order Manager, and Inventory Manager roles only.</p>
        )}
      </div>

      <div className="bg-elevated rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-canvas text-sm text-ink-secondary">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Last login</th>
                {canManage && <th className="text-right p-4 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!loading && staff.length === 0 && !loadError && (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="p-8 text-center text-sm text-ink-secondary">
                    No staff in the database yet. Click <strong>Add Staff Member</strong> above, or run{' '}
                    <code className="text-xs bg-canvas px-1 rounded">FIX_STAFF_LIST.sql</code> in Supabase if
                    you expected people here (e.g. Intisar).
                  </td>
                </tr>
              )}
              {staff.map((member) => (
                <motion.tr key={member.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-ink">{member.name}</span>
                        {member.id === admin?.id && (
                          <span className="block text-[10px] text-ink-muted">This is you</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">{member.email}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded">
                        <Shield className="w-3 h-3" />
                        {ROLE_LABELS[member.role]}
                      </span>
                      {(member.additionalRoles ?? []).map((r) => (
                        <span key={r} className="px-2 py-1 bg-surface text-ink-secondary text-xs rounded">
                          + {ROLE_LABELS[r]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    {!member.isActive ? (
                      <span className="text-xs text-red-600 font-medium">Inactive</span>
                    ) : member.isLinked ? (
                      <span className="text-xs text-green-700 font-medium">Active · linked</span>
                    ) : (
                      <span className="text-xs text-amber-700 font-medium">Pending invite</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-ink-secondary">
                    {member.lastLogin ? new Date(member.lastLogin).toLocaleString('en-GB') : 'Never'}
                  </td>
                  {canManage && (
                    <td className="p-4 text-right space-x-1">
                      {!member.isLinked && member.isActive && (
                        <>
                          <button
                            onClick={() => handleLink(member)}
                            disabled={linkingId === member.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-700 hover:bg-green-50 rounded"
                            title="Link existing registered account"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            {linkingId === member.id ? 'Linking...' : 'Link account'}
                          </button>
                          <button
                            onClick={() => handleInvite(member)}
                            disabled={invitingId === member.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded"
                            title="Send invite email for new users"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            {invitingId === member.id ? 'Sending...' : 'Send invite'}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openEdit(member)}
                        className="px-2 py-1 text-xs font-medium text-accent hover:bg-accent/10 rounded border border-accent/20"
                        disabled={member.id === admin?.id}
                        title={member.id === admin?.id ? 'Use another owner account to change your own role' : undefined}
                      >
                        Change role
                      </button>
                      {member.id !== admin?.id ? (
                        <button
                          onClick={() => handleToggleActive(member)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded border border-red-200"
                          title="Revoke dashboard access — they become a normal customer again"
                        >
                          {member.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          {member.isActive ? 'Remove staff access' : 'Restore staff access'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-ink-muted px-1">Can&apos;t remove yourself</span>
                      )}
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="md">
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-ink">
            {editing ? 'Edit staff member' : 'Add staff member'}
          </h2>

          <Input
            label="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            disabled={Boolean(editing)}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
              className="w-full px-4 py-2.5 border border-line rounded-sm bg-elevated focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {roles.map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
            <p className="text-xs text-ink-secondary mt-1">
              {form.role === 'inventory-manager' && 'Can add/edit products and manage stock.'}
              {form.role === 'order-manager' && 'Can view and update customer orders.'}
              {form.role === 'moderator' && 'Can manage reviews and customer messages.'}
              {form.role === 'admin' && 'Full store management except owner-only settings.'}
              {form.role === 'owner' && 'Full access including staff and role management.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Additional roles (optional)</label>
            <p className="text-xs text-ink-secondary mb-2">Stack extra access — e.g. Admin + Inventory Manager</p>
            <div className="flex flex-wrap gap-3">
              {roles.filter((r) => r !== form.role).map((role) => (
                <label key={role} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.additionalRoles.includes(role)}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        additionalRoles: e.target.checked
                          ? [...prev.additionalRoles, role]
                          : prev.additionalRoles.filter((r) => r !== role),
                      }));
                    }}
                  />
                  {ROLE_LABELS[role]}
                </label>
              ))}
            </div>
            {form.additionalRoles.length > 0 && (
              <p className="text-xs text-accent mt-2">
                Combined access: {getPermissionsForRoles([form.role, ...form.additionalRoles]).length} permissions
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>
              {editing ? 'Save changes' : 'Add staff member'}
            </Button>
            {editing && !editing.isLinked && (
              <>
                <Button type="button" variant="outline" onClick={() => handleLink(editing)} loading={linkingId === editing.id}>
                  <UserCheck className="w-4 h-4 mr-2" /> Link account
                </Button>
                <Button type="button" variant="outline" onClick={() => handleInvite(editing)} loading={invitingId === editing.id}>
                  <Mail className="w-4 h-4 mr-2" /> Send invite
                </Button>
              </>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
