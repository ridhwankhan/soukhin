#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRef = 'yxctdtihkmslpidscfph';

function run(args) {
  return spawnSync('npx', ['supabase', ...args], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  }).status ?? 1;
}

if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.log(`Set SUPABASE_ACCESS_TOKEN then run: npm run deploy-sync-google-sheets`);
  process.exit(1);
}

run(['link', '--project-ref', projectRef, '--yes']);
const code = run(['functions', 'deploy', 'sync-google-sheets', '--project-ref', projectRef]);
process.exit(code === 0 ? 0 : 1);
