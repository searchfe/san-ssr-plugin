export interface sanSsrOptions {
    /**
     * 只在服务端渲染，客户端无法反解，可用来减少渲染标记
     */
    ssrOnly?: boolean | ((filePath: string) => boolean);
    importHelpers?: string;
}