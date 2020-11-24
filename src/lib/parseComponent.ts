import {parseHTML} from './html-parser';
import deindent from 'de-indent';
import type {SFCDescriptor, SFCBlock, ASTAttr} from '../types/index';
import {makeSet} from './utils';

const isSpecialTag = makeSet(['script', 'style', 'template'], true);
const splitRE = /\r?\n/g;
const replaceRE = /./g;

/**
 * Parse a single-file component (*.vue) file into an SFC Descriptor Object.
 */
export function parseComponent(
    content: string,
    options: {[key: string]: any} = {}
): SFCDescriptor {
    const sfc: SFCDescriptor = {
        template: undefined,
        script: undefined,
        styles: [],
        customBlocks: [],
        errors: [],
    };
    let depth = 0;
    let currentBlock: SFCBlock | undefined;

    let warn = (msg: string) => {
        sfc.errors.push(msg);
    };

    function start(
        tag: string,
        attrs: ASTAttr[],
        unary: boolean,
        start: number,
        end: number
    ) {
        if (depth === 0) {
            currentBlock = {
                type: tag,
                content: '',
                start: end,
                attrs: attrs.reduce((cumulated, {name, value}) => {
                    cumulated[name] = value || true;
                    return cumulated;
                }, {} as {[key: string]: any}),
            };
            if (isSpecialTag(tag)) {
                checkAttrs(currentBlock, attrs);
                if (tag === 'style') {
                    sfc.styles.push(currentBlock);
                }
                else {
                    // @ts-ignore
                    sfc[tag] = currentBlock;
                }
            }
            else { // custom blocks
                sfc.customBlocks.push(currentBlock);
            }
        }
        if (!unary) {
            depth++;
        }
    }

    function checkAttrs(block: SFCBlock, attrs: ASTAttr[]) {
        for (const attr of attrs) {
            if (attr.name === 'lang') {
                block.lang = attr.value;
            }
            if (attr.name === 'scoped') {
                block.scoped = true;
            }
            if (attr.name === 'module') {
                block.module = attr.value || true;
            }
            if (attr.name === 'src') {
                block.src = attr.value;
            }
        }
    }

    function end(tag: string, start: number) {
        if (depth === 1 && currentBlock) {
            currentBlock.end = start;
            let text = content.slice(currentBlock.start, currentBlock.end);
            if (options.deindent !== false) {
                text = deindent(text);
            }
            // pad content so that linters and pre-processors can output correct
            // line numbers in errors and warnings
            if (currentBlock.type !== 'template' && options.pad) {
                text = padContent(currentBlock, options.pad) + text;
            }
            currentBlock.content = text;
            currentBlock = undefined;
        }
        depth--;
    }

    function padContent(block: SFCBlock, pad: true | 'line' | 'space') {
        if (pad === 'space') {
            return content.slice(0, block.start).replace(replaceRE, ' ');
        }
        const offset = content.slice(0, block.start).split(splitRE).length;
        const padChar = block.type === 'script' && !block.lang
            ? '//\n'
            : '\n';
        return Array(offset).join(padChar);
    }

    parseHTML(content, {
        warn,
        start,
        end,
    });

    return sfc;
}