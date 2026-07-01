#!/usr/bin/env node
/**
 * Deploy the password-otp edge function to Supabase.
 *
 * 1. Create token: https://supabase.com/dashboard/account/tokens
 * 2. PowerShell:
 *      $env:SUPABASE_ACCESS_TOKEN = "sbp_your_token_here"
 * 3. npm run deploy-password-otp
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

console.log('Soukhin — deploy password-otp edge function\n');

if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.log(`SUPABASE_ACCESS_TOKEN is not set.

Quick deploy (about 2 minutes):

  1. Open https://supabase.com/dashboard/account/tokens
  2. Click "Generate new token" → copy it
  3. In PowerShell (in the Soukhin folder):

     $env:SUPABASE_ACCESS_TOKEN = "sbp_paste_your_token_here"
     npm run deploy-password-otp

Or use the Supabase Dashboard (no CLI):

  1. Open https://supabase.com/dashboard/project/${projectRef}/functions
  2. Click "Deploy a new function" → "Via Editor"
  3. Name: password-otp
  4. Open on your PC: supabase\\functions\\password-otp\\index.ts
  5. Copy all → paste into the editor → Deploy

Then set secrets (if not already set for customer emails):
  Project Settings → Edge Functions → Secrets
  - RESEND_API_KEY = your Resend key (optional — without it PIN shows on screen)
  - NOTIFICATION_FROM_EMAIL = Soukhin <you@yourdomain.com>
`);
  process.exit(1);
}

console.log('Linking project...\n');
const linkCode = run(['link', '--project-ref', projectRef, '--yes']);
if (linkCode !== 0) {
  console.error('\nLink failed. Check your access token.');
  process.exit(1);
}

console.log('\nDeploying password-otp...\n');
const deployCode = run(['functions', 'deploy', 'password-otp', '--project-ref', projectRef]);
if (deployCode !== 0) {
  console.error('\nDeploy failed. Try the Dashboard method in PASSWORD_OTP_SETUP.txt');
  process.exit(1);
}

console.log(`
Done! password-otp is live.

Test locally:
  cd e:\\Projects\\Soukhin
  npm run dev

  1. Open http://localhost:5173/auth
  2. Click "Forgot password?"
  3. Enter your email → get PIN (email or on-screen if Resend not set)
  4. Enter PIN + new password

Change password while signed in: http://localhost:5173/account → Change password
`);
