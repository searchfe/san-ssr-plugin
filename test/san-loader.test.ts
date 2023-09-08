import sanLoader from '../src/san-loader';
import {Store, StyleStore, TemplateStore} from '../src/store';
import type {LoaderContext} from 'webpack';

test('styleStore', async () => {
    const mockAsyncCallback = jest.fn();

    const mockContext = {
        resourcePath: '/mock/path',
        _compilation: {
            _templateStore: new Store() as TemplateStore,
            _styleStore: new Store() as StyleStore
        },
        loadModule: () => 1
    } as any;
    const content = 'require("./mock/content?type=template")';

    await new Promise(resolve => {

        mockContext.async = () => (...args: any[]) => {
            mockAsyncCallback(...args);
            resolve(0);
        };

        sanLoader.call(mockContext as LoaderContext<Record<string, never>>, content);
    });

    expect(mockContext._compilation._styleStore.get('/mock/path')).toStrictEqual([]);

    expect(mockAsyncCallback).toHaveBeenCalledTimes(1);
    expect(mockAsyncCallback.mock.calls[0][1]).toBe(content);
});

test('templateStore', () => {
    const mockLoadModule = jest.fn();


    const resourcePath = '/path/to/foo.san';
    const resourceQuery = '?lang=html&san=&type=template';
    const mockLoaderContext = {
        async: jest.fn(),
        resourcePath,
        resourceQuery,
        resource: resourcePath + resourceQuery,
        loadModule: (...args: any[]) => mockLoadModule(...args),
        _compilation: {
            _templateStore: new Store() as TemplateStore,
            _styleStore: new Store() as StyleStore
        }
    } as unknown as LoaderContext<Record<string, never>>;

    sanLoader.call(mockLoaderContext, `
    <div></div>
    `);

    expect(mockLoadModule).not.toHaveBeenCalled();

    sanLoader.call(mockLoaderContext, []);

    expect(mockLoadModule).toHaveBeenCalledTimes(1);
    expect(mockLoadModule.mock.calls[0][0]).toBe('/path/to/foo.san?lang=html&san=&type=template&compileTemplate=none');
});
