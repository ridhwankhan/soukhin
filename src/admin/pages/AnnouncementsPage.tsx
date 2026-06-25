import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Check, Megaphone, Link as LinkIcon } from 'lucide-react';
import { useAnnouncements } from '../../context/AnnouncementContext';
import { Announcement } from '../../types';

const BG_OPTIONS: { value: Announcement['bgColor']; label: string; preview: string }[] = [
  { value: 'green', label: 'Forest Green', preview: 'bg-[#1B4332]' },
  { value: 'gold', label: 'Gold', preview: 'bg-[#9A7535]' },
  { value: 'terracotta', label: 'Terracotta', preview: 'bg-[#B5603E]' },
  { value: 'dark', label: 'Ink', preview: 'bg-[#1A1A1A]' },
];

const bgClass = (color: Announcement['bgColor']) => ({
  green: 'bg-[#1B4332]',
  gold: 'bg-[#9A7535]',
  terracotta: 'bg-[#B5603E]',
  dark: 'bg-[#1A1A1A]',
}[color]);

type DrawerMode = 'add' | 'edit';

interface DrawerState {
  open: boolean;
  mode: DrawerMode;
  data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };
}

const EMPTY: DrawerState['data'] = {
  text: '',
  textBn: '',
  link: '',
  isActive: true,
  bgColor: 'green',
};

export default function AnnouncementsPage() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, toggleAnnouncement } = useAnnouncements();
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, mode: 'add', data: EMPTY });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openAdd = () => setDrawer({ open: true, mode: 'add', data: { ...EMPTY } });
  const openEdit = (a: Announcement) => setDrawer({
    open: true, mode: 'edit',
    data: { id: a.id, text: a.text, textBn: a.textBn ?? '', link: a.link ?? '', isActive: a.isActive, bgColor: a.bgColor },
  });
  const closeDrawer = () => setDrawer(d => ({ ...d, open: false }));

  const handleSave = () => {
    if (!drawer.data.text.trim()) return;
    if (drawer.mode === 'add') {
      addAnnouncement(drawer.data);
    } else {
      updateAnnouncement(drawer.data.id!, {
        text: drawer.data.text,
        textBn: drawer.data.textBn || undefined,
        link: drawer.data.link || undefined,
        isActive: drawer.data.isActive,
        bgColor: drawer.data.bgColor,
      });
    }
    closeDrawer();
  };

  const setField = <K extends keyof DrawerState['data']>(k: K, v: DrawerState['data'][K]) =>
    setDrawer(d => ({ ...d, data: { ...d.data, [k]: v } }));

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A]">Announcements</h1>
          <p className="text-sm text-[#7A7A7A] mt-0.5">Manage the announcement bar shown at the top of the store</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B4332] text-white text-sm font-medium hover:bg-[#163828] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Announcement
        </button>
      </div>

      {/* Live preview */}
      {announcements.some(a => a.isActive) && (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A] mb-2">Live preview</p>
          {announcements.filter(a => a.isActive).slice(0, 1).map(a => (
            <div key={a.id} className={`${bgClass(a.bgColor)} text-white text-center py-2 text-xs tracking-wide`}>
              {a.link ? <a href={a.link} className="hover:underline">{a.text}</a> : a.text}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#E2D9CF] overflow-hidden">
        {announcements.length === 0 ? (
          <div className="py-16 text-center">
            <Megaphone className="w-8 h-8 text-[#D4C4B5] mx-auto mb-3" />
            <p className="text-sm text-[#7A7A7A]">No announcements yet. Add one to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0EBE3] bg-[#F9F7F4]">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">Announcement</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#9A9A9A] hidden sm:table-cell">Style</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {announcements.map(a => (
                <tr key={a.id} className="hover:bg-[#FAFAF9] transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-medium text-[#1A1A1A] line-clamp-1">{a.text}</p>
                    {a.link && (
                      <span className="flex items-center gap-1 text-xs text-[#9A9A9A] mt-0.5">
                        <LinkIcon className="w-3 h-3" />{a.link}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white ${bgClass(a.bgColor)}`}>
                      {BG_OPTIONS.find(b => b.value === a.bgColor)?.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleAnnouncement(a.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${a.isActive ? 'text-[#1B4332]' : 'text-[#9A9A9A]'}`}
                    >
                      {a.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {a.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-xs text-[#9A9A9A] hidden md:table-cell">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(a)} className="p-1.5 text-[#9A9A9A] hover:text-[#1B4332] transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(a.id)} className="p-1.5 text-[#9A9A9A] hover:text-[#B5603E] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Drawer */}
      <AnimatePresence>
        {drawer.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2D9CF]">
                <h2 className="text-sm font-semibold text-[#1A1A1A]">
                  {drawer.mode === 'add' ? 'Add Announcement' : 'Edit Announcement'}
                </h2>
                <button onClick={closeDrawer} className="p-1.5 text-[#9A9A9A] hover:text-[#1A1A1A]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#4A4A4A] mb-2">
                    Announcement text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={drawer.data.text}
                    onChange={e => setField('text', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E2D9CF] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1B4332] transition-colors resize-none"
                    placeholder="Free delivery on orders over ৳2000 | Use code: SOUKHIN10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#4A4A4A] mb-2">
                    Bengali text (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={drawer.data.textBn}
                    onChange={e => setField('textBn', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E2D9CF] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1B4332] transition-colors resize-none"
                    placeholder="বাংলায় টেক্সট"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#4A4A4A] mb-2">
                    Link (optional)
                  </label>
                  <input
                    type="url"
                    value={drawer.data.link}
                    onChange={e => setField('link', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E2D9CF] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1B4332] transition-colors"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#4A4A4A] mb-3">
                    Background color
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BG_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setField('bgColor', opt.value)}
                        className={`flex items-center gap-3 px-3 py-2.5 border-2 transition-colors ${
                          drawer.data.bgColor === opt.value ? 'border-[#1B4332]' : 'border-[#E2D9CF]'
                        }`}
                      >
                        <div className={`w-5 h-5 flex-shrink-0 ${opt.preview}`} />
                        <span className="text-xs font-medium text-[#4A4A4A]">{opt.label}</span>
                        {drawer.data.bgColor === opt.value && <Check className="w-3.5 h-3.5 text-[#1B4332] ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#4A4A4A]">Active</p>
                      <p className="text-xs text-[#9A9A9A] mt-0.5">Show this announcement on the store</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setField('isActive', !drawer.data.isActive)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${drawer.data.isActive ? 'bg-[#1B4332]' : 'bg-[#D4C4B5]'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${drawer.data.isActive ? 'translate-x-5' : ''}`} />
                    </button>
                  </label>
                </div>

                {/* Live preview */}
                {drawer.data.text && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A] mb-2">Preview</p>
                    <div className={`${bgClass(drawer.data.bgColor)} text-white text-center py-2 text-xs tracking-wide`}>
                      {drawer.data.text}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-[#E2D9CF] flex gap-3">
                <button
                  onClick={closeDrawer}
                  className="flex-1 py-2.5 border border-[#E2D9CF] text-sm font-medium text-[#4A4A4A] hover:bg-[#F9F7F4] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!drawer.data.text.trim()}
                  className="flex-1 py-2.5 bg-[#1B4332] text-white text-sm font-medium hover:bg-[#163828] disabled:opacity-50 transition-colors"
                >
                  {drawer.mode === 'add' ? 'Add Announcement' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40" onClick={() => setConfirmDelete(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 w-full max-w-sm z-50 shadow-xl"
            >
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Delete announcement?</h3>
              <p className="text-sm text-[#7A7A7A] mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-[#E2D9CF] text-sm font-medium text-[#4A4A4A] hover:bg-[#F9F7F4] transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => { deleteAnnouncement(confirmDelete); setConfirmDelete(null); }}
                  className="flex-1 py-2.5 bg-[#B5603E] text-white text-sm font-medium hover:bg-[#9A4F33] transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
