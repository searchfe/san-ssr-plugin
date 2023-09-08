import {existsSync} from 'fs';
import type {StyleStore, TemplateStore} from '../store';

export function makeSet(list: string[], expectsLowerCase?: boolean) {
    const s = new Set(list);
    return expectsLowerCase
        ? (val: string) => s.has(val.toLowerCase())
        : (val: string) => s.has(val);
}

export function changeSanFileExtension(originFilePath: string, extension: string = 'ts') {
    return originFilePath.replace(/\.(san|ts)(\.html)?$/g, '.' + extension);
}

/**
 * 自动给路径加 .js 或 .ts
 *
 * @param path
 */
export function autoGetJsTsPath(path: string) {
    if (existsSync(path + '.js')) {
        path += '.js';
    }
    else {
        path += '.ts';
    }

    return path;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export function getRootCompilation(compilation: any) {
    let root = compilation;
    while (root.compiler && root.compiler.parentCompilation) {
        root = root.compiler.parentCompilation;
    }

    return root as {
        _styleStore: StyleStore;
        _templateStore: TemplateStore;
    };
}
