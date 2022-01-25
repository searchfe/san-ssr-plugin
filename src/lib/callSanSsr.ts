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
        Object.assign(pre.locals, cur.locals);
        pre.cssCode += ('\n' + cur.cssCode);
        return pre;
    }, {locals: {}, cssCode: ''} as {locals: Record<string, string>, cssCode: string});

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
        stylesRes?.cssCode,
        stylesRes?.locals || {}
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

    let ssrOnly = sanSsrOptions.ssrOnly;
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
    locals: Record<string, string>
) {

    let code = '';
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

    return code;
}