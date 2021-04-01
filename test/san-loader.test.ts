import sanLoader from '../src/san-loader';
import {styleStore} from '../src/store';
import type {loader} from 'webpack';

test('styleStore', async () => {
    const mockAsyncCallback = jest.fn();
    const env = {
        async: () => (...args: any[]) => mockAsyncCallback(...args),
        resourcePath: '/mock/path',
    };

    sanLoader.call(env as unknown as loader.LoaderContext, 'mock content');

    expect(styleStore.get('/mock/path')).toStrictEqual([]);

    expect(mockAsyncCallback).toHaveBeenCalledTimes(1);
    expect(mockAsyncCallback.mock.calls[0][1]).toBe('mock content');
});

test('templateStore', () => {
    const mockLoadModule = jest.fn();


    const mockLoaderContext = {
        async: jest.fn(),
        resourcePath: '/path/to/foo.san',
        loadModule: (...args: any[]) => mockLoadModule(...args),
    } as unknown as loader.LoaderContext;

    sanLoader.call(mockLoaderContext, `
    var foo = require("/path/to/foo.ts");
    `);

    expect(mockLoadModule).not.toHaveBeenCalled();

    sanLoader.call(mockLoaderContext, `
    var template = require("/path/to/foo.san?lang=html&san=&type=template");
    `);

    expect(mockLoadModule).toHaveBeenCalledTimes(1);
    expect(mockLoadModule.mock.calls[0][0]).toBe('/path/to/foo.san?lang=html&san=&type=template');
});
