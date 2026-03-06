import path from 'path';
import webpack from 'webpack';
import {createFsFromVolume, Volume} from 'memfs';
import {getConfig} from './webpack.config';
import {PluginOptions} from '../../src/plugin';

export function compiler(fixture: string, options: Partial<PluginOptions> = {}): Promise<{
    stats: webpack.Stats | undefined;
    outputContent: string;
}> {
    const config = getConfig(fixture, options);
    const compiler = webpack(config);

    const fileSys = createFsFromVolume(new Volume());

    compiler.outputFileSystem = fileSys as any;
    compiler.outputFileSystem!.join = path.join.bind(path);

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
                return;
            }

            let outputContent = '';
            try {
                const fixturePath = fixture.replace('.san', '');
                outputContent = fileSys.readFileSync(`./test/helpers/php/test/samples/${fixturePath}.js`, 'utf-8') as string;
            }
            catch {}
            resolve({stats, outputContent});
        });
    });
};