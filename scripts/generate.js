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
  Set DEBUG=true environment variable to use draft output and enable debug logging.
  eg: DEBUG=true npm run add -- "--pkg=urllib"
  eg: DEBUG=true npm run add -- "--large-pkg=aws-cdk-lib"
  eg: DEBUG=true npm run add -- "--large-scope=@next"
`;

const DEBUG = !!process.env.DEBUG
const OUTPUT_PATH = path.resolve(
  __dirname,
  ['../package', DEBUG ? '_draft' : '', '.json'].join('')
)

const PKG = require('../package.json');
const PKG_REGEX = /^--pkg=(.+)$/;
const SCOPE_REGEX = /^--scope=\@(.+)$/;
const LARGE_PKG_REGEX = /^--large-pkg=(.+)$/;
const LARGE_SCOPE_REGEX = /^--large-scope=\@(.+)$/;
const BLOCK_SYNC_PKG_REGEX = /^--block-sync-pkg=(.+)$/;
const BLOCK_SYNC_SCOPE_REGEX = /^--block-sync-scope=\@(.+)$/;

function addPkg(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return console.log('💥 Invalid package name');
  }

  let [name, version] = input.split(':');
  if (!version) {
    version = '*';
  }

  // exits
  if (PKG.allowPackages[name]) {
    throw new Error(`Package ${name} already exists`);
  } else if (!semverValidRange(version)) {
    throw new Error(`Invalid version range: ${version}`);
  }

  DEBUG && console.log(`Add package: ${name}@${version}`);

  const nextAllowPackages = {
    ...PKG.allowPackages,
    [name]: { version, },
  }

  const sortedAllowPackages = Object.keys(nextAllowPackages)
    .sort()
    .reduce((acc, key) => {
      acc[key] = nextAllowPackages[key];
      return acc;
    }, {});

  fs.writeJsonSync(
    OUTPUT_PATH,
    {
      ...PKG,
      allowPackages: sortedAllowPackages,
    },
    { spaces: 2 }
  );

  console.log(`✅ Add package ${name}@${version} success`);
}

function addScope(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return console.log('💥 Invalid scope name');
  } else if (!input.startsWith('@')) {
    input = '@' + input;
  }

  DEBUG && console.log(`Add scope: ${input}`);

  // exits
  if (PKG.allowScopes.includes(input)) {
    throw new Error(`Scope ${input} already exists`);
  }

  const nextAllowScopes = [...PKG.allowScopes, input].sort();

  fs.writeJsonSync(
    OUTPUT_PATH,
    {
      ...PKG,
      allowScopes: nextAllowScopes,
    },
    { spaces: 2 }
  );

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

  // exits
  if (PKG.allowLargePackages[name]) {
    throw new Error(`Large package ${name} already exists`);
  } else if (!semverValidRange(version)) {
    throw new Error(`Invalid version range: ${version}`);
  }

  DEBUG && console.log(`Add large package: ${name}@${version}`);

  const nextAllowLargePackages = {
    ...PKG.allowLargePackages,
    [name]: { version, },
  }
  
  const sortedAllowLargePackages = Object.keys(nextAllowLargePackages)
    .sort()
    .reduce((acc, key) => {
      acc[key] = nextAllowLargePackages[key];
      return acc;
    }, {});

  fs.writeJsonSync(
    OUTPUT_PATH,
    {
      ...PKG,
      allowLargePackages: sortedAllowLargePackages,
    },
    { spaces: 2 }
  );

  console.log(`✅ Add large package ${name}@${version} success`);
}

function addLargeScope(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return console.log('💥 Invalid scope name');
  } else if (!input.startsWith('@')) {
    input = '@' + input;
  }

  DEBUG && console.log(`Add large package: ${input}`);

  // exits
  if (PKG.allowLargeScopes.includes(input)) {
    throw new Error(`Large package ${input} already exists`);
  }

  const nextAllowLargeScopes = [...PKG.allowLargeScopes, input].sort();

  fs.writeJsonSync(
    OUTPUT_PATH,
    {
      ...PKG,
      allowLargeScopes: nextAllowLargeScopes,
    },
    { spaces: 2 }
  );

  console.log(`✅ Add large scope ${input} success`);
}

function addBlockSyncPkg(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return console.log('💥 Invalid package name');
  }
  
  DEBUG && console.log(`Add block sync package: ${input}`);

  // exits
  if (PKG.blockSyncPackages.includes(input)) {
    throw new Error(`Block sync package ${input} already exists`);
  }
  
  const nextBlockSyncPackages = [...PKG.blockSyncPackages, input].sort();

  fs.writeJsonSync(
    OUTPUT_PATH,
    {
      ...PKG,
      blockSyncPackages: nextBlockSyncPackages,
    },
    { spaces: 2 }
  );

  console.log(`✅ Add block sync package ${input} success`);
}

function addBlockSyncScope(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return console.log('💥 Invalid scope name');
  } else if (!input.startsWith('@')) {
    input = '@' + input;
  }

  DEBUG && console.log(`Add block sync scope: ${input}`);

  // exits
  if (PKG.blockSyncScopes.includes(input)) {
    throw new Error(`Block sync scope ${input} already exists`);
  }

  const nextBlockSyncScopes = [...PKG.blockSyncScopes, input].sort();

  fs.writeJsonSync(
    OUTPUT_PATH,
    {
      ...PKG,
      blockSyncScopes: nextBlockSyncScopes,
    },
    { spaces: 2 }
  );

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
    OUTPUT_PATH,
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