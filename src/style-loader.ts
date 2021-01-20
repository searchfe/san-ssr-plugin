import {styleStore} from './styles-store';

import type {loader} from 'webpack';
import ___CSS_LOADER_GET_URL_IMPORT___ from 'css-loader/dist/runtime/getUrl';

interface CssRes {
    exports: {
        [id: number]: string[];
        locals: Record<string, string>;
    };
};

export default function (this: loader.LoaderContext, content: string) {
    const callback = this.async();

    checkIsAfterCssLoader(this);

    extractCssResult(content, this, cssRes => {
        styleStore.set(this.resourcePath, {
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
function checkIsAfterCssLoader(loaderContext: loader.LoaderContext) {
    const currentIndex = loaderContext.loaderIndex;
    const beforeLoader = loaderContext.loaders[currentIndex + 1];
    if (!beforeLoader || !beforeLoader.path.includes('css-loader')) {
        loaderContext.emitError('San-loader-php must be set after css-loader!');
        return false;
    }

    return true;
}

/**
 * 提取 css 结果
 *
 * @param content css-loader 产出的 string
 */
function extractCssResult(content: string, loaderContext: loader.LoaderContext, callback: (res: CssRes) => void) {
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
            loaderContext.loadModule(req, (err, source) => {
                if (err) {
                    reject(err);
                    return;
                }

                let path = '';

                // 这里严重依赖 file-loader 的输出格式:
                // export default __webpack_public_path__ + 'file-name.svg';
                eval(source.replace(/^export default/, 'path ='));

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

                if (fileMap[req]) {
                    return fileMap[req];
                }

                return () => [];
            });

            callback(res);
        });
}
