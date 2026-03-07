/** @type {import('eslint').Linter.Config} */
module.exports = {
  // 继承标准配置和Prettier集成
  extends: ['standard', 'plugin:prettier/recommended'],

  // 环境配置
  env: {
    browser: true, // 浏览器环境
    es2022: true, // ES2022语法支持
    node: true // Node.js环境（用于配置文件）
  },

  // 解析器选项
  parserOptions: {
    ecmaVersion: 'latest', // 使用最新ECMAScript版本
    sourceType: 'module' // ES模块支持
  },

  // 自定义规则
  rules: {
    // 优先使用const
    'prefer-const': 'error',

    // 禁止var
    'no-var': 'error',

    // 要求使用箭头函数作为回调
    'prefer-arrow-callback': 'error',

    // 禁止console.log（开发时可以临时注释）
    'no-console': 'warn',

    // 要求使用async/await而非Promise
    'prefer-promise-reject-errors': 'error'
  },

  // 忽略特定文件
  ignorePatterns: [
    'assets/**', // 构建输出目录
    'node_modules/**', // 依赖目录
    '*.min.js', // 压缩文件
    'vite.config.mjs' // Vite配置文件使用特殊语法
  ]
}
