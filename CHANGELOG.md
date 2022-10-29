## [1.5.2](https://github.com/searchfe/san-ssr-plugin/compare/v1.5.1...v1.5.2) (2022-10-29)


### Bug Fixes

* importing css file leads to error ([#17](https://github.com/searchfe/san-ssr-plugin/issues/17)) ([12ba1e0](https://github.com/searchfe/san-ssr-plugin/commit/12ba1e0eedf0bdd5f5cb5e12d4f5931fe4ca298d))

## [1.5.1](https://github.com/searchfe/san-ssr-plugin/compare/v1.5.0...v1.5.1) (2022-08-10)


### Bug Fixes

* style loader export error ([4abf9db](https://github.com/searchfe/san-ssr-plugin/commit/4abf9dbb88835b71765367406de084337087cea2))

# [1.5.0](https://github.com/searchfe/san-ssr-plugin/compare/v1.4.4...v1.5.0) (2022-04-06)


### Bug Fixes

* add ut for named module on style tag ([8bad397](https://github.com/searchfe/san-ssr-plugin/commit/8bad397c891e4ddf0016d1ea7fe18383c52e8439))


### Features

* split name module style block ([da0a0aa](https://github.com/searchfe/san-ssr-plugin/commit/da0a0aa6a0d52fc0b9032f5719d489fe372cc074))

## [1.4.4](https://github.com/searchfe/san-ssr-plugin/compare/v1.4.3...v1.4.4) (2022-01-25)


### Bug Fixes

* 产物格式错误 ([ea88306](https://github.com/searchfe/san-ssr-plugin/commit/ea88306d7e0b15c02a1e737030e82606b4f5d4a5))

## [1.4.3](https://github.com/searchfe/san-ssr-plugin/compare/v1.4.2...v1.4.3) (2022-01-24)


### Bug Fixes

* watch 编译时，样式丢失 ([def9e38](https://github.com/searchfe/san-ssr-plugin/commit/def9e38803f3f238640294cd338b4e16d18e9a71))

## [1.4.2](https://github.com/searchfe/san-ssr-plugin/compare/v1.4.1...v1.4.2) (2021-12-23)


### Bug Fixes

* css 与 less 等规则没有写在一起时，只会给 css 规则增加 loader ([621490a](https://github.com/searchfe/san-ssr-plugin/commit/621490a6a423f721f7341861186fa3171a8a3230))

## [1.4.1](https://github.com/searchfe/san-ssr-plugin/compare/v1.4.0...v1.4.1) (2021-09-10)


### Bug Fixes

* [#5](https://github.com/searchfe/san-ssr-plugin/issues/5) ([b8376d5](https://github.com/searchfe/san-ssr-plugin/commit/b8376d5f243280adada1db1cf7c6afb0a25d5bd6))

# [1.4.0](https://github.com/searchfe/san-ssr-plugin/compare/v1.3.3...v1.4.0) (2021-09-10)


### Features

* 支持 append 自定义内容到编译结果中 [#4](https://github.com/searchfe/san-ssr-plugin/issues/4) ([a371d37](https://github.com/searchfe/san-ssr-plugin/commit/a371d3758facdb826c6cdd222fb0c6bdb30c425a))

## [1.3.3](https://github.com/searchfe/san-ssr-plugin/compare/v1.3.2...v1.3.3) (2021-08-26)


### Bug Fixes

* 与 MiniCssExtractPlugin 一起使用时，会多次编译/缺少样式 ([f85c40f](https://github.com/searchfe/san-ssr-plugin/commit/f85c40fa51989549a17febedf91e4d9fa41e24d0))

## [1.3.2](https://github.com/searchfe/san-ssr-plugin/compare/v1.3.1...v1.3.2) (2021-08-16)


### Bug Fixes

* 使用 template store 获取 key，解决组件中没有 style 不会进行编译的问题 ([bbae0c4](https://github.com/searchfe/san-ssr-plugin/commit/bbae0c4641ab5982b3b678ae222bdbfe95f90bf4))
* 将 store 与 compilation 进行绑定 ([e3ec2c9](https://github.com/searchfe/san-ssr-plugin/commit/e3ec2c99ffa5e5fef64a8c7610a6c1657999741b))

## [1.3.1](https://github.com/searchfe/san-ssr-plugin/compare/v1.3.0...v1.3.1) (2021-08-16)


### Bug Fixes

* 没有传 template 时，会将 script 作为字符串输出 ([336a1af](https://github.com/searchfe/san-ssr-plugin/commit/336a1af32f7c34590781eaff7e612fa82716688b))

# [1.3.0](https://github.com/searchfe/san-ssr-plugin/compare/v1.2.0...v1.3.0) (2021-06-15)


### Features

* 支持自定义 tsConfigPath ([98d62b1](https://github.com/searchfe/san-ssr-plugin/commit/98d62b1885bd8c331e23feb2e4c30c9bebed90bc))

# [1.2.0](https://github.com/searchfe/san-ssr-plugin/compare/v1.1.4...v1.2.0) (2021-04-01)


### Features

* template 中引用的静态资源 resolve 成打包后的真实地址 ([ad12609](https://github.com/searchfe/san-ssr-plugin/commit/ad12609e31805a3da090ed49923c3af538a071c7))

## [1.1.4](https://github.com/searchfe/san-ssr-plugin/compare/v1.1.3...v1.1.4) (2021-03-12)


### Bug Fixes

* 多次执行时，loader 会添加多次 ([657bb08](https://github.com/searchfe/san-ssr-plugin/commit/657bb082225b4217d972b8e47c1c56fbbfc84688))

## [1.1.3](https://github.com/searchfe/san-ssr-plugin/compare/v1.1.2...v1.1.3) (2021-01-21)


### Bug Fixes

*  build before release ([f010e62](https://github.com/searchfe/san-ssr-plugin/commit/f010e62ec45401dd3313957bea0c51343d7d163b))

## [1.1.2](https://github.com/searchfe/san-ssr-plugin/compare/v1.1.1...v1.1.2) (2021-01-20)


### Bug Fixes

* config release ([6197ed3](https://github.com/searchfe/san-ssr-plugin/commit/6197ed32e3291b19a14d2cfdb3084ea5551c7896))
* test ([8eba500](https://github.com/searchfe/san-ssr-plugin/commit/8eba500bfca981b3566e14e87f37b5d0a0f187fa))
