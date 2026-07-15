#!/usr/bin/env node
/**
 * Deploy the invite-staff edge function to Supabase.
 *
 * 1. Create token: https://supabase.com/dashboard/account/tokens
 * 2. PowerShell:
 *      $env:SUPABASE_ACCESS_TOKEN = "sbp_your_token_here"
 * 3. npm run deploy-invite-staff
 */

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const projectRef = 'yxctdtihkmslpidscfph';

function run(args) {
  const result = spawnSync('npx', ['supabase', ...args], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  return result.status ?? 1;
}

console.log('Soukhin — deploy invite-staff edge function\n');

if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.log(`SUPABASE_ACCESS_TOKEN is not set.

Quick deploy:

  1. Open https://supabase.com/dashboard/account/tokens
  2. Generate token → copy
  3. PowerShell:
     $env:SUPABASE_ACCESS_TOKEN = "sbp_paste_here"
     npm run deploy-invite-staff

Or Supabase Dashboard:
  1. https://supabase.com/dashboard/project/${projectRef}/functions
  2. Deploy function name: invite-staff
  3. Paste from supabase\\functions\\invite-staff\\index.ts

For users who already registered, run LINK_EXISTING_STAFF.sql first — then use Link account in Admin.
`);
  process.exit(1);
}

console.log('Linking project...\n');
const linkCode = run(['link', '--project-ref', projectRef, '--yes']);
if (linkCode !== 0) process.exit(1);

console.log('\nDeploying invite-staff...\n');
const deployCode = run(['functions', 'deploy', 'invite-staff', '--project-ref', projectRef]);
if (deployCode !== 0) process.exit(1);

console.log('\nDone! invite-staff is live. Also run LINK_EXISTING_STAFF.sql in SQL Editor if not done yet.\n');
