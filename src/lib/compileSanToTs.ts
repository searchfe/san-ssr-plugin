import ts from 'typescript';

import type {
    SFCDescriptor,
    CompileTsOptions,
} from '../types';
import {changeSanFileExtension} from './utils';

const declareContextCode = '';

export function compileSanToTs(
    descriptor: SFCDescriptor,
    filePath: string,
    context: string,
    template: string | undefined,
    reportError: (err: Error) => void
) {
    const scripts = descriptor.script?.content;

    const tsFilePath = changeSanFileExtension(filePath);

    if (scripts) {

        const resCode = compileTypescript(scripts, filePath, {
            tsFilePath,
            context,
            template: template || descriptor.template?.content || '',
            reportError,
        });

        return resCode;
    }

    return '';
}

function compileTypescript(content: string, filePath: string, options: CompileTsOptions): string {
    const reportError = options.reportError;

    const sourceFile = ts.createSourceFile(options.tsFilePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    const codeSnippet = getCodeSnippet(sourceFile);


    if (codeSnippet.importDeclaration.length > 0) {
        processImport(codeSnippet.importDeclaration);
    }

    if (!codeSnippet.exportedClass) {
        reportError && reportError(new Error(`Export default class not found in [${filePath}].`));
        return '';
    }
    processSanClass(codeSnippet.exportedClass, options.template);

    const printer = ts.createPrinter();
    const code = declareContextCode + printer.printNode(ts.EmitHint.SourceFile, sourceFile, sourceFile);

    return code;
}

/**
 * 从 script 中提取代码
 * @param node node
 */
function getCodeSnippet(node: ts.Node) {
    let exportedClass: ts.ClassDeclaration | undefined;
    let importDeclaration: ts.ImportDeclaration[] = [];

    transform(node);

    return {
        exportedClass,
        importDeclaration,
    };

    function transform(node: ts.Node) {

        switch (node.kind) {
            case ts.SyntaxKind.ClassDeclaration: {
                if (isExportDefaultClass(node as ts.ClassDeclaration)) {
                    exportedClass = node as ts.ClassDeclaration;
                }
                break;
            }
            case ts.SyntaxKind.ImportDeclaration: {
                importDeclaration.push(node as ts.ImportDeclaration);
            }
        }

        ts.forEachChild(node, transform);
    };

    function isExportDefaultClass(node: ts.ClassDeclaration) {
        return node.modifiers
            && node.modifiers.length === 2
            && node.modifiers[0].kind === ts.SyntaxKind.ExportKeyword
            && node.modifiers[1].kind === ts.SyntaxKind.DefaultKeyword;
    }

}

function processImport(ndoes: ts.ImportDeclaration[]) {

    // 把 './xx.san' 替换为 './xx'，去掉 .san
    ndoes.forEach(node => {
        const moduleSpecifier = node.moduleSpecifier;
        if (moduleSpecifier && moduleSpecifier.kind === ts.SyntaxKind.StringLiteral) {

            // @ts-ignore
            node.moduleSpecifier = ts.createStringLiteral(
                (moduleSpecifier as ts.StringLiteral).text.replace(/.san$/, '')
            );
        }
    });
}

function processSanClass(
    node: ts.ClassDeclaration,
    template?: string
) {
    const templateMemeber = ts.createProperty(
        undefined, undefined, 'template', undefined, undefined, ts.createIdentifier(JSON.stringify(template))
    );

    // @ts-ignore
    node.members.push(templateMemeber);

    return;
}
