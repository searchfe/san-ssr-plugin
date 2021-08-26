import {existsSync} from 'fs';
import type {loader} from 'webpack';
import type {StyleStore, TemplateStore} from '../store';

export function makeSet(list: string[], expectsLowerCase?: boolean) {
    const s = new Set(list);
    return expectsLowerCase
        ? (val: string) => s.has(val.toLowerCase())
        : (val: string) => s.has(val);
}

export function changeSanFileExtension(originFilePath: string, extension: string = 'ts') {
    return originFilePath.replace(/\.(san|ts)(\.html)?$/g, '.' + extension);
}

/**
 * 自动给路径加 .js 或 .ts
 *
 * @param path
 */
export function autoGetJsTsPath(path: string) {
    if (existsSync(path + '.js')) {
        path += '.js';
    }
    else {
        path += '.ts';
    }

    return path;
}

/**
 * 提取所有调用 require 的入参字符串
 * @param content
 */
export function extractRequire(content: string): string[] {
    const filterdModules: string[] = [];
    content.match(/require\(['"](.*)['"]\)/g)?.forEach(item => {
        const r = item.match(/require\(['"](.*)['"]\)/);
        if (r && typeof r[1] === 'string') {
            filterdModules.push(r[1]);
        }
    });
    return filterdModules;
}

export function getFileLoaderExportPromise(this: loader.LoaderContext, req: string) {
    return new Promise<string>((resolve, reject) => {
        this.loadModule(req, (err, source) => {
            if (err) {
                reject(err);
                return;
            }

            // __webpack_public_path__ 在下面 eval 的时候会用到
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const __webpack_public_path__ = this._compiler.options.output?.publicPath || '';
            let path = '';

            // 这里严重依赖 file-loader 的输出格式:
            // export default __webpack_public_path__ + 'file-name.svg';
            eval(source.replace(/^export default/, 'path ='));
            resolve(path);
        });
    });
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export function getRootCompilation(compilation: any) {
    let root = compilation;
    while (root.compiler && root.compiler.parentCompilation) {
        root = root.compiler.parentCompilation;
    }

    return root as {
        _styleStore: StyleStore;
        _templateStore: TemplateStore;
    };
}
