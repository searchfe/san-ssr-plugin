import webpack from 'webpack';
import SanLoaderPlugin from 'san-loader/lib/plugin';
import SanSsrPlugin, {PluginOptions} from '../../src/plugin';
import path from 'path';

const mode: webpack.Configuration['mode'] = 'development';


export function getConfig(fixture: string, sanSsrPluginOptions: Partial<PluginOptions> = {}) {
    const entry = path.resolve(__dirname, '../samples/', fixture);
    const config = {
        entry,
        output: {
            publicPath: 'https://www.baidu.com/',
            path: path.resolve(__dirname),
            filename: 'bundle.js',
            clean: true
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
                    use: {
                        loader: 'san-loader',
                        options: {
                            compileTemplate: 'aPack'
                        }
                    }
                },
                {
                    test: /\.svg$/,
                    type: 'asset/resource'
                },
                {
                    test: /.(less|css)$/,

                    oneOf: [
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
                        // 这里匹配 `<style lang="less" module>`
                        {
                            resourceQuery: /module/,
                            use: [
                                'style-loader',
                                {
                                    loader: 'css-loader',
                                    options: {
                                        esModule: false,
                                        modules: {
                                            exportLocalsConvention: 'camelCase',
                                        },
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
                    options: {
                        esModule: false,
                        minimize: false,
                        sources: false,
                    }
                },
            ],
        },
    } as webpack.Configuration;
    return config;
};