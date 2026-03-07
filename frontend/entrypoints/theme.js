import 'vite/modulepreload-polyfill'
import { revive, islands } from '@/lib/revive.js'
import { register } from 'swiper/element/bundle'

register()

// 初始化Island架构
revive(islands)

// 可选：全局错误处理
// window.addEventListener('unhandledrejection', (event) => {
//   console.error('Unhandled promise rejection:', event.reason)

//   // 这里可以添加错误报告逻辑
//   reportError({
//     type: 'unhandled_rejection',
//     error: event.reason,
//     timestamp: new Date().toISOString()
//   })

//   event.preventDefault()
// })

// 可选：全局错误监听
// window.addEventListener('error', (event) => {
//   console.error('Global error:', event.error)

//   // 这里可以添加错误报告逻辑
//   reportError({
//     type: 'global_error',
//     error: event.error,
//     timestamp: new Date().toISOString()
//   })
// })
