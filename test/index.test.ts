import {compiler} from './helpers/compiler';

// (async () => {
//     const stats = await compiler('index.san');
//     // @ts-ignore
//     const output = stats.toJson().modules[0].source;
// })();
test('Run', async () => {
    const stats = await compiler('index.san');

    expect(!!stats).toBe(true);

    // @ts-ignore
    const output = stats.toJson().modules[0].source;

    expect(!!output).toBe(true);
});

test('Must ts', async () => {
    const mockFunction = jest.fn();
    let stats;
    try {
        stats = await compiler('must-ts.san');
    }
    catch (e) {
        mockFunction();
        expect(e.message).toBe('.san file must be written in TypeScript!');
    }

    expect(mockFunction.mock.calls.length).toBe(1);

    expect(!stats).toBe(true);
});