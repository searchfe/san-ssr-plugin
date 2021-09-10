import path from 'path';
import webpack from 'webpack';
import {createFsFromVolume, Volume} from 'memfs';
import {getConfig} from './webpack.config';
import {PluginOptions} from '../../src/plugin';

export function compiler(fixture: string, options: Partial<PluginOptions> = {}): Promise<{
    stats: webpack.Stats;
    outputContent: string;
}> {
    const config = getConfig(fixture, options);
    const compiler = webpack(config);

    const fileSys = createFsFromVolume(new Volume());

    // @ts-ignore
    compiler.outputFileSystem = fileSys;
    compiler.outputFileSystem.join = path.join.bind(path);

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
                return;
            }
            if (stats.hasErrors()) {
                reject(new Error(stats.toJson().errors.join('\n')));
                return;
            }

            const outputContent = fileSys.readFileSync('./test/helpers/php/test/samples/index.js', 'utf-8') as string;
            resolve({stats, outputContent});
        });
    });
};