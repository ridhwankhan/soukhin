import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Announcement } from '../types';
import { SITE_SETTINGS } from '../config';

const STORAGE_KEY = 'soukhin_announcements';

interface AnnouncementContextType {
  announcements: Announcement[];
  activeAnnouncement: Announcement | null;
  addAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAnnouncement: (id: string, updates: Partial<Omit<Announcement, 'id' | 'createdAt'>>) => void;
  deleteAnnouncement: (id: string) => void;
  toggleAnnouncement: (id: string) => void;
}

const AnnouncementContext = createContext<AnnouncementContextType | null>(null);

const SEED: Announcement[] = [
  {
    id: 'ann-default',
    text: SITE_SETTINGS.announcementBar,
    textBn: SITE_SETTINGS.announcementBarBn,
    isActive: true,
    bgColor: 'green',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEED);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setAnnouncements(JSON.parse(s));
    } catch {}
  }, []);

  const persist = (items: Announcement[]) => {
    setAnnouncements(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const activeAnnouncement = announcements.find(a => a.isActive) ?? null;

  const addAnnouncement = (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    persist([...announcements, { ...data, id: `ann-${Date.now()}`, createdAt: now, updatedAt: now }]);
  };

  const updateAnnouncement = (id: string, updates: Partial<Omit<Announcement, 'id' | 'createdAt'>>) => {
    persist(announcements.map(a =>
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    ));
  };

  const deleteAnnouncement = (id: string) => persist(announcements.filter(a => a.id !== id));

  const toggleAnnouncement = (id: string) => {
    persist(announcements.map(a =>
      a.id === id ? { ...a, isActive: !a.isActive, updatedAt: new Date().toISOString() } : a
    ));
  };

  return (
    <AnnouncementContext.Provider value={{
      announcements, activeAnnouncement,
      addAnnouncement, updateAnnouncement, deleteAnnouncement, toggleAnnouncement,
    }}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  const ctx = useContext(AnnouncementContext);
  if (!ctx) throw new Error('useAnnouncements must be used within AnnouncementProvider');
  return ctx;
}
