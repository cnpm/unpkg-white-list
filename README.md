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

当然你发布的是 scoped package，可以直接添加 scope 到白名单 `allowScopes`：

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

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/32174276?v=4" width="100px;"/><br/><sub><b>semantic-release-bot</b></sub>](https://github.com/semantic-release-bot)<br/>|[<img src="https://avatars.githubusercontent.com/u/156269?v=4" width="100px;"/><br/><sub><b>fengmk2</b></sub>](https://github.com/fengmk2)<br/>|[<img src="https://avatars.githubusercontent.com/u/53730587?v=4" width="100px;"/><br/><sub><b>ChenYFan</b></sub>](https://github.com/ChenYFan)<br/>|[<img src="https://avatars.githubusercontent.com/u/57941037?v=4" width="100px;"/><br/><sub><b>AIsouler</b></sub>](https://github.com/AIsouler)<br/>|[<img src="https://avatars.githubusercontent.com/u/1191515?v=4" width="100px;"/><br/><sub><b>ydfzgyj</b></sub>](https://github.com/ydfzgyj)<br/>|[<img src="https://avatars.githubusercontent.com/u/50269993?v=4" width="100px;"/><br/><sub><b>jiakun-zhao</b></sub>](https://github.com/jiakun-zhao)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |
[<img src="https://avatars.githubusercontent.com/u/8198408?v=4" width="100px;"/><br/><sub><b>BlackHole1</b></sub>](https://github.com/BlackHole1)<br/>|[<img src="https://avatars.githubusercontent.com/u/83338746?v=4" width="100px;"/><br/><sub><b>abuits</b></sub>](https://github.com/abuits)<br/>|[<img src="https://avatars.githubusercontent.com/u/26962197?v=4" width="100px;"/><br/><sub><b>chilingling</b></sub>](https://github.com/chilingling)<br/>|[<img src="https://avatars.githubusercontent.com/u/55302758?v=4" width="100px;"/><br/><sub><b>122cygf</b></sub>](https://github.com/122cygf)<br/>|[<img src="https://avatars.githubusercontent.com/u/142392685?v=4" width="100px;"/><br/><sub><b>zsj9705</b></sub>](https://github.com/zsj9705)<br/>|[<img src="https://avatars.githubusercontent.com/u/38517192?v=4" width="100px;"/><br/><sub><b>lisonge</b></sub>](https://github.com/lisonge)<br/>

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Mon May 20 2024 13:39:03 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
