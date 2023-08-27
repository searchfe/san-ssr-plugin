module.exports = {
    extends: [
        '@ecomfe/eslint-config',
        // '@ecomfe/eslint-config/import',
        // 或者选择严格模式
        // '@ecomfe/eslint-config/import/strict',
        '@ecomfe/eslint-config/typescript',
        // 或者选择严格模式
        // '@ecomfe/eslint-config/typescript/strict',
    ],
    rules: {
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/init-declarations': 'off',
        '@typescript-eslint/prefer-regexp-exec': 'off',
        'comma-dangle': 'off',
        'no-eval': 'off'
    },
    env: {
        jest: true,
    },
};