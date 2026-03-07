/** @type {import('prettier').Config} */
module.exports = {
  // JavaScript/TypeScript 格式化配置
  singleQuote: true,        // 使用单引号
  semi: false,              // 不使用分号
  printWidth: 80,           // 每行最大字符数
  trailingComma: 'none',    // 不使用尾随逗号
  endOfLine: 'auto',        // 自动处理行尾
  tabWidth: 2,              // 缩进宽度
  useTabs: false,           // 使用空格而非制表符
  
  // 插件配置
  plugins: [
    // Shopify Liquid 模板格式化
    require.resolve('@shopify/prettier-plugin-liquid/standalone'),
    // TailwindCSS 类名排序
    'prettier-plugin-tailwindcss'
  ],
  
  // 针对不同文件类型的特殊配置
  overrides: [
    {
      // Liquid 模板文件配置
      files: '*.liquid',
      options: {
        parser: 'liquid-html',   // 使用 liquid-html 解析器
        singleQuote: false,      // HTML 属性使用双引号
        printWidth: 120          // Liquid 文件允许更长的行
      }
    },
    {
      // JSON 文件配置
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2
      }
    },
    {
      // CSS 文件配置
      files: ['*.css', '*.scss'],
      options: {
        singleQuote: false,      // CSS 使用双引号
        printWidth: 100
      }
    }
  ]
}
