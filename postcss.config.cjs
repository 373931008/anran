// PostCSS 配置文件
module.exports = {
  plugins: {
    'postcss-import': {}, // 支持 @import 语法
    tailwindcss: {}, // Tailwind CSS v3.4 处理
    autoprefixer: {}, // 自动添加浏览器前缀

    // 生产环境压缩 CSS
    // 条件表达式：只在生产环境启用 cssnano 压缩
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  }
}
