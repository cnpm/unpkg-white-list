const test = require('node:test');
const { strict: assert } = require('node:assert');
const { readFileSync } = require('node:fs');
const { dirname, join } = require('node:path');
const semverValidRange = require('semver/ranges/valid')

const pkgFile = join(dirname(__dirname), 'package.json');

test('should pkg.allowPackages work', (t) => {
  const pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
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

  assert(pkg.allowScopes);
  assert.equal(typeof pkg.allowScopes, 'object');
  let scopes = 0;
  for (const name of pkg.allowScopes) {
    scopes++;
    assert(name);
    assert.equal(typeof name, 'string');
    assert.match(name, /^@.+/);
  }
  console.log('Total %d scopes', scopes);
  assert(scopes > 0);
});

