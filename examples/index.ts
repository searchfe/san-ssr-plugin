import webpack from 'webpack';
import config from './webpack.config';

const compiler = webpack(config);

compiler.watch({}, (err, stats) => {
    console.log(err, stats.hasErrors());

    if (stats.hasErrors()) {
        const info = stats.toJson();
        console.log(info.errors);
    }
});