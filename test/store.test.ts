import {Store, StyleStore} from '../src/store';

test('styleStore', async () => {
    const styleStore = new Store() as StyleStore;

    styleStore.set('styleA', {
        cssCode: 'aaa',
    });

    expect(styleStore.get('styleA')).toStrictEqual([{
        cssCode: 'aaa',
    }]);

    styleStore.set('styleA', {
        cssCode: 'bbb',
    });

    expect(styleStore.get('styleA')).toStrictEqual([
        {
            cssCode: 'aaa',
        },
        {
            cssCode: 'bbb',
        },
    ]);

    styleStore.set('styleB', {
        cssCode: 'bbb',
    });

    expect(styleStore.getKeys()).toStrictEqual(['styleA', 'styleB']);

    styleStore.clear();

    expect(styleStore.getKeys()).toStrictEqual([]);
});
