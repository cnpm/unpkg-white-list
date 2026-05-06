const test = require('node:test');
const { strict: assert } = require('node:assert');
const { readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');
const semverValidRange = require('semver/ranges/valid');

const ROOT = dirname(__dirname);
const pkgFile = join(ROOT, 'package.json');
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
