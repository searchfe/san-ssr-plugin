import {Store, StyleStore, TemplateStore} from './store';
import {WebpackError, type Compiler, RuleSetRule} from 'webpack';
import {promises as fsPromise} from 'fs';
import {parseComponent} from './lib/parseComponent';
import {compileSanToTs} from './lib/compileSanToTs';
import path from 'path';
import {callSanSsr} from './lib/callSanSsr';
import {changeSanFileExtension, autoGetJsTsPath} from './lib/utils';
import {sanSsrOptions} from './types/san-ssr';
import type {
    ExtractedCssResult,
} from './types';
import RuleSetCompiler from 'webpack/lib/rules/RuleSetCompiler';
import BasicMatcherRulePlugin from 'webpack/lib/rules/BasicMatcherRulePlugin';
import BasicEffectRulePlugin from 'webpack/lib/rules/BasicEffectRulePlugin';
import UseEffectRulePlugin from 'webpack/lib/rules/UseEffectRulePlugin';

const {
    readFile,
} = fsPromise;

let objectMatcherRulePlugins = [];
try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const ObjectMatcherRulePlugin = require('webpack/lib/rules/ObjectMatcherRulePlugin');
    objectMatcherRulePlugins.push(
        new ObjectMatcherRulePlugin('assert', 'assertions'),
        new ObjectMatcherRulePlugin('descriptionData')
    );
}
catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const DescriptionDataMatcherRulePlugin = require('webpack/lib/rules/DescriptionDataMatcherRulePlugin');
    objectMatcherRulePlugins.push(new DescriptionDataMatcherRulePlugin());
}

const ruleSetCompiler = new RuleSetCompiler([
    new BasicMatcherRulePlugin('test', 'resource'),
    new BasicMatcherRulePlugin('mimetype'),
    new BasicMatcherRulePlugin('dependency'),
    new BasicMatcherRulePlugin('include', 'resource'),
    new BasicMatcherRulePlugin('exclude', 'resource', true),
    new BasicMatcherRulePlugin('conditions'),
    new BasicMatcherRulePlugin('resource'),
    new BasicMatcherRulePlugin('resourceQuery'),
    new BasicMatcherRulePlugin('resourceFragment'),
    new BasicMatcherRulePlugin('realResource'),
    new BasicMatcherRulePlugin('issuer'),
    new BasicMatcherRulePlugin('compiler'),
    new BasicMatcherRulePlugin('issuerLayer'),
    ...objectMatcherRulePlugins,
    new BasicEffectRulePlugin('type'),
    new BasicEffectRulePlugin('sideEffects'),
    new BasicEffectRulePlugin('parser'),
    new BasicEffectRulePlugin('resolve'),
    new BasicEffectRulePlugin('generator'),
    new BasicEffectRulePlugin('layer'),
    new UseEffectRulePlugin()
]);

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

            const reportError = (err: WebpackError) => compilation.errors.push(err);

            compilation.hooks.finishModules.tapPromise(id, async () => {
                const sanFiles = templateStore.getKeys();
                for (const filePath of sanFiles) {
                    const sanFileContent = await readFile(filePath, 'utf-8');
                    const descriptor = parseComponent(sanFileContent);

                    if (descriptor.script && descriptor.script.lang !== 'ts') {
                        compilation.errors.push(
                            new WebpackError('.san file must be written in TypeScript!')
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
    const rawRules = compiler.options.module?.rules as RuleSetRule[];
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
            if (rule.enforce) {
                return false;
            }

            const clone = Object.assign({}, rule);
            delete clone.include;
            const normalized = ruleSetCompiler.compile([clone]);
            return (
                normalized.exec({
                    resource: fakeFile
                }).length > 0
            );
        };
    }
}

/**
 * Helper function to add a loader to a rule with common logic
 *
 * @param rule The webpack rule to modify
 * @param loaderName The name of the loader file (without extension)
 * @param options Configuration options
 */
function createLoaderAdder(
    loaderName: string,
    options: {
        findTargetLoader?: string;
        insertPosition?: 'before' | 'after' | 'start';
        errorMessage?: string;
        normalizeLoader?: boolean;
        addedRulesSet?: Set<RuleSetRule>;
    } = {}
) {
    const {
        findTargetLoader,
        insertPosition = 'start',
        errorMessage = `${loaderName} rules not support function!`,
        normalizeLoader = false,
        addedRulesSet
    } = options;

    return function addLoader(rule: RuleSetRule): void {
        // 防止多次添加
        if (addedRulesSet && addedRulesSet.has(rule)) {
            return;
        }
        if (addedRulesSet) {
            addedRulesSet.add(rule);
        }

        if (rule.oneOf) {
            rule.oneOf.forEach(item => addLoader(item as RuleSetRule));
            return;
        }

        // Normalize rule.loader to rule.use
        if (normalizeLoader && rule.loader) {
            rule.use = rule.loader;
            delete rule.loader;
        }

        if (rule.use) {
            if (typeof rule.use === 'function') {
                throw Error(errorMessage);
            }

            if (!Array.isArray(rule.use)) {
                rule.use = [rule.use];
            }

            let loaderPath = path.resolve(__dirname, `./${loaderName}`);
            loaderPath = autoGetJsTsPath(loaderPath);

            if (findTargetLoader) {
                // Find the target loader and insert relative to it
                const targetIndex = rule.use.findIndex(item => {
                    if (!item) {
                        return false;
                    }
                    if (typeof item === 'string') {
                        return item === findTargetLoader;
                    }
                    if (typeof item === 'function') {
                        return false;
                    }
                    return item.loader === findTargetLoader;
                });

                if (insertPosition === 'after') {
                    rule.use.splice(targetIndex + 1, 0, loaderPath);
                }
                else {
                    rule.use.splice(targetIndex, 0, loaderPath);
                }
            }
            else if (insertPosition === 'start') {
                rule.use.unshift(loaderPath);
            }
            else {
                rule.use.push(loaderPath);
            }
        }
    };
}

/**
 * 把 ./style-loader 加到 css-loader 后面
 *
 * @param compiler
 */
function addStyleLoader(compiler: Compiler) {
    const addedRules = new Set<RuleSetRule>();
    const addLoader = createLoaderAdder('style-loader', {
        findTargetLoader: 'css-loader',
        insertPosition: 'before',
        errorMessage: 'Css rules not support function!',
        addedRulesSet: addedRules
    });

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
}

/**
 * 把 ./san-loader 加到 san rules 的最前面
 *
 * @param compiler
 */
function addSanLoader(compiler: Compiler) {
    const addLoader = createLoaderAdder('san-loader', {
        insertPosition: 'start',
        errorMessage: 'San rules not support function!',
        normalizeLoader: true
    });

    const cssRule = getLoaderByMatch(compiler, 'san');
    addLoader(cssRule);
}
