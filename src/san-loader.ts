import {noop, getRootCompilation} from './lib/utils';

import type {LoaderContext} from 'webpack';

export default function (this: LoaderContext<Record<string, never>>, content: string | unknown[]) {
    const styleStore = getRootCompilation(this._compilation)._styleStore;
    const templateStore = getRootCompilation(this._compilation)._templateStore;

    const callback = this.async();
    const done = callback ? () => callback(null, content as string) : noop;

    // 放在上面两个判断的下面，是因为 watch 编译时，不会被编译的文件可能也会走 loader
    // 需要判断 san-loader 是否经过了处理，经过处理时再加入到被处理列表中
    if (!styleStore.get(this.resourcePath)) {
        styleStore.set(this.resourcePath);
    }
    // templateStore.set内容是异步的，导致watch san文件不生效
    // 因此在此同步将watch文件存起来，只是内容为空，以便 finishModules 的时候，能拿到此模板文件
    if (!templateStore.get(this.resourcePath)) {
        templateStore.set(this.resourcePath);
    }

    // .san 文件不拦截，只处理 template
    if (!(this.resourceQuery && this.resourceQuery.includes('type=template'))) {
        return done();
    }

    if (typeof content === 'string') {
        templateStore.set(this.resourcePath, content);
        done();
        return;
    }

    // aNode 或 aPack，需要请求一次原始 template
    const templateRequire = this.resource + '&compileTemplate=none';
    this.loadModule(templateRequire, err => {
        if (err) {
            callback(err);
            return;
        }

        // 只触发，不需要收集结果，中间结果会被当前 loader 再次拦截
        done();
    });
}
