import {compiler} from './helpers/compiler';

// (async () => {
//     const stats = await compiler('index.san');
//     // @ts-ignore
//     const output = stats.toJson().modules[0].source;
// })();
// test('Run', async () => {
//     const randomStr = Math.random().toString(32).slice(2);
//     const {
//         stats,
//         outputContent
//     } = await compiler('index.san', {
//         appendRenderFunction() {
//             return `console.log('${randomStr}')`;
//         }
//     });

//     expect(!!stats).toBe(true);

//     expect(outputContent.includes(randomStr)).toBe(true);

//     const output = stats!.toJson();

//     expect(output.errorsCount).toBe(0);
//     expect(output.warningsCount).toBe(0);
// }, 10000);

// test('Must ts', async () => {
//     const {stats} = await compiler('must-ts.san');

//     expect(!!stats).toBe(true);
//     const output = stats!.toJson();
//     expect(output.errorsCount).toBe(1);
//     expect(output.errors?.[0].message).toBe('.san file must be written in TypeScript!');
// });

test('name module on style tag', async () => {
    const {
        stats,
        outputContent
    } = await compiler('index.san');

    expect(!!stats).toBe(true);
    expect(stats?.hasErrors()).toBe(false);

    // 如果有错误，打印错误信息以便调试
    if (stats?.hasErrors()) {
        console.log('Compilation errors:', stats.toJson().errors);
    }

    expect(stats?.hasErrors()).toBe(false);

    expect(outputContent).toMatch(/data\[\'\$(style|tools1|tools2)\'\]/g);
}, 10000);

test('decorator support', async () => {
    const {
        stats,
        outputContent
    } = await compiler('decorator.san');

    expect(!!stats).toBe(true);

    // 打印错误信息以便调试
    if (stats?.hasErrors()) {
        console.log('Decorator compilation errors:', stats.toJson().errors);
    }

    expect(stats?.hasErrors()).toBe(false);

    expect(outputContent).toContain('DecoratorComponent');
}, 10000);

test('no decorator support (backward compatibility)', async () => {
    const {
        stats,
        outputContent
    } = await compiler('no-decorator.san');

    expect(!!stats).toBe(true);
    expect(stats?.hasErrors()).toBe(false);

    // 如果有错误，打印错误信息以便调试
    if (stats?.hasErrors()) {
        console.log('Compilation errors:', stats.toJson().errors);
    }

    expect(outputContent).toContain('NoDecoratorComponent');
}, 10000);
