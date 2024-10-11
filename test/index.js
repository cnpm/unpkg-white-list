const test = require('node:test');
const { strict: assert } = require('node:assert');
const { readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');
const semverValidRange = require('semver/ranges/valid');

const pkgFile = join(dirname(__dirname), 'package.json');
const pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
// format the package.json
writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');

test('should pkg.allowPackages work', () => {
  assert(pkg.files);
  assert.equal(pkg.files.length, 0);
  assert(pkg.allowPackages);
  assert.equal(typeof pkg.allowPackages, 'object');
  let packages = 0;
  for (const name in pkg.allowPackages) {
    packages++;
    assert(name);
    assert.equal(typeof name, 'string');
    const config = pkg.allowPackages[name];
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
  assert(pkg.allowScopes);
  assert.equal(typeof pkg.allowScopes, 'object');
  let scopes = 0;
  for (const name of pkg.allowScopes) {
    scopes++;
    assert(name);
    assert.equal(typeof name, 'string');
    assert.match(name, /^@.+/);
    assert.equal(pkg.allowScopes.filter(n => n === name).length, 1, `"${name}" is duplicate`);
  }
  console.log('Total %d scopes', scopes);
  assert(scopes > 0);
});

// 解析 allowPackages 的每个包的组织和包名，如果该组织已存在 allowScopes 中，则不需要再添加具名包
// 例如：@babel 已存在，那么 @babel/core 就不需要再添加
test('check allowPackages and allowScopes', () => {
  const duplicatedPackages = new Map();
  for (const name in pkg.allowPackages) {
    if (name.startsWith('@')) {
      const [scope] = name.split('/');
      if (pkg.allowScopes.includes(scope)) {
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
