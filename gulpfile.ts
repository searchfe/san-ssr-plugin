import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';

gulp.task('build:ts', () => {
    return gulp.src(['./src/**/*.ts', '!./src/**/*.d.ts'])
        // @ts-ignore
        .pipe(babel({
            presets: [
                // @ts-ignore
                [
                    '@babel/preset-typescript',
                    {
                        allExtensions: true,
                    },
                ],
                // @ts-ignore
                [
                    '@babel/preset-env',
                    {
                        'targets': {
                            'node': true,
                        },
                    },
                ],
            ],
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy:code', () => {
    return gulp.src('./src/**/*.{js,php}', {root: './src'})
        .pipe(gulp.dest('./dist'));
});
gulp.task('copy:dts', () => {
    return gulp.src('./src/**/*.d.ts', {root: './src'})
        .pipe(gulp.dest('./dist'));
});

gulp.task('clean:dist', () => {
    return del(['dist']);
});

gulp.task('build', gulp.series(['clean:dist', gulp.parallel(['build:ts', 'copy:dts', 'copy:code'])]));