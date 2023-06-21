const target = 'es2015';

export const swcDefaultOptions = {
  jsc: {
    parser: {
      syntax: "typescript",
      tsx: true,
      decorators: true,
    },
    transform: {
      legacyDecorator: true,
    },
    externalHelpers: true, // 注意这里设置true时，需要在项目下安装@swc/helpers
    target,
  },
  env: {
    targets: "edge 14",
    mode: "usage",
    coreJs: "3.22"
  },
  isModule: 'unknown'
}

export const esbuildDefaultOptions = {
  target
}


export const babelDefaultOptions = {
  sourceType: 'unambiguous',
  targets: "edge 14",
  "presets": [
    [
      "@babel/preset-env",
      {
        "debug": false,
        "useBuiltIns": "usage", // https://babeljs.io/docs/en/babel-preset-env
        "corejs": '3.21'
      }
    ],
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": false,
        "helpers": true,
        "regenerator": true
      }
    ]
  ]
}
