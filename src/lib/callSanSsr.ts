import {SanProject} from 'san-ssr';
import path from 'path';
import fs from 'fs';
import {changeSanFileExtension} from './utils';
import hash from 'hash-sum';
import type {
    ExtractedCssResult,
} from '../types';
import type {sanSsrOptions} from '../types/san-ssr';

export function callSanSsr(
    tsFile: {
        path: string;
        content: string;
    },
    styles: ExtractedCssResult[] | undefined,
    context: string,
    sanSsrOptions: sanSsrOptions,
    reportError: (err: Error) => void,
    options?: {
        tsConfigPath?: string;
        appendRenderFunction?: typeof makeCustomRenderFunction;
    }
) {
    const {
        tsConfigPath,
        appendRenderFunction = makeCustomRenderFunction
    } = options || {};
    if (!tsFile.content) {
        reportError(new Error('Ts code must be specified'));
        return;
    }

    const stylesRes = styles?.reduce((pre, cur) => {
        if (cur.name) {
            pre.namedStyle.push({
                name: cur.name,
                locals: cur.locals,
                cssCode: cur.cssCode
            });
        }
        else {
            Object.assign(pre.defaultStyle.locals, cur.locals);
            pre.defaultStyle.cssCode += ('\n' + cur.cssCode);
        }
        return pre;
    }, {
        defaultStyle: {
            locals: {},
            cssCode: ''
        } as ExtractedCssResult,
        namedStyle: [] as ExtractedCssResult[]
    });

    const tsFilePath = changeSanFileExtension(tsFile.path);
    let jsCode = call(
        {
            path: tsFilePath,
            content: tsFile.content,
        },
        context,
        sanSsrOptions,
        tsConfigPath
    );
    const relPath = path.relative(
        context.replace(/[^/]+$/, ''),
        tsFile.path).replace(/\\/g, '/'
    );
    const styleId = JSON.stringify(hash(relPath));
    jsCode += appendRenderFunction(
        styleId,
        stylesRes?.defaultStyle.cssCode,
        stylesRes?.defaultStyle.locals || {},
        stylesRes?.namedStyle.map(item => Object.assign({}, item, {
            css: item.cssCode
        })) as Array<{
            name: string;
            css?: string;
            locals?: Record<string, string>;
        }>
    );

    return jsCode;
}

function call(
    tsFile: {
        path: string;
        content: string;
    },
    context: string,
    sanSsrOptions: sanSsrOptions,
    tsConfigPath?: string
) {
    if (!tsConfigPath) {
        tsConfigPath = getDefaultTSConfigPath(context);
    }

    const project = new SanProject(tsConfigPath);

    let ssrOnly = sanSsrOptions.ssrOnly as boolean;
    if (typeof sanSsrOptions.ssrOnly === 'function') {
        ssrOnly = sanSsrOptions.ssrOnly(tsFile.path);
    }

    const targetCode = project.compileToSource({
        filePath: tsFile.path,
        fileContent: tsFile.content,
    }, 'js', {
        ...sanSsrOptions,
        ssrOnly,
        renderFunctionName: 'originRender',
    });
    return targetCode;

    function getDefaultTSConfigPath(dir: string) {
        while (true) {
            const filepath = path.resolve(dir, 'tsconfig.json');
            if (fs.existsSync(filepath)) {
                return filepath;
            }
            if (path.dirname(dir) === dir) {
                return;
            }
            dir = path.dirname(dir);
        }
    }
}

function makeCustomRenderFunction(
    styleId: string,
    css: string = '',
    locals: Record<string, string>,
    namedModuleCss: Array<{
        name: string;
        css?: string;
        locals?: Record<string, string>;
    }> = []
) {

    let code = '';

    css = namedModuleCss.reduce((acc, cur) => {
        if (cur.css) {
            acc += `\n${cur.css}`;
        }
        return acc;
    }, css);

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
        namedModuleCss.forEach(({name, locals}) => {
            if (locals) {
                if (Object.keys(locals).length > 0) {
                    code += `        data[\'$${name}\'] = {\n`;
                    code += `            ${Object.keys(locals).map(item =>
                        `${JSON.stringify(item)}: ${JSON.stringify(locals[item])}`
                    ).join(',')}\n`;
                    code += '        };\n';
                }
            }
        });
        code += '        return originRender(data, ...params);\n';
        code += '    };\n';
        code += '}\n';
    }

    return code;
}
