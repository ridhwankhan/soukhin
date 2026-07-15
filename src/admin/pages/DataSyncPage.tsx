import { useEffect, useState } from 'react';
import { FileSpreadsheet, RefreshCw, Upload } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { fetchSiteSettingsAdmin, saveSiteSetting } from '../../lib/settingsService';
import { importProductsCsv, parseCsv, syncAllToGoogleSheets } from '../../lib/googleSheetsService';

export default function DataSyncPage() {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [lastSync, setLastSync] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const settings = await fetchSiteSettingsAdmin();
        const gs = settings.google_sheets as { spreadsheetId?: string; lastSyncAt?: string } | undefined;
        if (gs?.spreadsheetId) setSpreadsheetId(gs.spreadsheetId);
        if (gs?.lastSyncAt) setLastSync(gs.lastSyncAt);
      } catch {
        // settings RPC may not exist until migration 021 is run
      }
    })();
  }, []);

  const handleSaveConfig = async () => {
    setError('');
    try {
      await saveSiteSetting('google_sheets', { spreadsheetId, enabled: true });
      setMessage('Google Sheet ID saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    setMessage('');
    try {
      const result = await syncAllToGoogleSheets(spreadsheetId);
      setMessage(result.message);
      setLastSync(new Date().toISOString());
      await saveSiteSetting('google_sheets', { spreadsheetId, enabled: true, lastSyncAt: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleCsvUpload = async (file: File) => {
    setImporting(true);
    setError('');
    setMessage('');
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      const result = await importProductsCsv(rows);
      setMessage(result.message);
      await handleSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Data & Google Sheets</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Sync products, orders, and categories to Google Sheets. Import CSV/Excel exports to update your store.
        </p>
      </div>

      {message && <div className="p-3 bg-green-50 border border-green-200 rounded-sm text-sm text-green-700">{message}</div>}
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>}

      <div className="bg-elevated rounded-lg border border-line p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-accent" /> Google Sheets connection
        </h2>
        <p className="text-sm text-ink-secondary">
          Create a Google Sheet with tabs named <strong>Products</strong>, <strong>Orders</strong>, and <strong>Categories</strong>.
          Share it with your service account email. Set secrets in Supabase: <code>GOOGLE_SERVICE_ACCOUNT_JSON</code>, <code>GOOGLE_SPREADSHEET_ID</code>.
        </p>
        <Input
          label="Spreadsheet ID (from the Google Sheets URL)"
          value={spreadsheetId}
          onChange={(e) => setSpreadsheetId(e.target.value)}
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
        />
        {lastSync && (
          <p className="text-xs text-ink-muted">Last sync: {new Date(lastSync).toLocaleString()}</p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => void handleSaveConfig()}>Save sheet ID</Button>
          <Button onClick={() => void handleSync()} loading={syncing}>
            <RefreshCw className="w-4 h-4 mr-2" /> Sync now
          </Button>
        </div>
      </div>

      <div className="bg-elevated rounded-lg border border-line p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5 text-accent" /> Import CSV / Excel
        </h2>
        <p className="text-sm text-ink-secondary">
          Export Excel as CSV. Required columns: <code>sku</code>, <code>name</code>, <code>category</code>, <code>price</code>, <code>stock</code>.
          Optional: <code>salePrice</code>, <code>image</code>, <code>description</code>, <code>isActive</code>.
        </p>
        <input
          type="file"
          accept=".csv,.txt"
          disabled={importing}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleCsvUpload(file);
          }}
          className="text-sm"
        />
      </div>
    </div>
  );
}
