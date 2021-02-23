import type {Config} from '@jest/types';


const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/!(html-parser)!(*.d).{js,ts}',
    ],
    coverageDirectory: 'test/coverage',
};

export default config;