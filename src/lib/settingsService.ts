import { supabase } from './supabase';

export async function fetchSiteSettingsAdmin(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.rpc('get_site_settings_admin');
  if (error) throw error;
  return (data as Record<string, unknown>) ?? {};
}

export async function fetchPublicSiteSettings(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.rpc('get_public_site_settings');
  if (error) throw error;
  return (data as Record<string, unknown>) ?? {};
}

export async function saveSiteSetting(key: string, value: unknown): Promise<void> {
  const { error } = await supabase.rpc('upsert_site_setting_admin', {
    p_key: key,
    p_value: value,
  });
  if (error) throw error;
}

export async function saveSiteSettingsBatch(settings: Record<string, unknown>): Promise<void> {
  for (const [key, value] of Object.entries(settings)) {
    await saveSiteSetting(key, value);
  }
}
