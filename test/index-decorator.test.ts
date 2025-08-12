import {compiler} from './helpers/compiler';

test('Run With Decorators', async () => {
    const randomStr = Math.random().toString(32).slice(2);
    const {
        stats,
        outputContent
    } = await compiler('index-decorator.san', {
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

test('name module on style tag', async () => {
    const {
        stats,
        outputContent
    } = await compiler('index-decorator.san');

    expect(!!stats).toBe(true);

    expect(outputContent).toMatch(/data\[\'\$(style|tools1|tools2)\'\]/g);
}, 10000);
