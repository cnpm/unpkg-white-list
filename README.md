# unpkg-white-list

[![NPM version](https://img.shields.io/npm/v/unpkg-white-list.svg?style=flat-square)](https://npmjs.org/package/unpkg-white-list)
[![CI](https://github.com/cnpm/unpkg-white-list/actions/workflows/nodejs.yml/badge.svg)](https://github.com/cnpm/unpkg-white-list/actions/workflows/nodejs.yml)

- [npmmirror.com](https://npmmirror.com) 允许开启 [unpkg 功能](https://www.yuque.com/egg/cnpm/files)的白名单列表，避免 https://x.com/fengmk2/status/1791498406923215020 类似问题
  - `allowPackages` 字段：用于添加指定包名和版本号，示例：

    ```json
    "allowPackages": {
      "urllib": {
        "version": "*"
      }
    }
    ```

  - `allowScopes` 字段：用于添加指定 scope，示例：

    ```json
    "allowScopes": [
      "@eggjs",
      "@ant-design"
    ]
    ```

- npmmirror sync package tgz 超大文件白名单列表，避免 https://x.com/fengmk2/status/1999821026012889567 类似问题
  - `allowLargePackages` 字段：用于添加指定包名和版本号，示例：

    ```json
    "allowLargePackages": {
      "aws-cdk-lib": {
        "version": "*"
      }
    }
    ```

  - `allowLargeScopes` 字段：用于添加指定 scope，示例：

    ```json
    "allowLargeScopes": [
      "@next",
      "@swc"
    ]
    ```

## 添加白名单方式

> [!NOTE]
> 尽量使用 CLI 添加白名单，它可以确保字段顺序和格式正确，避免手动修改 `package.json` 文件。

### unpkg 白名单添加指定包名和版本号

用 CLI 添加你想开启 unpkg 文件同步的 npm 包名和版本号，全量同步版本号可以设置为 `*`，以同步 [urllib](https://npmmirror.com/package/urllib) 为示例：

```bash
# npm run add -- --pkg={package name}[:{version range}]
npm run add -- "--pkg=urllib" # 同步 urllib 所有版本
# or
npm run add -- "--pkg=urllib:1.0.0" # 同步 urllib 1.0.0 版本
# or
npm run add -- "--pkg=urllib:>=1.0.0" # 同步 urllib 大于等于 1.0.0 版本
```

_你将会看到 package.json 文件中的 `allowPackages` 字段被更新，如下所示：_

```json
"allowPackages": {
  ...
  "urllib": {
    "version": "*"
  }
  ...
}
```

### unpkg 白名单添加指定 scope

> [!WARNING]
> 为避免滥用，申请添加的 scope 必须已包含热门包（如周下载量超过 1 万）。我们不接受为刚创建且无热门包的 scope 添加白名单。

当然你发布的是 scoped package，可以用 CLI 添加 scope 到白名单 `allowScopes`：

```bash
npm run add -- --scope=@eggjs
```

_你将会看到 package.json 文件中的 `allowScopes` 字段被更新，如下所示：_

```json
"allowScopes": [
  ...
  "@eggjs",
  ...
]
```

### sync package tgz 超大文件白名单添加指定包名和版本号

用 CLI 添加你想开启 npmmirror sync package tgz 超大文件同步的 npm 包名和版本号，全量同步版本号可以设置为 `*`，以同步 [aws-cdk-lib](https://npmmirror.com/package/aws-cdk-lib) 为示例：

```bash
# npm run add -- --large-pkg={package name}[:{version range}]
npm run add -- "--large-pkg=aws-cdk-lib" # 同步 aws-cdk-lib 所有版本
# or
npm run add -- "--large-pkg=aws-cdk-lib:1.0.0" # 同步 aws-cdk-lib 1.0.0 版本
# or
npm run add -- "--large-pkg=aws-cdk-lib:>=1.0.0" # 同步 aws-cdk-lib 大于等于 1.0.0 版本
```

_你将会看到 package.json 文件中的 `allowLargePackages` 字段被更新，如下所示：_

```json
"allowLargePackages": {
  ...
  "aws-cdk-lib": {
    "version": "*"
  }
  ...
}
```

### sync package tgz 超大文件白名单添加指定 scope

> [!WARNING]
> 为避免滥用，申请添加的 scope 必须已包含热门包（如周下载量超过 1 万）。我们不接受为刚创建且无热门包的 scope 添加白名单。

当然你发布的是 scoped package，可以用 CLI 添加 scope 到白名单 `allowLargeScopes`：

```bash
npm run add -- --large-scope=@next
```

_你将会看到 package.json 文件中的 `allowLargeScopes` 字段被更新，如下所示：_

```json
"allowLargeScopes": [
  ...
  "@next",
  ...
]
```

## 提交 PR 并等待合并生效

修改完成后提交一个 `Pull Request` 合并到 master 分支，等待 Review，合并后会自动发布，预计最长 5 分钟后会全网生效。

### Commit Message 规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范，所有提交的 commit message 必须符合 [semantic-release](https://semantic-release.gitbook.io/) 要求。

Commit message 格式如下：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**

- `feat`: 新功能（会触发 minor 版本更新）
- `fix`: Bug 修复（会触发 patch 版本更新）
- `perf`: 性能优化（会触发 patch 版本更新）
- `docs`: 文档修改（不会触发版本更新）
- `style`: 代码格式修改（不影响代码含义，不会触发版本更新）
- `refactor`: 代码重构（不会触发版本更新）
- `test`: 测试相关修改（不会触发版本更新）
- `build`: 构建系统或依赖项修改（不会触发版本更新）
- `ci`: CI 配置文件修改（不会触发版本更新）
- `chore`: 其他不修改 src 或 test 文件的修改（不会触发版本更新）
- `revert`: 回退之前的 commit（不会触发版本更新）

**示例：**

```bash
feat: add lodash to allowPackages
feat(allowScopes): add @babel scope
fix: correct semver range validation
docs: update README with commit guidelines
```

**Breaking Changes:**

如果包含破坏性变更，需要在 type 后加 `!` 或在 footer 中说明：

```bash
feat!: remove deprecated API
# or
feat: add new feature

BREAKING CHANGE: This removes the old API
```

CI 会自动检查所有 commit message 是否符合规范，不符合规范的提交将无法通过检查。

## for admins

block sync packages and scopes:

```bash
npm run add -- --block-sync-pkg=colors
npm run add -- --block-sync-scope=@sdjkals
```

## License

[MIT](LICENSE)

## Contributors

[![Contributors](https://contrib.rocks/image?repo=cnpm/unpkg-white-list)](https://github.com/cnpm/unpkg-white-list/graphs/contributors)

Made with [contributors-img](https://contrib.rocks).
