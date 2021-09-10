import webpack from 'webpack';
import SanLoaderPlugin from 'san-loader/lib/plugin';
import SanSsrPlugin, {PluginOptions} from '../../src/plugin';
// import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import path from 'path';

const mode: webpack.Configuration['mode'] = 'development';


export function getConfig(fixture: string, sanSsrPluginOptions: Partial<PluginOptions> = {}) {
    const entry = path.resolve(__dirname, '../samples/', fixture);
    const config = {
        entry,
        output: {
            path: path.resolve(__dirname),
            filename: 'bundle.js',
        },
        mode,
        plugins: [
            new SanSsrPlugin(Object.assign({
                output: {
                    path: 'php',
                },
                runtimeHelper: {
                    namespace: 'san\\helperNameSpace',
                },
            }, sanSsrPluginOptions)),
            new SanLoaderPlugin(),
            // new CleanWebpackPlugin(),
        ],
        resolve: {
            extensions: ['.js', '.ts', '.san', '.json'],
        },
        module: {
            rules: [
                {
                    test: /\.san$/,
                    loader: 'san-loader',
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
    return config;
};