import { supabase } from './supabase';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  enabled: boolean;
  lastSyncAt?: string;
}

async function callSyncGoogleSheets(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to sync data.');
  }

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/sync-google-sheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      'Could not reach Google Sheets sync. Deploy sync-google-sheets (npm run deploy-sync-google-sheets) and set GOOGLE_SERVICE_ACCOUNT_JSON + GOOGLE_SPREADSHEET_ID secrets.'
    );
  }

  const text = await response.text();
  let result: Record<string, unknown> = {};
  try {
    result = text ? JSON.parse(text) as Record<string, unknown> : {};
  } catch {
    throw new Error('Sync service returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(String(result.error ?? 'Google Sheets sync failed'));
  }

  return result;
}

export async function syncAllToGoogleSheets(spreadsheetId?: string): Promise<{ message: string }> {
  const result = await callSyncGoogleSheets({
    action: 'sync-all',
    spreadsheetId,
  });
  return { message: String(result.message ?? 'Synced to Google Sheets.') };
}

export async function importProductsCsv(rows: Record<string, string>[]): Promise<{ imported: number; message: string }> {
  const result = await callSyncGoogleSheets({
    action: 'import-csv',
    rows,
  });
  return {
    imported: Number(result.imported ?? 0),
    message: String(result.message ?? 'Import complete.'),
  };
}

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? '';
    });
    rows.push(row);
  }

  return rows;
}
