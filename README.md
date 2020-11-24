# san-ssr-plugin

San-ssr Webpack 插件，用于将 `.san` 编译为可在 Node.js 中执行的 JavaScript 文件。

需要配合 [san-loader](https://github.com/ecomfe/san-loader) 一起使用。

## 快速开始

```typescript
import webpack from 'webpack';
import SanLoaderPlugin from 'san-loader/lib/plugin';
import SanPhpLoaderPlugin from 'san-ssr-plugin';

export default {
    plugins: [
        new SanPhpLoaderPlugin({
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

## Options

## 实现原理

## 如何贡献

## 讨论


