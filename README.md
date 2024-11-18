# unpkg-white-list

[![NPM version](https://img.shields.io/npm/v/unpkg-white-list.svg?style=flat-square)](https://npmjs.org/package/unpkg-white-list)
[![CI](https://github.com/cnpm/unpkg-white-list/actions/workflows/nodejs.yml/badge.svg)](https://github.com/cnpm/unpkg-white-list/actions/workflows/nodejs.yml)

[npmmirror.com](https://npmmirror.com) 允许开启 [unpkg 功能](https://www.yuque.com/egg/cnpm/files)的白名单列表，避免 https://x.com/fengmk2/status/1791498406923215020 类似问题

## 添加白名单方式

> [!NOTE]
> 尽量使用 CLI 添加白名单，它可以确保字段顺序和格式正确，避免手动修改 `package.json` 文件。

### 添加指定包名和版本号

用 CLI 添加你想开启 unpkg 文件同步的 npm 包名和版本号，全量同步版本号可以设置为 `*`，以同步 [urllib](https://npmmirror.com/package/urllib) 为示例：

```bash
npm run add -- --pkg=urllib:* # 同步 urllib 所有版本
# or
npm run add -- --pkg=urllib:1.0.0 # 同步 urllib 1.0.0 版本
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

### 添加指定 scope

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

2、修改完成后提交一个 `Pull Request` 合并到 master 分支，等待 Review，合并后会自动发布，预计最长 5 分钟后会全网生效。

## License

[MIT](LICENSE)

## Contributors

[![Contributors](https://contrib.rocks/image?repo=cnpm/unpkg-white-list)](https://github.com/cnpm/unpkg-white-list/graphs/contributors)

Made with [contributors-img](https://contrib.rocks).
