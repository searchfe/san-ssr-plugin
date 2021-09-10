import type {TemplateResult} from './store';
import {noop, extractRequire, getFileLoaderExportPromise, getRootCompilation} from './lib/utils';

import type {loader} from 'webpack';
import ___HTML_LOADER_GET_URL_IMPORT___ from 'html-loader/dist/runtime/getUrl';

export default function (this: loader.LoaderContext, content: string) {
    const styleStore = getRootCompilation(this._compilation)._styleStore;
    const templateStore = getRootCompilation(this._compilation)._templateStore;
    styleStore.set(this.resourcePath);

    const callback = this.async();
    const done = callback ? () => callback(null, content) : noop;

    if (this.resourceQuery && this.resourceQuery.includes('lang=')) {
        return done();
    }

    const templateRequireCalls = extractRequire(content)
        .filter(req => req.includes('type=template'));

    if (!templateRequireCalls.length) {
        return done();
    }

    const pArr = [] as Array<Promise<void>>;
    templateRequireCalls.map(templateRequire => {
        this.loadModule(templateRequire, (err, source) => {
            if (err) {
                return pArr.push(Promise.reject(err));
            }
            const p = extractTemplatePromise.call(this, source)
                .then(res => {
                    templateStore.set(this.resourcePath, res);
                });
            pArr.push(p);
        });
    });
    Promise.all(pArr).then(() => done());
}

/**
 * 提取 template 结果
 *
 * @param content loadModule('/path/to/example.san?lang=html&san=&type=template') 产出的 string
 */

function extractTemplatePromise(this: loader.LoaderContext, source: string): Promise<TemplateResult> {
    const pArr = [] as Array<Promise<void>>;
    const fileMap = {} as Record<string, string>;
    const res = {} as any;
    extractRequire(source).map(req => {
        if (/html\-loader\/dist\/runtime\/getUrl.js/.test(req)) {
            fileMap[req] = ___HTML_LOADER_GET_URL_IMPORT___;
            return;
        }
        const p = getFileLoaderExportPromise.call(this, req).then(res => {
            fileMap[req] = res;
        });
        pArr.push(p);
    });

    return Promise.all(pArr).then(() => {
        const mockFunc = new Function('exports', 'module', 'require', source);
        mockFunc({}, res, (req: string) => fileMap[req]);
        return res.exports;
    });
}
