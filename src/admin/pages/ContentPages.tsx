import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { SITE_SETTINGS } from '../../config';
import { fetchSiteSettingsAdmin, saveSiteSetting } from '../../lib/settingsService';

export function HeroEditorPage() {
  const [form, setForm] = useState({
    title: SITE_SETTINGS.hero.title,
    titleBn: SITE_SETTINGS.hero.titleBn,
    subtitle: SITE_SETTINGS.hero.subtitle,
    subtitleBn: SITE_SETTINGS.hero.subtitleBn,
    image: '/images/hero.png',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void fetchSiteSettingsAdmin().then((s) => {
      const hero = s.hero as typeof form | undefined;
      if (hero) setForm((prev) => ({ ...prev, ...hero }));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSiteSetting('hero', form);
      setMessage('Hero section saved. Refresh the storefront to see changes.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditorShell title="Hero Section" description="Homepage hero banner text and image" onSave={handleSave} saving={saving} message={message}>
      <Input label="Title (English)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Input label="Title (Bengali)" value={form.titleBn} onChange={(e) => setForm({ ...form, titleBn: e.target.value })} />
      <Input label="Subtitle (English)" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
      <Input label="Subtitle (Bengali)" value={form.subtitleBn} onChange={(e) => setForm({ ...form, subtitleBn: e.target.value })} />
      <Input label="Hero image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
    </EditorShell>
  );
}

type BannerItem = { image: string; title: string; subtitle: string; link: string };
type NewReleaseItem = { image: string; title: string; subtitle?: string; link?: string };

export function NewReleasesEditorPage() {
  const [releases, setReleases] = useState<NewReleaseItem[]>([
    { image: '', title: '', subtitle: '', link: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void fetchSiteSettingsAdmin().then((s) => {
      const list = s.new_releases as NewReleaseItem[] | undefined;
      if (list?.length) setReleases(list);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSiteSetting('new_releases', releases.filter((r) => r.image && r.title));
      setMessage('New releases saved. They appear in the homepage slideshow with a NEW label.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditorShell
      title="New Releases"
      description="Photography and launch highlights for the homepage NEW slideshow. Products with the “new” badge also appear automatically."
      onSave={handleSave}
      saving={saving}
      message={message}
    >
      <p className="text-sm text-ink-secondary bg-canvas border border-line rounded p-3">
        Tip: On any product, add <strong>new</strong> or <strong>hot</strong> in the Badges field (Products → Edit) to label it and show it in homepage carousels.
      </p>
      {releases.map((item, idx) => (
        <div key={idx} className="border border-line rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">Release {idx + 1}</p>
          <Input label="Image URL" value={item.image} onChange={(e) => {
            const next = [...releases];
            next[idx] = { ...next[idx], image: e.target.value };
            setReleases(next);
          }} />
          <Input label="Title" value={item.title} onChange={(e) => {
            const next = [...releases];
            next[idx] = { ...next[idx], title: e.target.value };
            setReleases(next);
          }} />
          <Input label="Subtitle (optional)" value={item.subtitle ?? ''} onChange={(e) => {
            const next = [...releases];
            next[idx] = { ...next[idx], subtitle: e.target.value };
            setReleases(next);
          }} />
          <Input label="Link (optional, e.g. /product/uuid or /category/gifts)" value={item.link ?? ''} onChange={(e) => {
            const next = [...releases];
            next[idx] = { ...next[idx], link: e.target.value };
            setReleases(next);
          }} />
          {item.image && (
            <img src={item.image} alt="" className="w-full max-h-40 object-cover rounded border border-line" />
          )}
        </div>
      ))}
      <Button variant="outline" type="button" onClick={() => setReleases([...releases, { image: '', title: '', subtitle: '', link: '' }])}>
        Add release photo
      </Button>
    </EditorShell>
  );
}

export function BannersEditorPage() {
  const [banners, setBanners] = useState<BannerItem[]>([
    { image: '', title: '', subtitle: '', link: '/category/wearables' },
  ]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void fetchSiteSettingsAdmin().then((s) => {
      const list = s.banners as BannerItem[] | undefined;
      if (list?.length) setBanners(list);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSiteSetting('banners', banners.filter((b) => b.image || b.title));
      setMessage('Banners saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditorShell title="Homepage Banners" description="Carousel banners on the home page" onSave={handleSave} saving={saving} message={message}>
      {banners.map((banner, idx) => (
        <div key={idx} className="border border-line rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">Banner {idx + 1}</p>
          <Input label="Image URL" value={banner.image} onChange={(e) => {
            const next = [...banners];
            next[idx] = { ...next[idx], image: e.target.value };
            setBanners(next);
          }} />
          <Input label="Title" value={banner.title} onChange={(e) => {
            const next = [...banners];
            next[idx] = { ...next[idx], title: e.target.value };
            setBanners(next);
          }} />
          <Input label="Subtitle" value={banner.subtitle} onChange={(e) => {
            const next = [...banners];
            next[idx] = { ...next[idx], subtitle: e.target.value };
            setBanners(next);
          }} />
          <Input label="Link" value={banner.link} onChange={(e) => {
            const next = [...banners];
            next[idx] = { ...next[idx], link: e.target.value };
            setBanners(next);
          }} />
        </div>
      ))}
      <Button variant="outline" type="button" onClick={() => setBanners([...banners, { image: '', title: '', subtitle: '', link: '/' }])}>
        Add banner
      </Button>
    </EditorShell>
  );
}

function EditorShell({
  title,
  description,
  children,
  onSave,
  saving,
  message,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
  message: string;
}) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          <p className="text-sm text-ink-secondary">{description}</p>
        </div>
        <Button onClick={onSave} loading={saving}>
          <Save className="w-4 h-4 mr-2" /> Save
        </Button>
      </div>
      {message && <div className="p-3 bg-green-50 border border-green-200 rounded-sm text-sm text-green-700">{message}</div>}
      <div className="bg-elevated rounded-lg border border-line p-6 space-y-4">{children}</div>
    </div>
  );
}
