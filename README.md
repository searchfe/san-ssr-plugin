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

## 自定义样式输出格式

san-ssr 本身不负责样式的处理。本插件通过封装 san-ssr 产物（render 函数）的形式处理样式产物：

```javascript
if (css) {
    code += 'const originSanSSRRenders = module.exports.sanSSRRenders;\n';
    code += 'Object.keys(originSanSSRRenders).forEach(renderName => {\n';
    code += '    originSanSSRRenders[renderName] = makeRender(originSanSSRRenders[renderName]);\n';
    code += '});\n';
    code += 'module.exports = Object.assign(sanSSRResolver.getRenderer({id: "default"}), exports);\n';
    code += 'function makeRender(originRender) {\n';
    code += '    return function (data, ...params) {\n';
    code += '        if (global.__COMPONENT_CONTEXT__) {\n';
    code += `            global.__COMPONENT_CONTEXT__[${styleId}] = ${JSON.stringify(css)};\n`;
    code += '        }\n';
    if (Object.keys(locals).length > 0) {
        code += '        data[\'$style\'] = {\n';
        code += `            ${Object.keys(locals).map(item =>
            `${JSON.stringify(item)}: ${JSON.stringify(locals[item])}`
        ).join(',')}\n`;
        code += '        };\n';
    }
    code += '        return originRender(data, ...params);\n';
    code += '    };\n';
    code += '}\n';
}
```

这段代码会添加在产物的最后，作为输出。

如果该内容不能满足要求，使用者可通过 `appendRenderFunction` 选项自行设置该内容:

```javascript
plugins: [
    new SanSsrPlugin({
        appendRenderFunction(
            styleId: string,
            css: string = '',
            locals: Record<string, string>,
            namedModuleCss: Array<{
                name: string;
                css?: string;
                locals?: Record<string, string>;
            }> = []
        ) {
            return ``;
        }
    })
]
```

参数的具体内容可参考上方默认的输出。

<!-- ## Options

## 实现原理

## 如何贡献

## 讨论 -->
