#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const semverValidRange = require('semver/ranges/valid');

/**
 * 用 CLI 方式添加新的包或者 scope
 *
 * ### 添加一个新的包
 *
 * ```bash
 * # npm run add -- --pkg={package name}[:{version range}]
 * npm run add -- "--pkg=urllib" # 同步 urllib 所有版本
 * npm run add -- "--pkg=urllib:*" # 同步 urllib 所有版本
 * npm run add -- "--pkg=urllib:>=1.0.0" # 同步 urllib 大于等于 1.0.0 版本
 * npm run add -- "--pkg=urllib:1.0.0" # 同步 urllib 1.0.0 版本
 * ```
 * ---
 * ### 添加一个新的 scope
 *
 * ```bash
 * # npm run add -- --scope={scope name}
 * npm run add -- --scope=@ant-design
 * ```
 * ---
 * ### 添加一个新的超大文件包
 *
 * ```bash
 * # npm run add -- --large-pkg={package name}[:{version range}]
 * npm run add -- "--large-pkg=aws-cdk-lib" # 同步 aws-cdk-lib 所有版本
 * npm run add -- "--large-pkg=aws-cdk-lib:*" # 同步 aws-cdk-lib 所有版本
 * npm run add -- "--large-pkg=aws-cdk-lib:>=1.0.0" # 同步 aws-cdk-lib 大于等于 1.0.0 版本
 * npm run add -- "--large-pkg=aws-cdk-lib:1.0.0" # 同步 aws-cdk-lib 1.0.0 版本
 * ```
 * ---
 * ### 添加一个新的超大文件 scope
 *
 * ```bash
 * # npm run add -- --large-scope={scope name}
 * npm run add -- --large-scope=@next
 * ```
 */
const HELP = `
Usage:
  npm run add -- --pkg={package name}[:{version range}]
  npm run add -- --scope=@{scope name}
  npm run add -- --large-pkg={package name}[:{version range}]
  npm run add -- --large-scope={scope name}

Debug mode:
  Set DEBUG=true environment variable to write to data/<list>_draft.json instead of data/<list>.json and enable debug logging.
  eg: DEBUG=true npm run add -- "--pkg=urllib"
  eg: DEBUG=true npm run add -- "--large-pkg=aws-cdk-lib"
  eg: DEBUG=true npm run add -- "--large-scope=@next"
`;

const DEBUG = !!process.env.DEBUG;
const DATA_DIR = path.resolve(__dirname, '../data');

const PKG_REGEX = /^--pkg=(.+)$/;
const SCOPE_REGEX = /^--scope=\@(.+)$/;
const LARGE_PKG_REGEX = /^--large-pkg=(.+)$/;
const LARGE_SCOPE_REGEX = /^--large-scope=\@(.+)$/;
const BLOCK_SYNC_PKG_REGEX = /^--block-sync-pkg=(.+)$/;
const BLOCK_SYNC_SCOPE_REGEX = /^--block-sync-scope=\@(.+)$/;

function listPath(name) {
  const suffix = DEBUG ? '_draft' : '';
  return path.join(DATA_DIR, `${name}${suffix}.json`);
}

// Asymmetric on purpose: in DEBUG mode we read the canonical source-of-truth
// but write to a *_draft.json sibling, so the original list stays untouched.
// Side effect: drafts are *not* cumulative — each DEBUG=true invocation
// re-reads the canonical baseline, so only the most recent addition survives
// in the draft. Run one DEBUG add at a time when inspecting output.
function loadList(name) {
  return fs.readJsonSync(path.join(DATA_DIR, `${name}.json`));
}

function writeList(name, value) {
  fs.writeJsonSync(listPath(name), value, { spaces: 2 });
}

function sortObjectByKey(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function addPkg(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return console.log('💥 Invalid package name');
  }

  let [name, version] = input.split(':');
  if (!version) {
    version = '*';
  }

  const allowPackages = loadList('allowPackages');

  // exits
  if (allowPackages[name]) {
    throw new Error(`Package ${name} already exists`);
  } else if (!semverValidRange(version)) {
    throw new Error(`Invalid version range: ${version}`);
  }

  DEBUG && console.log(`Add package: ${name}@${version}`);

  const next = sortObjectByKey({
    ...allowPackages,
    [name]: { version },
  });

  writeList('allowPackages', next);

  console.log(`✅ Add package ${name}@${version} success`);
}

function addScope(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return console.log('💥 Invalid scope name');
  } else if (!input.startsWith('@')) {
    input = '@' + input;
  }

  DEBUG && console.log(`Add scope: ${input}`);

  const allowScopes = loadList('allowScopes');

  // exits
  if (allowScopes.includes(input)) {
    throw new Error(`Scope ${input} already exists`);
  }

  const next = [...allowScopes, input].sort();

  writeList('allowScopes', next);

  console.log(`✅ Add scope ${input} success`);
}

function addLargePkg(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return console.log('💥 Invalid package name');
  }

  let [name, version] = input.split(':');
  if (!version) {
    version = '*';
  }

  const allowLargePackages = loadList('allowLargePackages');

  // exits
  if (allowLargePackages[name]) {
    throw new Error(`Large package ${name} already exists`);
  } else if (!semverValidRange(version)) {
    throw new Error(`Invalid version range: ${version}`);
  }

  DEBUG && console.log(`Add large package: ${name}@${version}`);

  const next = sortObjectByKey({
    ...allowLargePackages,
    [name]: { version },
  });

  writeList('allowLargePackages', next);

  console.log(`✅ Add large package ${name}@${version} success`);
}

function addLargeScope(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return console.log('💥 Invalid scope name');
  } else if (!input.startsWith('@')) {
    input = '@' + input;
  }

  DEBUG && console.log(`Add large scope: ${input}`);

  const allowLargeScopes = loadList('allowLargeScopes');

  // exits
  if (allowLargeScopes.includes(input)) {
    throw new Error(`Large scope ${input} already exists`);
  }

  const next = [...allowLargeScopes, input].sort();

  writeList('allowLargeScopes', next);

  console.log(`✅ Add large scope ${input} success`);
}

function addBlockSyncPkg(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return console.log('💥 Invalid package name');
  }

  DEBUG && console.log(`Add block sync package: ${input}`);

  const blockSyncPackages = loadList('blockSyncPackages');

  // exits
  if (blockSyncPackages.includes(input)) {
    throw new Error(`Block sync package ${input} already exists`);
  }

  const next = [...blockSyncPackages, input].sort();

  writeList('blockSyncPackages', next);

  console.log(`✅ Add block sync package ${input} success`);
}

function addBlockSyncScope(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return console.log('💥 Invalid scope name');
  } else if (!input.startsWith('@')) {
    input = '@' + input;
  }

  DEBUG && console.log(`Add block sync scope: ${input}`);

  const blockSyncScopes = loadList('blockSyncScopes');

  // exits
  if (blockSyncScopes.includes(input)) {
    throw new Error(`Block sync scope ${input} already exists`);
  }

  const next = [...blockSyncScopes, input].sort();

  writeList('blockSyncScopes', next);

  console.log(`✅ Add block sync scope ${input} success`);
}

function main() {
  const args = process.argv.slice(2);
  const firstArg = args[0];

  const isPkg = PKG_REGEX.exec(firstArg);
  const isScope = SCOPE_REGEX.exec(firstArg);
  const isLargePkg = LARGE_PKG_REGEX.exec(firstArg);
  const isLargeScope = LARGE_SCOPE_REGEX.exec(firstArg);
  const isBlockSyncPkg = BLOCK_SYNC_PKG_REGEX.exec(firstArg);
  const isBlockSyncScope = BLOCK_SYNC_SCOPE_REGEX.exec(firstArg);

  DEBUG && console.log({
    args,
    isPkg,
    isScope,
    isLargePkg,
    isLargeScope,
    isBlockSyncPkg,
    isBlockSyncScope,
    DATA_DIR,
  });

  if (
    args.length === 0 ||
    [isPkg, isScope, isLargePkg, isLargeScope, isBlockSyncPkg, isBlockSyncScope].every(v => !v) ||
    [firstArg === '--help', firstArg === '-h'].some(Boolean)
  ) {
    console.log(HELP);
    return;
  }

  if (isPkg) {
    addPkg(isPkg[1]);
  } else if (isScope) {
    addScope(isScope[1]);
  } else if (isLargePkg) {
    addLargePkg(isLargePkg[1]);
  } else if (isLargeScope) {
    addLargeScope(isLargeScope[1]);
  } else if (isBlockSyncPkg) {
    addBlockSyncPkg(isBlockSyncPkg[1]);
  } else if (isBlockSyncScope) {
    addBlockSyncScope(isBlockSyncScope[1]);
  }
}

// \\\\\\
main();
// \\\\\\
