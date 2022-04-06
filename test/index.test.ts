import {compiler} from './helpers/compiler';

// (async () => {
//     const stats = await compiler('index.san');
//     // @ts-ignore
//     const output = stats.toJson().modules[0].source;
// })();
test('Run', async () => {
    const randomStr = Math.random().toString(32).slice(2);
    const {
        stats,
        outputContent
    } = await compiler('index.san', {
        appendRenderFunction() {
            return `console.log('${randomStr}')`;
        }
    });

    expect(!!stats).toBe(true);

    expect(outputContent.includes(randomStr)).toBe(true);

    // @ts-ignore
    const output = stats.toJson().modules[0].source;

    expect(!!output).toBe(true);
}, 10000);

test('Must ts', async () => {
    const mockFunction = jest.fn();
    let stats;
    try {
        stats = await compiler('must-ts.san');
    }
    catch (e: any) {
        mockFunction();
        expect(e.message).toBe('.san file must be written in TypeScript!');
    }

    expect(mockFunction.mock.calls.length).toBe(1);

    expect(!stats).toBe(true);
});

test('name module on style tag', async () => {
    const {
        stats,
        outputContent
    } = await compiler('index.san');

    expect(!!stats).toBe(true);

    expect(outputContent).toMatch(/data\[\'\$(style|tools1|tools2)\'\]/g);
}, 10000);
