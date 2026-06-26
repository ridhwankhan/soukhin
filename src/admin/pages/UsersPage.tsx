import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Plus, Shield, UserCheck, UserX } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  fetchStaffMembers,
  inviteStaffByEmail,
  mapStaffError,
  saveStaffMember,
  setStaffActive,
  StaffMember,
} from '../../lib/staffService';
import { ROLE_LABELS, hasPermission } from '../../config/roles';
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

const emptyForm = { name: '', email: '', role: 'inventory-manager' as AdminRole };

export default function UsersPage() {
  const { admin, can } = useAdminAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canManage = can('manage-staff') || can('manage-users');
  const roles = useMemo(() => (admin ? assignableRoles(admin.role) : []), [admin]);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      setStaff(await fetchStaffMembers());
    } catch {
      setStaff([]);
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
    setForm({ name: member.name, email: member.email, role: member.role });
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
      });
      await loadStaff();
      setSuccess(editing ? 'Staff member updated.' : 'Staff member added. Send them an invite email next.');
      if (!editing) {
        setEditing(saved);
      }
    } catch (err) {
      setError(mapStaffError(err));
    } finally {
      setSaving(false);
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
    if (!confirm(`${member.isActive ? 'Deactivate' : 'Reactivate'} ${member.name}?`)) return;
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
      <div className="p-8 text-center text-[#666666]">
        You do not have permission to view staff members.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Staff & Roles</h1>
          <p className="text-sm text-[#666666]">
            {loading ? 'Loading...' : `${staff.filter((s) => s.isActive).length} active staff — assign roles and invite team members`}
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Staff Member
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-sm text-sm text-green-700">{success}</div>
      )}

      <div className="bg-[#1B4332]/5 border border-[#1B4332]/10 rounded-lg p-4 text-sm text-[#666666]">
        <p className="font-medium text-[#2D2D2D] mb-1">How it works</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Add a person with their email and role (e.g. Inventory Manager).</li>
          <li>Click <strong>Send invite</strong> — they receive an email to set a password.</li>
          <li>They sign in at <code className="text-xs bg-white px-1 rounded">/auth</code> with that email (same as customers).</li>
        </ol>
        {admin?.role === 'admin' && (
          <p className="mt-2 text-amber-700">As Admin you can assign Moderator, Order Manager, and Inventory Manager roles only.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F6F3] text-sm text-[#666666]">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Last login</th>
                {canManage && <th className="text-right p-4 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]">
              {staff.map((member) => (
                <motion.tr key={member.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#1B4332] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium text-[#2D2D2D]">{member.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#666666]">{member.email}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#1B4332]/10 text-[#1B4332] text-xs font-medium rounded">
                      <Shield className="w-3 h-3" />
                      {ROLE_LABELS[member.role]}
                    </span>
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
                  <td className="p-4 text-sm text-[#666666]">
                    {member.lastLogin ? new Date(member.lastLogin).toLocaleString('en-GB') : 'Never'}
                  </td>
                  {canManage && (
                    <td className="p-4 text-right space-x-1">
                      {!member.isLinked && member.isActive && (
                        <button
                          onClick={() => handleInvite(member)}
                          disabled={invitingId === member.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#1B4332] hover:bg-[#1B4332]/10 rounded"
                          title="Send invite email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {invitingId === member.id ? 'Sending...' : 'Send invite'}
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(member)}
                        className="px-2 py-1 text-xs text-[#666666] hover:bg-[#F5F0E8] rounded"
                      >
                        Edit role
                      </button>
                      {member.id !== admin?.id && (
                        <button
                          onClick={() => handleToggleActive(member)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                        >
                          {member.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          {member.isActive ? 'Deactivate' : 'Activate'}
                        </button>
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
          <h2 className="text-xl font-semibold text-[#2D2D2D]">
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
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
              className="w-full px-4 py-2.5 border border-[#D4C4B5] rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            >
              {roles.map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
            <p className="text-xs text-[#666666] mt-1">
              {form.role === 'inventory-manager' && 'Can add/edit products and manage stock.'}
              {form.role === 'order-manager' && 'Can view and update customer orders.'}
              {form.role === 'moderator' && 'Can manage reviews and customer messages.'}
              {form.role === 'admin' && 'Full store management except owner-only settings.'}
              {form.role === 'owner' && 'Full access including staff and role management.'}
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>
              {editing ? 'Save changes' : 'Add staff member'}
            </Button>
            {editing && !editing.isLinked && (
              <Button type="button" variant="outline" onClick={() => handleInvite(editing)} loading={invitingId === editing.id}>
                <Mail className="w-4 h-4 mr-2" /> Send invite
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
