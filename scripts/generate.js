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
 * # npm run add --pkg={package name}:{version range}
 * npm run add --pkg=urllib:*
 * ```
 * ---
 * ### 添加一个新的 scope
 * 
 * ```bash
 * # npm run add --scope={scope name}
 * npm run add --scope=@ant-design
 * ```
 */
const HELP = `
Usage:
  npm run add -- --package={package name}:{version range}
  npm run add -- --scope=@{scope name}

Debug mode:
  Set DEBUG=true environment variable to use draft output and enable debug logging.
  eg: DEBUG=true npm run add -- "--package=urllib:*"
`;

const DEBUG = !!process.env.DEBUG
const OUTPUT_PATH = path.resolve(
  __dirname,
  ['../package', DEBUG ? '_draft' : '', '.json'].join('')
)

const PKG = require('../package.json');
const PKG_REGEX = /^--pkg=(.+)$/;
const SCOPE_REGEX = /^--scope=\@(.+)$/;

function addPkg(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return console.log('💥 Invalid package name');
  }

  const [name, version] = input.split(':');

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

function main() {
  const args = process.argv.slice(2);
  const firstArg = args[0];

  const isPkg = PKG_REGEX.exec(firstArg);
  const isScope = SCOPE_REGEX.exec(firstArg);

  DEBUG && console.log({
    args,
    isPkg,
    isScope,
    OUTPUT_PATH,
  });

  if (
    args.length === 0 ||
    [isPkg, isScope].every(v => !v) ||
    [firstArg === '--help', firstArg === '-h'].some(Boolean)
  ) {
    console.log(HELP);
    return;
  }

  if (isPkg) {
    addPkg(isPkg[1]);
  } else if (isScope) {
    addScope(isScope[1]);
  }
}

// \\\\\\
main();
// \\\\\\