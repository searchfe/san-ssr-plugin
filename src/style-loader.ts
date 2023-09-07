import type {LoaderContext} from 'webpack';
import ___CSS_LOADER_GET_URL_IMPORT___ from 'css-loader/dist/runtime/getUrl';
import ___CSS_LOADER_API_IMPORT___ from 'css-loader/dist/runtime/api';
import ___CSS_LOADER_API_SOURCEMAP_IMPORT___ from 'css-loader/dist/runtime/sourceMaps.js';
import {getRootCompilation} from './lib/utils';

interface CssRes {
    exports: {
        [id: number]: string[];
        locals: Record<string, string>;
    };
};

export default function (this: LoaderContext<Record<string, never>>, content: string) {
    const callback = this.async();

    checkIsAfterCssLoader(this);

    extractCssResult(content, this, cssRes => {
        const styleStore = getRootCompilation(this._compilation)._styleStore;
        const moduleMatch = this.resourceQuery.match(/&module=(\w+)&/);
        const moduleName = moduleMatch && moduleMatch[1] || undefined;
        styleStore.set(this.resourcePath, {
            name: moduleName,
            locals: cssRes.exports.locals,
            cssCode: cssRes.exports[0][1],
        });

        callback && callback(undefined, content);
    });
}

/**
 * 检查是否在 css-loader 后面
 *
 * @param loaderContext
 */
function checkIsAfterCssLoader(loaderContext: LoaderContext<Record<string, never>>) {
    const currentIndex = loaderContext.loaderIndex;
    const beforeLoader = loaderContext.loaders[currentIndex + 1];
    if (!beforeLoader || !beforeLoader.path.includes('css-loader')) {
        loaderContext.emitError(new Error('San-loader-php must be set after css-loader!'));
        return false;
    }

    return true;
}

/**
 * 提取 css 结果
 *
 * @param content css-loader 产出的 string
 */
function extractCssResult(
    content: string,
    loaderContext: LoaderContext<Record<string, never>>,
    callback: (res: CssRes) => void
) {
    const fileMap = {} as Record<string, string>;
    const m = content.match(/require\(['"](.*)['"]\)/g)?.map(item => {
        const r = item.match(/require\(['"](.*)['"]\)/);
        return r && r[1];
    }) || [];

    const pArr = [] as Array<Promise<unknown>>;

    m.forEach(req => {
        if (!req || /.js$/.test(req)) {
            return;
        }

        const p = new Promise<void>((resolve, reject) => {
            loaderContext.importModule(req, {}, (err, path) => {
                if (err) {
                    reject(err);
                    return;
                }

                fileMap[req] = path;
                resolve();
            });
        });

        pArr.push(p);
    });

    Promise.all(pArr)
        .then(() => {
            const mockFunc = new Function('exports', 'module', 'require', content);
            const res = {} as CssRes;
            mockFunc({}, res, (req: string) => {
                if (/css\-loader\/dist\/runtime\/getUrl.js/.test(req)) {
                    return ___CSS_LOADER_GET_URL_IMPORT___;
                }

                if (/css\-loader\/dist\/runtime\/api.js/.test(req)) {
                    return ___CSS_LOADER_API_IMPORT___;
                }

                if (/css\-loader\/dist\/runtime\/sourceMaps.js/.test(req)) {
                    return ___CSS_LOADER_API_SOURCEMAP_IMPORT___;
                }

                if (fileMap[req]) {
                    return fileMap[req];
                }

                return () => [];
            });

            callback(res);
        });
}
