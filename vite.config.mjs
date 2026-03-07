import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import cleanup from '@by-association-only/vite-plugin-shopify-clean'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    cleanup(), // 清理旧文件
    shopify({
      versionNumbers: true // 启用版本号避免缓存问题
    })
  ],
  server: {
    cors: true
  },
  build: {
    emptyOutDir: false,
    rollupOptions: {
      output: {
        // 自定义输出文件名
        entryFileNames: 'newtralchair.[name].min.js',
        chunkFileNames: 'newtralchair.[name].min.js',
        assetFileNames: 'newtralchair.[name].min[extname]'
      }
    }
  }
})
