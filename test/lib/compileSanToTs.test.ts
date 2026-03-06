import {compileSanToTs} from '../../src/lib/compileSanToTs';

// 模拟 reportError 函数
const mockReportError = jest.fn();

describe('compileSanToTs', () => {
    describe('isExportDefaultClass', () => {
        it('should return false for class without modifiers', () => {
            // 测试没有导出默认类的情况
            mockReportError.mockClear();
            const result = compileSanToTs(
                {
                    script: {
                        type: 'script', content: 'class Test {}', attrs: {}
                    },
                    template: undefined,
                    styles: [],
                    customBlocks: [],
                    errors: []
                },
                'test.san',
                '',
                undefined,
                mockReportError
            );
            expect(result).toBe('');
            expect(mockReportError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Export default class not found')
                })
            );
        });

        it('should return false for class with only export modifier', () => {
            // 测试只有 export 修饰符的情况
            mockReportError.mockClear();
            const result = compileSanToTs(
                {
                    script: {
                        type: 'script', content: 'export class Test {}', attrs: {}
                    },
                    template: undefined,
                    styles: [],
                    customBlocks: [],
                    errors: []
                },
                'test.san',
                '',
                undefined,
                mockReportError
            );
            expect(result).toBe('');
            expect(mockReportError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Export default class not found')
                })
            );
        });

        it('should return true for class with export and default modifiers', () => {
            // 测试同时有 export 和 default 修饰符的情况
            mockReportError.mockClear();
            const result = compileSanToTs(
                {
                    script: {
                        type: 'script', content: 'export default class Test {}', attrs: {}
                    },
                    template: undefined,
                    styles: [],
                    customBlocks: [],
                    errors: []
                },
                'test.san',
                '',
                '<div></div>',
                mockReportError
            );
            expect(result).toContain('export default class Test');
            expect(result).toContain('template');
            expect(mockReportError).not.toHaveBeenCalled();
        });

        it('should return true for class with decorators and export default modifiers', () => {
            // 测试带有装饰器的导出默认类的情况
            mockReportError.mockClear();
            const result = compileSanToTs(
                {
                    script: {
                        type: 'script', content: '@decorator1 @decorator2 export default class Test {}', attrs: {}
                    },
                    template: undefined,
                    styles: [],
                    customBlocks: [],
                    errors: []
                },
                'test.san',
                '',
                '<div></div>',
                mockReportError
            );
            expect(result).toContain('@decorator1');
            expect(result).toContain('@decorator2');
            expect(result).toContain('export default class Test');
            expect(result).toContain('template');
            expect(mockReportError).not.toHaveBeenCalled();
        });
    });

    describe('compileSanToTs', () => {
        it('should return empty string when no script content', () => {
            const result = compileSanToTs(
                {
                    script: undefined,
                    template: undefined,
                    styles: [],
                    customBlocks: [],
                    errors: []
                },
                'test.san',
                '',
                undefined,
                mockReportError
            );
            expect(result).toBe('');
        });

        it('should report error when no export default class', () => {
            const result = compileSanToTs(
                {
                    script: {
                        type: 'script', content: 'class Test {}', attrs: {}
                    },
                    template: undefined,
                    styles: [],
                    customBlocks: [],
                    errors: []
                },
                'test.san',
                '',
                undefined,
                mockReportError
            );
            expect(result).toBe('');
            expect(mockReportError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Export default class not found')
                })
            );
        });

        it('should compile successfully when export default class exists', () => {
            const result = compileSanToTs(
                {
                    script: {
                        type: 'script', content: 'class Test {}', attrs: {}
                    },
                    template: undefined,
                    styles: [],
                    customBlocks: [],
                    errors: []
                },
                'test.san',
                '',
                undefined,
                mockReportError
            );
            expect(result).toBe('');
            expect(mockReportError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Export default class not found')
                })
            );
        });

        it('should compile successfully when export default class exists', () => {
            const result = compileSanToTs(
                {
                    script: {
                        type: 'script', content: 'export default class Test {}', attrs: {}
                    },
                    template: undefined,
                    styles: [],
                    customBlocks: [],
                    errors: []
                },
                'test.san',
                '',
                '<div></div>',
                mockReportError
            );
            expect(result).toContain('export default class Test');
            expect(result).toContain('template');
        });

        it('should compile successfully when export default class with decorators', () => {
            const result = compileSanToTs(
                {
                    script: {
                        type: 'script', content: '@decorator export default class Test {}', attrs: {}
                    },
                    template: undefined,
                    styles: [],
                    customBlocks: [],
                    errors: []
                },
                'test.san',
                '',
                '<div></div>',
                mockReportError
            );
            expect(result).toContain('@decorator');
            expect(result).toContain('export default class Test');
            expect(result).toContain('template');
        });
    });
});
