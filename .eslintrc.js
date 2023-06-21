module.exports = {
  env: {
    node: true,
    es6: true,
    jest: false,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:promise/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  plugins: ['import', 'promise', '@typescript-eslint'],
  rules: {
    'quotes': [2, 'single'], // 字符串必须使用单引号
    'semi': [2, 'always'], // 语句必须分号结尾
  },
};
