# san-ssr-plugin

San-ssr Webpack 插件，用于将 `.san` 编译为可在 Node.js 中执行的 JavaScript 文件。

需要配合 [san-loader](https://github.com/ecomfe/san-loader) 一起使用。

![Language](https://img.shields.io/badge/-TypeScript-blue.svg)
[![npm package](https://img.shields.io/npm/v/san-ssr-plugin.svg)](https://www.npmjs.org/package/san-ssr-plugin)
[![npm package](https://github.com/searchfe/san-ssr-plugin/workflows/CI/badge.svg)](https://github.com/searchfe/san-ssr-plugin/actions)
[![npm package](https://img.shields.io/coveralls/github/searchfe/san-ssr-plugin.svg)](https://coveralls.io/github/searchfe/san-ssr-plugin?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)]()

## 快速开始

```typescript
import webpack from 'webpack';
import SanLoaderPlugin from 'san-loader/lib/plugin';
import SanSSRPlugin from 'san-ssr-plugin';

export default {
    plugins: [
        new SanSSRPlugin({
            output: {
                path: 'js',
            }
        }),
        new SanLoaderPlugin()
    ],
    resolve: {
        extensions: ['.san'],
    },
    module: {
        rules: [
            {
                test: /\.san$/,
                loader: 'san-loader',
            }
        ],
    }
};

```

## 测试

```shell
npm run test
```

<!-- ## Options

## 实现原理

## 如何贡献

## 讨论 -->


