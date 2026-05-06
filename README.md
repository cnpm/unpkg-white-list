# unpkg-white-list

[![NPM version](https://img.shields.io/npm/v/unpkg-white-list.svg?style=flat-square)](https://npmjs.org/package/unpkg-white-list)
[![CI](https://github.com/cnpm/unpkg-white-list/actions/workflows/nodejs.yml/badge.svg)](https://github.com/cnpm/unpkg-white-list/actions/workflows/nodejs.yml)

> [!IMPORTANT]
> **🚫 禁止添加 GKD 订阅规则相关的包**
>
> 本项目 **不接受** 任何与 [GKD（去广告/跳广告）](https://github.com/gkd-kit/gkd) 订阅规则相关的包申请，包括但不限于包名或 scope 中包含 `gkd`、`gkd-subscription`、`gkd_subscription` 等关键词的包。
>
> **原因：** 这类包不是真正的 npm library，而是利用 npmmirror CDN 来分发 GKD 广告屏蔽订阅规则文件，属于滥用 CDN 资源。此类 PR 将被直接关闭。

## 文件布局

为了让 PR Review 更清晰，所有白名单/黑名单数据均拆分到独立的 JSON 文件中，作为唯一的可信来源（source of truth）。`npm publish` 前，通过 `prepack` 钩子自动将这些数据合并回 `package.json` 的对应字段，发布到 npm 的 tarball 中保持原有结构，下游消费者（如 npmmirror）的读取路径不变。

```text
data/
  allowScopes.json        # 数组：开启 unpkg 的 scope 列表
  allowPackages.json      # 对象：开启 unpkg 的包名与版本范围
  allowLargeScopes.json   # 数组：超大文件同步的 scope 列表
  allowLargePackages.json # 对象：超大文件同步的包名与版本范围
  blockSyncScopes.json    # 数组：禁止同步的 scope 列表（admin 维护）
  blockSyncPackages.json  # 数组：禁止同步的包名（admin 维护）
```

> [!IMPORTANT]
> 不要直接手工编辑 `package.json` 来添加白名单条目——任何写入都会在下次 `npm pack` / `npm publish` 时被 `prepack` 覆盖。请编辑 `data/*.json`，或使用下文的 CLI（`npm run add ...`）。

- [npmmirror.com](https://npmmirror.com) 允许开启 [unpkg 功能](https://www.yuque.com/egg/cnpm/files)的白名单列表，避免 https://x.com/fengmk2/status/1791498406923215020 类似问题
  - `data/allowPackages.json`（发布后映射为 `package.json` 的 `allowPackages` 字段）：用于添加指定包名和版本号，示例：

    ```json
    {
      "urllib": {
        "version": "*"
      }
    }
    ```

  - `data/allowScopes.json`（发布后映射为 `package.json` 的 `allowScopes` 字段）：用于添加指定 scope，示例：

    ```json
    [
      "@eggjs",
      "@ant-design"
    ]
    ```

- npmmirror sync package tgz 超大文件白名单列表，避免 https://x.com/fengmk2/status/1999821026012889567 类似问题
  - `data/allowLargePackages.json`（发布后映射为 `package.json` 的 `allowLargePackages` 字段）：用于添加指定包名和版本号，示例：

    ```json
    {
      "aws-cdk-lib": {
        "version": "*"
      }
    }
    ```

  - `data/allowLargeScopes.json`（发布后映射为 `package.json` 的 `allowLargeScopes` 字段）：用于添加指定 scope，示例：

    ```json
    [
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

_你将会看到 `data/allowPackages.json` 文件被更新，如下所示：_

```json
{
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

_你将会看到 `data/allowScopes.json` 文件被更新，如下所示：_

```json
[
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

_你将会看到 `data/allowLargePackages.json` 文件被更新，如下所示：_

```json
{
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

_你将会看到 `data/allowLargeScopes.json` 文件被更新，如下所示：_

```json
[
  ...
  "@next",
  ...
]
```

## 提交 PR 并等待合并生效

修改完成后提交一个 `Pull Request` 合并到 master 分支，等待 Review，合并后会自动发布，预计最长 5 分钟后会全网生效。

### Pull Request 标题规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范，所有 Pull Request 的标题必须符合 [semantic-release](https://semantic-release.gitbook.io/) 要求。

由于本项目使用 squash 合并方式，最终的 commit message 会基于 PR 标题生成，因此 PR 标题格式如下：

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

CI 会自动检查 Pull Request 标题是否符合规范，不符合规范的 PR 将无法通过检查。

## for admins

block sync packages and scopes（分别写入 `data/blockSyncPackages.json` 和 `data/blockSyncScopes.json`）:

```bash
npm run add -- --block-sync-pkg=colors
npm run add -- --block-sync-scope=@sdjkals
```

## License

[MIT](LICENSE)

## Contributors

[![Contributors](https://contrib.rocks/image?repo=cnpm/unpkg-white-list)](https://github.com/cnpm/unpkg-white-list/graphs/contributors)

Made with [contributors-img](https://contrib.rocks).
