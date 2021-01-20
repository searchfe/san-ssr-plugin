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
    filePath: string,
    tsCode: string,
    styles: ExtractedCssResult[] | undefined,
    context: string,
    sanSsrOptions: sanSsrOptions,
    reportError: (err: Error) => void
) {
    if (!tsCode) {
        reportError(new Error('Ts code must be specified'));
        return;
    }

    const stylesRes = styles?.reduce((pre, cur) => {
        Object.assign(pre.locals, cur.locals);
        pre.cssCode += ('\n' + cur.cssCode);
        return pre;
    }, {locals: {}, cssCode: ''} as {locals: Record<string, string>, cssCode: string});

    const tsFilePath = changeSanFileExtension(filePath);
    let jsCode = call(tsFilePath, tsCode, context, sanSsrOptions);
    const relPath = path.relative(
        context.replace(/[^/]+$/, ''),
        filePath).replace(/\\/g, '/'
    );
    const styleId = JSON.stringify(hash(relPath));
    jsCode += makeCustomRenderFunction(
        styleId,
        stylesRes?.cssCode,
        stylesRes?.locals || {}
    );

    return jsCode;
}

function call(tsFilePath: string, fileContent: string, context: string, sanSsrOptions: sanSsrOptions) {
    const tsConfigPath = getDefaultTSConfigPath(context);
    const project = new SanProject(tsConfigPath);

    let ssrOnly = sanSsrOptions.ssrOnly;
    if (typeof sanSsrOptions.ssrOnly === 'function') {
        ssrOnly = sanSsrOptions.ssrOnly(tsFilePath);
    }

    const targetCode = project.compileToSource({
        filePath: tsFilePath,
        fileContent,
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