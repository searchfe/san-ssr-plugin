import type {TemplateResult} from './store';
import {noop, extractRequire, getFileLoaderExportPromise, getRootCompilation} from './lib/utils';

import type {loader} from 'webpack';
import ___HTML_LOADER_GET_URL_IMPORT___ from 'html-loader/dist/runtime/getUrl';

export default function (this: loader.LoaderContext, content: string) {
    const styleStore = getRootCompilation(this._compilation)._styleStore;
    const templateStore = getRootCompilation(this._compilation)._templateStore;

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

    // 放在上面两个判断的下面，是因为 watch 编译时，不会被编译的文件可能也会走 loader
    // 需要判断 san-loader 是否经过了处理，经过处理时再加入到被处理列表中
    styleStore.set(this.resourcePath);
    // templateStore.set内容是异步的，导致watch san文件不生效
    // 因此在此同步将watch文件存起来，只是内容为空，以便 finishModules 的时候，能拿到此模板文件
    templateStore.set(this.resourcePath);

    const pArr = [] as Array<Promise<void>>;
    templateRequireCalls.map(templateRequire => {
        templateRequire += '&compileTemplate=none';
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
