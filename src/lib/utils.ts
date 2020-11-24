import {existsSync} from 'fs';

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