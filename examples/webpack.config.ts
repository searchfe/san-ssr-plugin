import webpack from 'webpack';
import SanLoaderPlugin from 'san-loader/lib/plugin';
import SanPhpLoaderPlugin from '../src/plugin';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';

const mode: webpack.Configuration['mode'] = 'development';

export default {
    entry: {
        pageOne: './examples/index.san',
        app: './examples/testaaa.ts',
    },
    output: {
        // filename: 'app/[name].js',
        // // path: path.resolve(__dirname, './dist')
        publicPath: 'https://www.baidu.com',
    },
    mode,
    plugins: [
        new SanPhpLoaderPlugin({
            output: {
                path: 'php',
                // importHelpers: 'san-ssr/dist/runtime/index'
            },
            runtimeHelper: {
                namespace: 'san\\helperNameSpace',
            },
        }),
        new SanLoaderPlugin(),
        new CleanWebpackPlugin(),
    ],
    resolve: {
        extensions: ['.js', '.ts', '.san', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.san$/,
                use: {
                    loader: 'san-loader',
                    options: {
                        compileTemplate: 'aPack'
                    }
                }
            },
            {
                test: /\.svg$/,
                loader: 'file-loader',
            },
            {
                test: /.(less|css)$/,

                oneOf: [
                    // 这里匹配 `<style lang="less" module>`
                    {
                        resourceQuery: /module/,
                        use: [
                            'style-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: true,
                                    sourceMap: true,
                                    localsConvention: 'camelCase',
                                },
                            },
                            {
                                loader: 'less-loader',
                                options: {
                                    sourceMap: true,
                                },
                            },
                        ],
                    },
                    // 这里匹配 `<style lang="less">`
                    {
                        use: [
                            {
                                loader: 'style-loader',
                            },
                            {
                                loader: 'css-loader',
                                options: {
                                    sourceMap: true,
                                },
                            },
                            {
                                loader: 'less-loader',
                                options: {
                                    sourceMap: true,
                                },
                            },
                        ],
                    },
                ],
            },
            {
                test: /\.ts$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-typescript',
                        ],
                        plugins: [
                            [
                                '@babel/plugin-proposal-class-properties',
                            ],
                        ],
                    },
                },
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                        ],
                        plugins: [
                            [
                                '@babel/plugin-proposal-class-properties',
                            ],
                        ],
                    },
                },
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
            },
        ],
    },
};
