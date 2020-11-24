import path from 'path';
import webpack from 'webpack';
import {createFsFromVolume, Volume} from 'memfs';
import {getConfig} from './webpack.config';

export function compiler(fixture: string): Promise<webpack.Stats> {
    const config = getConfig(fixture);
    const compiler = webpack(config);

    // @ts-ignore
    compiler.outputFileSystem = createFsFromVolume(new Volume());
    compiler.outputFileSystem.join = path.join.bind(path);

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
            }
            if (stats.hasErrors()) {
                reject(new Error(stats.toJson().errors.join('\n')));
            }

            resolve(stats);
        });
    });
};