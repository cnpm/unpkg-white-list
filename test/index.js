const test = require('node:test');
const { strict: assert } = require('node:assert');
const { execSync } = require('node:child_process');
const { existsSync, readFileSync, unlinkSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');
const semverValidRange = require('semver/ranges/valid');

const ROOT = dirname(__dirname);
const pkgFile = join(ROOT, 'package.json');
const bakFile = join(ROOT, 'package.json.bak');
const dataDir = join(ROOT, 'data');

function readAndNormalize(file) {
  const original = readFileSync(file, 'utf-8');
  const value = JSON.parse(original);
  const formatted = JSON.stringify(value, null, 2) + '\n';
  if (formatted !== original) {
    writeFileSync(file, formatted);
  }
  return value;
}

const pkg = readAndNormalize(pkgFile);

function loadList(name) {
  return readAndNormalize(join(dataDir, `${name}.json`));
}

const allowPackages = loadList('allowPackages');
const allowScopes = loadList('allowScopes');
const allowLargePackages = loadList('allowLargePackages');
const allowLargeScopes = loadList('allowLargeScopes');
const blockSyncPackages = loadList('blockSyncPackages');
const blockSyncScopes = loadList('blockSyncScopes');

test('should pkg.allowPackages work', () => {
  assert(pkg.files);
  assert.equal(pkg.files.length, 0);
  assert(allowPackages);
  assert.equal(typeof allowPackages, 'object');
  let packages = 0;
  for (const name in allowPackages) {
    packages++;
    assert(name);
    assert.equal(typeof name, 'string');
    const config = allowPackages[name];
    assert(config);
    assert.equal(typeof config, 'object');
    assert(config.version);
    assert.equal(typeof config.version, 'string', `${name} version(${config.version}) type should be string`);
    config.versionRange = semverValidRange(config.version);
    assert(config.versionRange, `${name} version(${config.version}) should match semver range format`);
    // console.log(' - %o => %j', name, config);
  }
  console.log('Total %d packages', packages);
  assert(packages > 0);
});

test('should pkg.allowScopes work', () => {
  assert(allowScopes);
  assert(Array.isArray(allowScopes), 'allowScopes should be an array');
  let scopes = 0;
  for (const name of allowScopes) {
    scopes++;
    assert(name);
    assert.equal(typeof name, 'string');
    assert.match(name, /^@.+/);
    assert.equal(allowScopes.filter(n => n === name).length, 1, `"${name}" is duplicate`);
  }
  console.log('Total %d scopes', scopes);
  assert(scopes > 0);
});

// 解析 allowPackages 的每个包的组织和包名，如果该组织已存在 allowScopes 中，则不需要再添加具名包
// 例如：@babel 已存在，那么 @babel/core 就不需要再添加
test('check allowPackages and allowScopes', () => {
  const duplicatedPackages = new Map();
  for (const name in allowPackages) {
    if (name.startsWith('@')) {
      const [scope] = name.split('/');
      if (allowScopes.includes(scope)) {
        duplicatedPackages.set(scope, [
          ...(duplicatedPackages.get(scope) || []),
          name
        ]);
      }
    }
  }

  if (duplicatedPackages.size > 0) {
    console.log('Duplicated packages in allowScopes:');
    for (const [scope, packages] of duplicatedPackages) {
      console.log(` - ${scope}: ${packages.join(', ')}`);
    }
    assert.fail('Duplicated packages in allowScopes');
  }
});

test('should pkg.allowLargePackages work', () => {
  assert(allowLargePackages);
  assert.equal(typeof allowLargePackages, 'object');
  let packages = 0;
  for (const name in allowLargePackages) {
    packages++;
    assert(name);
    assert.equal(typeof name, 'string');
    const config = allowLargePackages[name];
    assert(config);
    assert.equal(typeof config, 'object');
    assert(config.version);
    assert.equal(typeof config.version, 'string', `${name} version(${config.version}) type should be string`);
    config.versionRange = semverValidRange(config.version);
    assert(config.versionRange, `${name} version(${config.version}) should match semver range format`);
    // console.log(' - %o => %j', name, config);
  }
  console.log('Total %d large packages', packages);
  assert(packages > 0);
});

test('should pkg.allowLargeScopes work', () => {
  assert(allowLargeScopes);
  assert(Array.isArray(allowLargeScopes), 'allowLargeScopes should be an array');
  let scopes = 0;
  for (const name of allowLargeScopes) {
    scopes++;
    assert(name);
    assert.equal(typeof name, 'string');
    assert.match(name, /^@.+/);
    assert.equal(allowLargeScopes.filter(n => n === name).length, 1, `"${name}" is duplicate`);
  }
  console.log('Total %d large scopes', scopes);
  assert(scopes > 0);
});

test('check allowLargePackages and allowLargeScopes', () => {
  const duplicatedPackages = new Map();
  for (const name in allowLargePackages) {
    if (name.startsWith('@')) {
      const [scope] = name.split('/');
      if (allowLargeScopes.includes(scope)) {
        duplicatedPackages.set(scope, [
          ...(duplicatedPackages.get(scope) || []),
          name
        ]);
      }
    }
  }
  if (duplicatedPackages.size > 0) {
    console.log('Duplicated packages in allowLargeScopes:');
    for (const [scope, packages] of duplicatedPackages) {
      console.log(` - ${scope}: ${packages.join(', ')}`);
    }
    assert.fail('Duplicated packages in allowLargeScopes');
  }
});

test('should pkg.blockSyncScopes work', () => {
  assert(blockSyncScopes);
  assert(Array.isArray(blockSyncScopes), 'blockSyncScopes should be an array');
  let scopes = 0;
  for (const name of blockSyncScopes) {
    scopes++;
    assert(name);
    assert.equal(typeof name, 'string');
    assert.match(name, /^@.+/);
    assert.equal(blockSyncScopes.filter(n => n === name).length, 1, `"${name}" is duplicate`);
  }
  console.log('Total %d block sync scopes', scopes);
  assert(scopes > 0);
});

test('should pkg.blockSyncPackages work', () => {
  assert(blockSyncPackages);
  assert(Array.isArray(blockSyncPackages), 'blockSyncPackages should be an array');
  let packages = 0;
  for (const name of blockSyncPackages) {
    packages++;
    assert(name);
    assert.equal(typeof name, 'string');
    assert.equal(blockSyncPackages.filter(n => n === name).length, 1, `"${name}" is duplicate`);
  }
  console.log('Total %d block sync packages', packages);
  assert(packages > 0);
  assert(blockSyncPackages.length === packages, 'blockSyncPackages length should be equal to packages length');
});

// Regression test for the registry-packument bug introduced by #565.
// `npm publish` re-reads package.json AFTER `pack()` (i.e. after postpack)
// to build the manifest it uploads to the registry. If postpack restores
// an unmerged package.json, the registry packument loses allowPackages etc.
// (see https://registry.npmjs.com/unpkg-white-list/1.299.0).
test('npm pack must leave package.json with merged lists for the registry manifest', () => {
  const savedPkg = readFileSync(pkgFile, 'utf-8');
  const savedBak = existsSync(bakFile) ? readFileSync(bakFile) : null;
  try {
    execSync('npm pack --dry-run --silent', { cwd: ROOT, stdio: 'pipe' });
    const afterPack = JSON.parse(readFileSync(pkgFile, 'utf-8'));
    for (const field of [
      'allowScopes',
      'allowPackages',
      'allowLargeScopes',
      'allowLargePackages',
      'blockSyncScopes',
      'blockSyncPackages',
    ]) {
      assert(afterPack[field], `package.json after pack must have ${field} — npm publish re-reads it after pack to build the registry manifest`);
    }
    assert(Object.keys(afterPack.allowPackages).length > 0, 'allowPackages must not be empty');
  } finally {
    writeFileSync(pkgFile, savedPkg);
    if (savedBak === null) {
      if (existsSync(bakFile)) unlinkSync(bakFile);
    } else {
      writeFileSync(bakFile, savedBak);
    }
  }
});

test('check blockSyncPackages and blockSyncScopes', () => {
  const duplicatedPackages = new Map();
  for (const name of blockSyncPackages) {
    if (name.startsWith('@')) {
      const [scope] = name.split('/');
      if (blockSyncScopes.includes(scope)) {
        duplicatedPackages.set(scope, [
          ...(duplicatedPackages.get(scope) || []),
          name
        ]);
      }
    }
  }
  if (duplicatedPackages.size > 0) {
    console.log('Duplicated packages in blockSyncScopes:');
    for (const [scope, packages] of duplicatedPackages) {
      console.log(` - ${scope}: ${packages.join(', ')}`);
    }
    assert.fail('Duplicated packages in blockSyncScopes');
  }
});
