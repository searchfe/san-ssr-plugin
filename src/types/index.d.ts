import {WebpackError} from 'webpack';

export interface SFCBlock {
    type: string;
    content: string;
    attrs: Record<string, string>;
    start?: number;
    end?: number;
    lang?: string;
    src?: string;
    scoped?: boolean;
    module?: string | boolean;
}

export interface SFCDescriptor {
    template: SFCBlock | undefined;
    script: SFCBlock | undefined;
    styles: SFCBlock[];
    customBlocks: SFCBlock[];
    errors: string[];
}

export interface ASTAttr {
    name: string;
    value: any;
    dynamic?: boolean;
    start?: number;
    end?: number;
};

export interface ExtractedCssResult {
    name?: string;
    cssCode: string;
    locals?: Record<string, string> | undefined;
}

export interface CompileTsOptions {
    tsFilePath: string;
    context: string;
    template?: string;
    reportError?: (err: WebpackError) => void;
}
