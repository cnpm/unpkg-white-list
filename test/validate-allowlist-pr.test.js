const test = require('node:test');
const { strict: assert } = require('node:assert');

const {
  getAddedObjectKeys,
  getAddedArrayItems,
  getAllowlistChanges,
  isValidScopeName,
  buildComment,
} = require('../scripts/validate-allowlist-pr');

test('getAddedObjectKeys returns new sorted keys only', () => {
  assert.deepEqual(
    getAddedObjectKeys(
      { c: {}, a: {} },
      { c: {}, a: {}, b: {} }
    ),
    ['b']
  );
});

test('getAddedArrayItems returns new sorted items only', () => {
  assert.deepEqual(
    getAddedArrayItems(
      ['@b', '@a'],
      ['@b', '@a', '@c']
    ),
    ['@c']
  );
});

test('getAllowlistChanges detects allowPackages and allowScopes additions', () => {
  assert.deepEqual(
    getAllowlistChanges(
      {
        allowPackages: { foo: { version: '*' } },
        allowScopes: ['@foo'],
      },
      {
        allowPackages: {
          foo: { version: '*' },
          bar: { version: '*' },
        },
        allowScopes: ['@foo', '@bar'],
      }
    ),
    {
      packages: ['bar'],
      scopes: ['@bar'],
    }
  );
});

test('isValidScopeName requires exact @scope format', () => {
  assert.equal(isValidScopeName('@scope'), true);
  assert.equal(isValidScopeName('scope'), false);
  assert.equal(isValidScopeName('@scope/pkg'), false);
});

test('buildComment includes validation thresholds and rows', () => {
  const comment = buildComment({
    packageMinDownloads: 1,
    scopeMinDownloads: 10000,
    results: [
      {
        type: 'package',
        name: 'foo',
        passed: false,
        downloads: 0,
        reason: 'last-week downloads 0 < 1',
      },
      {
        type: 'scope',
        name: '@bar',
        passed: true,
        bestPackage: '@bar/core',
        bestDownloads: 10000,
        reason: 'best package @bar/core has 10000 last-week downloads',
      },
    ],
  });

  assert.match(comment, /allowPackages/);
  assert.match(comment, /allowScopes/);
  assert.match(comment, /foo/);
  assert.match(comment, /@bar/);
});
