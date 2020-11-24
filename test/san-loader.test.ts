import sanLoader from '../src/san-loader';
import {styleStore} from '../src/styles-store';

test('styleStore', async () => {
    const env = {
        resourcePath: '/mock/path',
    };

    // @ts-ignore
    const res = sanLoader.call(env, 'mock content');

    expect(styleStore.get('/mock/path')).toStrictEqual([]);

    expect(res).toBe('mock content');
});
