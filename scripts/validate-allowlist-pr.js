#!/usr/bin/env node

const COMMENT_MARKER = '<!-- validate-allowlist-request -->';
const NPM_REGISTRY_URL = 'https://registry.npmjs.org';
const NPM_SEARCH_URL = 'https://registry.npmjs.org/-/v1/search';
const NPM_DOWNLOADS_URL = 'https://api.npmjs.org/downloads/point/last-week';
const DEFAULT_PACKAGE_MIN_WEEKLY_DOWNLOADS = 1;
const DEFAULT_SCOPE_MIN_WEEKLY_DOWNLOADS = 10_000;

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnv(name) {
  return process.env[name] || '';
}

function isDryRun() {
  return process.env.DRY_RUN === 'true';
}

function getMinDownloads(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return value;
}

function encodePackageName(name) {
  return encodeURIComponent(name);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.headers || {}),
    },
  });

  if (response.status === 404 && options.allow404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText} ${url}\n${body}`);
  }

  return response.json();
}

function githubHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
  };
}

async function fetchPackageJsonFromGitHub({ repo, ref, token }) {
  const url = new URL(`https://api.github.com/repos/${repo}/contents/package.json`);
  url.searchParams.set('ref', ref);

  const payload = await fetchJson(url, {
    headers: githubHeaders(token),
  });

  if (payload.encoding !== 'base64' || typeof payload.content !== 'string') {
    throw new Error(`Unexpected package.json payload for ${repo}@${ref}`);
  }

  return JSON.parse(Buffer.from(payload.content, 'base64').toString('utf8'));
}

function getAddedObjectKeys(baseObject = {}, headObject = {}) {
  return Object.keys(headObject)
    .filter(key => !Object.hasOwn(baseObject, key))
    .sort();
}

function getAddedArrayItems(baseItems = [], headItems = []) {
  const baseSet = new Set(baseItems);
  return headItems
    .filter(item => !baseSet.has(item))
    .sort();
}

function getAllowlistChanges(basePackageJson, headPackageJson) {
  return {
    packages: getAddedObjectKeys(basePackageJson.allowPackages, headPackageJson.allowPackages),
    scopes: getAddedArrayItems(basePackageJson.allowScopes, headPackageJson.allowScopes),
  };
}

async function getPackageMetadata(name) {
  return fetchJson(`${NPM_REGISTRY_URL}/${encodePackageName(name)}`, { allow404: true });
}

async function getPackageDownloads(name) {
  const payload = await fetchJson(`${NPM_DOWNLOADS_URL}/${encodePackageName(name)}`, { allow404: true });
  if (!payload) {
    return null;
  }
  return Number(payload.downloads || 0);
}

async function validatePackage(name, minDownloads) {
  const metadata = await getPackageMetadata(name);
  if (!metadata) {
    return {
      type: 'package',
      name,
      passed: false,
      downloads: null,
      reason: 'npm 上没有发布这个 package',
    };
  }

  const downloads = await getPackageDownloads(name);
  if (downloads === null) {
    return {
      type: 'package',
      name,
      passed: false,
      downloads,
      latest: metadata['dist-tags']?.latest,
      createdAt: metadata.time?.created,
      reason: 'npm 最近一周下载量暂无数据',
    };
  }

  return {
    type: 'package',
    name,
    passed: downloads >= minDownloads,
    downloads,
    latest: metadata['dist-tags']?.latest,
    createdAt: metadata.time?.created,
    reason: downloads >= minDownloads
      ? `最近一周下载量 ${downloads} >= ${minDownloads}`
      : `最近一周下载量 ${downloads} < ${minDownloads}`,
  };
}

function isValidScopeName(name) {
  return typeof name === 'string' && /^@[^/]+$/.test(name);
}

async function getScopePackages(scope) {
  const url = new URL(NPM_SEARCH_URL);
  url.searchParams.set('text', `${scope}/`);
  url.searchParams.set('size', '100');

  const payload = await fetchJson(url);
  return (payload.objects || [])
    .map(item => ({
      name: item.package?.name,
      downloads: Number(item.downloads?.weekly || 0),
    }))
    .filter(item => item.name?.startsWith(`${scope}/`))
    .sort((a, b) => b.downloads - a.downloads);
}

async function validateScope(scope, minDownloads) {
  if (!isValidScopeName(scope)) {
    return {
      type: 'scope',
      name: scope,
      passed: false,
      checkedPackages: 0,
      bestPackage: null,
      bestDownloads: 0,
      reason: 'scope 必须使用 @scope 格式',
    };
  }

  const packages = await getScopePackages(scope);
  const bestPackage = packages[0] || null;
  const bestDownloads = bestPackage?.downloads || 0;

  return {
    type: 'scope',
    name: scope,
    passed: bestDownloads >= minDownloads,
    checkedPackages: packages.length,
    bestPackage: bestPackage?.name || null,
    bestDownloads,
    reason: bestDownloads >= minDownloads
      ? `最高下载包 ${bestPackage.name} 最近一周下载量为 ${bestDownloads}`
      : `该 scope 下没有 package 达到最近一周 ${minDownloads} 下载量`,
  };
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  return new Intl.NumberFormat('en-US').format(value);
}

function formatResult(result) {
  if (result.type === 'package') {
    return `| allowPackages | \`${result.name}\` | ${result.passed ? 'PASS' : 'FAIL'} | ${formatNumber(result.downloads)} | ${result.reason} |`;
  }

  return `| allowScopes | \`${result.name}\` | ${result.passed ? 'PASS' : 'FAIL'} | ${formatNumber(result.bestDownloads)} | ${result.reason}${result.bestPackage ? ` (${result.bestPackage})` : ''} |`;
}

function buildComment({ results, packageMinDownloads, scopeMinDownloads }) {
  const failed = results.filter(result => !result.passed);
  const state = failed.length === 0 ? 'PASS' : 'FAIL';

  return `${COMMENT_MARKER}
## 白名单申请自动校验：${state}

自动检查本 PR 新增的 \`allowPackages\` 和 \`allowScopes\` 条目。

- \`allowPackages\`: package 必须已发布到 npm，且最近一周下载量至少为 ${packageMinDownloads}。
- \`allowScopes\`: scope 下必须至少有一个 package 的最近一周下载量达到 ${scopeMinDownloads}。

| Field | Name | Result | Downloads | Details |
| --- | --- | --- | ---: | --- |
${results.map(formatResult).join('\n')}

该检查只验证 npm 存在性和下载量。package 是否为 library、是否存在滥用风险，仍可能需要维护者人工判断。`;
}

function buildNoChangesComment() {
  return `${COMMENT_MARKER}
## 白名单申请自动校验：PASS

当前 PR 没有新增 \`allowPackages\` 或 \`allowScopes\` 条目。`;
}

async function findValidationComment({ repo, prNumber, token }) {
  const comments = await fetchJson(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments?per_page=100`, {
    headers: githubHeaders(token),
  });
  return comments.find(comment => comment.body?.includes(COMMENT_MARKER));
}

async function updateComment({ repo, commentId, token, body }) {
  await fetchJson(`https://api.github.com/repos/${repo}/issues/comments/${commentId}`, {
    method: 'PATCH',
    headers: githubHeaders(token),
    body: JSON.stringify({ body }),
  });
}

async function upsertValidationComment({ repo, prNumber, token, body }) {
  const existing = await findValidationComment({ repo, prNumber, token });

  if (existing) {
    await updateComment({ repo, commentId: existing.id, token, body });
    return;
  }

  await fetchJson(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, {
    method: 'POST',
    headers: githubHeaders(token),
    body: JSON.stringify({ body }),
  });
}

async function updateExistingValidationComment({ repo, prNumber, token, body }) {
  const existing = await findValidationComment({ repo, prNumber, token });
  if (existing) {
    await updateComment({ repo, commentId: existing.id, token, body });
  }
}

async function main() {
  const token = getRequiredEnv('GITHUB_TOKEN');
  const repo = getRequiredEnv('GITHUB_REPOSITORY');
  const prNumber = getRequiredEnv('PR_NUMBER');
  const baseRepo = getOptionalEnv('PR_BASE_REPO') || repo;
  const headRepo = getOptionalEnv('PR_HEAD_REPO') || repo;
  const baseSha = getRequiredEnv('PR_BASE_SHA');
  const headSha = getRequiredEnv('PR_HEAD_SHA');
  const packageMinDownloads = getMinDownloads(
    'PACKAGE_MIN_WEEKLY_DOWNLOADS',
    DEFAULT_PACKAGE_MIN_WEEKLY_DOWNLOADS
  );
  const scopeMinDownloads = getMinDownloads(
    'SCOPE_MIN_WEEKLY_DOWNLOADS',
    DEFAULT_SCOPE_MIN_WEEKLY_DOWNLOADS
  );

  const [basePackageJson, headPackageJson] = await Promise.all([
    fetchPackageJsonFromGitHub({ repo: baseRepo, ref: baseSha, token }),
    fetchPackageJsonFromGitHub({ repo: headRepo, ref: headSha, token }),
  ]);

  const changes = getAllowlistChanges(basePackageJson, headPackageJson);
  if (changes.packages.length === 0 && changes.scopes.length === 0) {
    console.log('No new allowPackages or allowScopes entries found.');
    const body = buildNoChangesComment();
    if (isDryRun()) {
      console.log(body);
    } else {
      await updateExistingValidationComment({ repo, prNumber, token, body });
    }
    return;
  }

  console.log(`New allowPackages: ${changes.packages.join(', ') || '(none)'}`);
  console.log(`New allowScopes: ${changes.scopes.join(', ') || '(none)'}`);

  const results = [
    ...(await Promise.all(changes.packages.map(name => validatePackage(name, packageMinDownloads)))),
    ...(await Promise.all(changes.scopes.map(name => validateScope(name, scopeMinDownloads)))),
  ];

  for (const result of results) {
    console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.type} ${result.name}: ${result.reason}`);
  }

  const failed = results.filter(result => !result.passed);
  if (failed.length > 0) {
    const body = buildComment({ results, packageMinDownloads, scopeMinDownloads });
    if (isDryRun()) {
      console.log(body);
    } else {
      await upsertValidationComment({ repo, prNumber, token, body });
    }
    throw new Error(`${failed.length} allowlist entr${failed.length === 1 ? 'y' : 'ies'} failed validation`);
  }

  const body = buildComment({ results, packageMinDownloads, scopeMinDownloads });
  if (isDryRun()) {
    console.log(body);
  } else {
    await updateExistingValidationComment({ repo, prNumber, token, body });
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  getAddedObjectKeys,
  getAddedArrayItems,
  getAllowlistChanges,
  isValidScopeName,
  buildComment,
  buildNoChangesComment,
  isDryRun,
};
