# unpkg-white-list

[![NPM version](https://img.shields.io/npm/v/unpkg-white-list.svg?style=flat-square)](https://npmjs.org/package/unpkg-white-list)
[![CI](https://github.com/cnpm/unpkg-white-list/actions/workflows/nodejs.yml/badge.svg)](https://github.com/cnpm/unpkg-white-list/actions/workflows/nodejs.yml)

[npmmirror.com](https://npmmirror.com) 允许开启 [unpkg 功能](https://www.yuque.com/egg/cnpm/files)的白名单列表，避免 https://x.com/fengmk2/status/1791498406923215020 类似问题

## 添加白名单方式

1、直接在线修改 [package.json](https://github.com/cnpm/unpkg-white-list/edit/master/package.json) 中的 `allowPackages` 字段，
添加你想开启 unpkg 文件同步的 npm 包名和版本号，全量同步版本号可以设置为 `*`。

以同步 [urllib](https://npmmirror.com/package/urllib) 为示例，配置如下：

```json
"allowPackages": {
  ...
  "urllib": {
    "version": "*"
  }
  ...
}
```

2、修改完成后提交一个 `Pull Request` 合并到 master 分支，等待 Review，合并后会自动发布，预计最长 5 分钟后会全网生效。

## License

[MIT](LICENSE)

<!-- GITCONTRIBUTOR_START -->

## 贡献者

|[<img src="https://avatars.githubusercontent.com/u/156269?v=4" width="100px;"/><br/><sub><b>fengmk2</b></sub>](https://github.com/fengmk2)<br/>|
| :---: |


[git-contributor 说明](https://github.com/xudafeng/git-contributor)，自动生成时间：`Sat May 18 2024 09:02:24 GMT+0800`。

<!-- GITCONTRIBUTOR_END -->
