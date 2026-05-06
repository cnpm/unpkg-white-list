#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PKG_PATH = path.join(ROOT, 'package.json');
const BAK_PATH = path.join(ROOT, 'package.json.bak');
const DATA_DIR = path.join(ROOT, 'data');

const LIST_FIELDS = [
  'allowScopes',
  'allowPackages',
  'allowLargeScopes',
  'allowLargePackages',
  'blockSyncScopes',
  'blockSyncPackages',
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

function merge() {
  const original = fs.readFileSync(PKG_PATH, 'utf-8');
  fs.writeFileSync(BAK_PATH, original);

  const pkg = JSON.parse(original);
  for (const field of LIST_FIELDS) {
    delete pkg[field];
  }
  for (const field of LIST_FIELDS) {
    pkg[field] = readJson(path.join(DATA_DIR, `${field}.json`));
  }

  writeJson(PKG_PATH, pkg);
  console.log(`✅ Merged ${LIST_FIELDS.length} list(s) from data/ into package.json`);
}

function restore() {
  if (!fs.existsSync(BAK_PATH)) {
    console.log('ℹ️  No package.json.bak — nothing to restore');
    return;
  }
  fs.renameSync(BAK_PATH, PKG_PATH);
  console.log('✅ Restored package.json from package.json.bak');
}

function main() {
  const cmd = process.argv[2];
  if (cmd === 'merge') return merge();
  if (cmd === 'restore') return restore();
  console.error('Usage: node scripts/build-pkg.js <merge|restore>');
  process.exit(1);
}

main();
