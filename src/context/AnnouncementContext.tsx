import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Announcement } from '../types';
import { SITE_SETTINGS } from '../config';
import { fetchPublicSiteSettings, saveSiteSetting } from '../lib/settingsService';

const STORAGE_KEY = 'soukhin_announcements';

interface AnnouncementContextType {
  announcements: Announcement[];
  activeAnnouncement: Announcement | null;
  activeAnnouncements: Announcement[];
  loading: boolean;
  addAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<Omit<Announcement, 'id' | 'createdAt'>>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  toggleAnnouncement: (id: string) => Promise<void>;
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

function normalizeList(raw: unknown): Announcement[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw.map((item, i) => {
    const a = item as Partial<Announcement>;
    return {
      id: a.id ?? `ann-${i}`,
      text: a.text ?? '',
      textBn: a.textBn,
      link: a.link,
      isActive: Boolean(a.isActive),
      bgColor: (a.bgColor as Announcement['bgColor']) ?? 'green',
      createdAt: a.createdAt ?? new Date().toISOString(),
      updatedAt: a.updatedAt ?? new Date().toISOString(),
    };
  }).filter((a) => a.text.trim());
}

function readLocalCache(): Announcement[] | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return null;
    return normalizeList(JSON.parse(s));
  } catch {
    return null;
  }
}

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => readLocalCache() ?? SEED);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const settings = await fetchPublicSiteSettings();
        if (!mounted) return;

        const fromList = normalizeList(settings.announcements);
        if (fromList) {
          setAnnouncements(fromList);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fromList));
          return;
        }

        // Legacy single announcement setting → migrate into list shape locally
        const single = settings.announcement as { text?: string; textBn?: string } | undefined;
        if (single?.text?.trim()) {
          const migrated: Announcement[] = [
            {
              id: 'ann-legacy',
              text: single.text,
              textBn: single.textBn,
              isActive: true,
              bgColor: 'green',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          setAnnouncements(migrated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        }
      } catch {
        // Keep local/seed fallback
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (items: Announcement[]) => {
    setAnnouncements(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota
    }
    try {
      await saveSiteSetting('announcements', items);
      // Keep legacy key in sync for older readers
      const active = items.find((a) => a.isActive);
      if (active) {
        await saveSiteSetting('announcement', { text: active.text, textBn: active.textBn ?? '' });
      }
    } catch (err) {
      console.error('Failed to save announcements to database', err);
      throw err;
    }
  }, []);

  const activeAnnouncements = announcements.filter((a) => a.isActive && a.text.trim());
  const activeAnnouncement = activeAnnouncements[0] ?? null;

  const addAnnouncement = useCallback(
    async (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      await persist([
        ...announcements,
        { ...data, id: `ann-${Date.now()}`, createdAt: now, updatedAt: now },
      ]);
    },
    [announcements, persist]
  );

  const updateAnnouncement = useCallback(
    async (id: string, updates: Partial<Omit<Announcement, 'id' | 'createdAt'>>) => {
      await persist(
        announcements.map((a) =>
          a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
        )
      );
    },
    [announcements, persist]
  );

  const deleteAnnouncement = useCallback(
    async (id: string) => {
      await persist(announcements.filter((a) => a.id !== id));
    },
    [announcements, persist]
  );

  const toggleAnnouncement = useCallback(
    async (id: string) => {
      await persist(
        announcements.map((a) =>
          a.id === id ? { ...a, isActive: !a.isActive, updatedAt: new Date().toISOString() } : a
        )
      );
    },
    [announcements, persist]
  );

  return (
    <AnnouncementContext.Provider
      value={{
        announcements,
        activeAnnouncement,
        activeAnnouncements,
        loading,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        toggleAnnouncement,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  const ctx = useContext(AnnouncementContext);
  if (!ctx) throw new Error('useAnnouncements must be used within AnnouncementProvider');
  return ctx;
}
