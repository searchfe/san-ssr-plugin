import {Store, StyleStore, TemplateStore} from './store';
import type {Compiler, RuleSetRule} from 'webpack';
import {promises as fsPromise} from 'fs';
import {parseComponent} from './lib/parseComponent';
import {compileSanToTs} from './lib/compileSanToTs';
import path from 'path';
import {callSanSsr} from './lib/callSanSsr';
import {changeSanFileExtension, autoGetJsTsPath} from './lib/utils';
import RuleSet from 'webpack/lib/RuleSet';
import {sanSsrOptions} from './types/san-ssr';
import type {
    ExtractedCssResult,
} from './types';

const {
    readFile,
} = fsPromise;

const id = 'san-ssr-loader';
export interface PluginOptions {
    /**
     * 运行时代码
     */
    runtimeHelper?: {

        /**
         * 运行时输出路径，相对于 webpack 设置的 output 目录
         */
        output?: string;

        /**
         * 指定运行时的 namespace
         */
        namespace?: string;
    };

    /**
     * 支持自定义 tsconfig 路径
     */
    tsConfigPath?: string;

    output?: {
        /**
         * 文件的输出路径，相对于 webpack 设置的 output 目录
         */
        path: string;
    } & sanSsrOptions;
    appendRenderFunction?: (
        styleId: string,
        css?: string,
        locals?: Record<string, string>,
        namedModuleCss?: Array<{
            name: string;
            css?: string;
            locals?: Record<string, string>;
        }>
    ) => string;
}

export default class SanSSRLoaderPlugin {
    runtimeHelperOutput: string;
    outputPath: string;
    sanSsrOptions: sanSsrOptions;
    initialized: boolean;
    tsConfigPath?: string;
    appendRenderFunction?: PluginOptions['appendRenderFunction'];
    constructor(options?: PluginOptions) {
        this.runtimeHelperOutput = options?.runtimeHelper?.output || 'runtimeHelpers';
        this.outputPath = options?.output?.path || '';
        this.sanSsrOptions = options?.output || {};
        this.tsConfigPath = options?.tsConfigPath;
        this.appendRenderFunction = options?.appendRenderFunction;
        this.initialized = false;
    }
    apply(compiler: Compiler) {

        if (!this.initialized) {
            addStyleLoader(compiler);
            addSanLoader(compiler);
            this.initialized = true;
        }

        compiler.hooks.thisCompilation.tap(id, compilation => {
            const styleStore = new Store() as StyleStore;
            const templateStore = new Store() as TemplateStore;
            // @ts-ignore
            compilation._styleStore = styleStore;
            // @ts-ignore
            compilation._templateStore = templateStore;

            const reportError = (err: Error) => compilation.errors.push(err);

            compilation.hooks.finishModules.tapPromise(id, async () => {
                const sanFiles = styleStore.getKeys();
                for (const filePath of sanFiles) {
                    const sanFileContent = await readFile(filePath, 'utf-8');
                    const descriptor = parseComponent(sanFileContent);

                    if (descriptor.script && descriptor.script.lang !== 'ts') {
                        compilation.errors.push(
                            new Error('.san file must be written in TypeScript!')
                        );
                        return;
                    }
                    const styles = styleStore.get(filePath) as ExtractedCssResult[];
                    const template = templateStore.get(filePath)?.[0];

                    const tsRes = compileSanToTs(
                        descriptor,
                        filePath,
                        compiler.context,
                        template,
                        reportError
                    );

                    const jsRes = callSanSsr(
                        {
                            path: filePath,
                            content: tsRes,
                        },
                        styles,
                        compiler.context,
                        {
                            ...this.sanSsrOptions,
                        },
                        reportError,
                        {
                            tsConfigPath: this.tsConfigPath,
                            appendRenderFunction: this.appendRenderFunction
                        }
                    );

                    if (jsRes) {
                        let relativeFilePath = path.relative(compiler.context, changeSanFileExtension(filePath, 'js'));
                        relativeFilePath = relativeFilePath.replace(/^src\//, '');
                        relativeFilePath = path.join(this.outputPath, relativeFilePath);
                        emitFile(relativeFilePath, jsRes);
                    }
                }
            });

            function emitFile(relativeFilePath: string, code: string) {
                // @ts-ignore
                compilation.emitAsset(relativeFilePath, {
                    source() {
                        return code;
                    },
                    size() {
                        return code.length;
                    },
                });
            }

        });

    }
}

function getLoaderByMatch(compiler: Compiler, matchExtension: string) {
    const rawRules = compiler.options.module?.rules;
    if (!rawRules) {
        throw Error('Webpack rules are not found!');
    }
    const ruleIndex = rawRules.findIndex(createMatcher(`foo.${matchExtension}`));
    if (ruleIndex < 0) {
        throw Error(`${matchExtension} rules are not found!`);
    }
    return rawRules[ruleIndex];

    function createMatcher(fakeFile: string) {
        return (rule: RuleSetRule) => {
            const clone = Object.assign({}, rule);
            delete clone.include;
            const normalized = RuleSet.normalizeRule(clone, {}, '');
            return (
                !rule.enforce
                && normalized.resource
                && normalized.resource(fakeFile)
            );
        };
    }
}

/**
 * 把 ./style-loader 加到 css-loader 后面
 *
 * @param compiler
 */
function addStyleLoader(compiler: Compiler) {
    const addedRules = new Set();
    const cssRule = getLoaderByMatch(compiler, 'css');
    addLoader(cssRule);

    addToOptionalRule('less');
    addToOptionalRule('stylus');
    addToOptionalRule('styl');
    addToOptionalRule('sass');
    addToOptionalRule('scss');

    function addToOptionalRule(rule: string) {
        let optRule;
        try {
            optRule = getLoaderByMatch(compiler, rule);
        }
        catch {
        }
        if (optRule) {
            addLoader(optRule);
        }
    }

    function addLoader(rule: RuleSetRule) {
        // 防止多次添加
        if (addedRules.has(rule)) {
            return;
        }
        addedRules.add(rule);

        if (rule.oneOf) {
            rule.oneOf.forEach(item => addLoader(item));
            return;
        }

        if (rule.use) {
            if (typeof rule.use === 'function') {
                throw Error('Css rules not support function!');
            }

            if (!Array.isArray(rule.use)) {
                rule.use = [rule.use];
            }
            const ruleIndex = rule.use.findIndex(item => {
                if (typeof item === 'string') {
                    return item === 'css-loader';
                }

                if (typeof item === 'function') {
                    return false;
                }

                return item.loader === 'css-loader';
            });

            let loaderPath = path.resolve(__dirname, './style-loader');
            loaderPath = autoGetJsTsPath(loaderPath);

            rule.use.splice(ruleIndex, 0, loaderPath);
        }
    }
}

/**
 * 把 ./san-loader 加到 san rules 的最前面
 *
 * @param compiler
 */
function addSanLoader(compiler: Compiler) {
    const cssRule = getLoaderByMatch(compiler, 'san');
    addLoader(cssRule);

    return;

    function addLoader(rule: RuleSetRule) {
        if (rule.oneOf) {
            rule.oneOf.forEach(item => addLoader(item));
            return;
        }

        if (rule.loader) {
            rule.use = rule.loader;
            delete rule.loader;
        }

        if (rule.use) {
            if (typeof rule.use === 'function') {
                throw Error('San rules not support function!');
            }

            if (!Array.isArray(rule.use)) {
                rule.use = [rule.use];
            }

            let loaderPath = path.resolve(__dirname, './san-loader');
            loaderPath = autoGetJsTsPath(loaderPath);

            rule.use.unshift(loaderPath);
        }
    }
}
