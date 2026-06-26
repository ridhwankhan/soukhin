#!/usr/bin/env node
/**
 * Apply staff profile DB fix without the Supabase dashboard.
 *
 * Option A — Supabase CLI + access token (recommended):
 *   1. Create token: https://supabase.com/dashboard/account/tokens
 *   2. set SUPABASE_ACCESS_TOKEN=sbp_xxxx   (PowerShell: $env:SUPABASE_ACCESS_TOKEN="...")
 *   3. npm run fix-staff-db
 *
 * Option B — direct Postgres URL (if you saved the DB password):
 *   set DATABASE_URL=postgresql://postgres.yxctdtihkmslpidscfph:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
 *   npm run fix-staff-db
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sqlFile = join(root, 'supabase', 'FIX_STAFF_PROFILE.sql');
const projectRef = 'yxctdtihkmslpidscfph';

if (!existsSync(sqlFile)) {
  console.error('Missing SQL file:', sqlFile);
  process.exit(1);
}

function run(cmd, args, extraEnv = {}) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...extraEnv },
  });
  return result.status ?? 1;
}

function supabase(args) {
  return run('npx', ['supabase', ...args]);
}

console.log('Soukhin — apply staff profile fix\n');

if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL (direct Postgres)...\n');
  const code = supabase(['db', 'query', '-f', sqlFile, '--db-url', process.env.DATABASE_URL]);
  process.exit(code === 0 ? 0 : 1);
}

if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.log(`No SUPABASE_ACCESS_TOKEN or DATABASE_URL found.

Use the CLI (no project dashboard needed):

  1. Open https://supabase.com/dashboard/account/tokens
     (Account settings — often works even when a project page hangs)

  2. Create a token, then in PowerShell:
     $env:SUPABASE_ACCESS_TOKEN = "sbp_your_token_here"

  3. Link once:
     npx supabase link --project-ref ${projectRef}

  4. Run again:
     npm run fix-staff-db

Or use your database password:
  $env:DATABASE_URL = "postgresql://postgres.${projectRef}:YOUR_PASSWORD@db.${projectRef}.supabase.co:5432/postgres"
  npm run fix-staff-db
`);
  process.exit(1);
}

console.log('Linking project (safe to re-run)...\n');
const linkCode = supabase(['link', '--project-ref', projectRef, '--yes']);
if (linkCode !== 0) {
  console.error('\nLink failed. Check SUPABASE_ACCESS_TOKEN and project ref.');
  process.exit(1);
}

console.log('\nApplying SQL via Management API...\n');
const queryCode = supabase(['db', 'query', '-f', sqlFile, '--linked']);
if (queryCode !== 0) {
  console.error('\nSQL apply failed. Try DATABASE_URL method if CLI query is blocked.');
  process.exit(1);
}

console.log('\nDone. Sign out and back in locally, then open /admin or click Retry.');
