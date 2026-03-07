/**
 * 组件自动加载系统 - 核心文件
 * 这个文件负责自动加载和初始化页面上的自定义组件
 * 支持多种加载时机：立即加载、可见时加载、空闲时加载等
 */

/**
 * 媒体查询匹配 - 根据屏幕尺寸决定是否加载组件
 * @param {Object} options - 配置选项
 * @param {string} options.query - 媒体查询条件，比如 "(min-width: 768px)"
 * @returns {Promise<boolean>} - 返回是否匹配的Promise
 */
function media({ query }) {
  const mediaQuery = window.matchMedia(query)
  return new Promise((resolve) => {
    if (mediaQuery.matches) {
      resolve(true)
    } else {
      mediaQuery.addEventListener('change', resolve, { once: true })
    }
  })
}

/**
 * 元素可见性检测 - 当元素出现在屏幕上时触发
 * @param {Object} options - 配置选项
 * @param {HTMLElement} options.element - 要观察的HTML元素
 * @returns {Promise<boolean>} - 返回元素是否可见的Promise
 */
function visible({ element }) {
  return new Promise((resolve) => {
    // 创建一个观察器，监听元素是否进入屏幕可视区域
    const observer = new window.IntersectionObserver(async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          // 元素可见了，停止观察并返回true
          observer.disconnect()
          resolve(true)
          break
        }
      }
    })
    observer.observe(element)
  })
}

/**
 * 浏览器空闲时间检测 - 等待浏览器不忙的时候再加载组件
 * @returns {Promise<void>} - 返回空闲时的Promise
 */
function idle() {
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) {
      // 现代浏览器支持的空闲检测API
      window.requestIdleCallback(resolve)
    } else {
      // 老浏览器的降级处理：等待200毫秒
      setTimeout(resolve, 200)
    }
  })
}

/**
 * 自动发现所有组件文件
 * 这行代码会自动找到 islands 目录下的所有 .js 文件
 */
export const islands = import.meta.glob('@/islands/*.js')

/**
 * 组件自动加载核心函数 - 这是整个系统的大脑
 * @param {Object} islands - 组件文件映射对象
 */
export function revive(islands) {
  // 监听页面变化，当有新元素被添加时自动检查是否需要加载组件
  const observer = new window.MutationObserver((mutations) => {
    for (let i = 0; i < mutations.length; i++) {
      const { addedNodes } = mutations[i]
      for (let j = 0; j < addedNodes.length; j++) {
        const node = addedNodes[j]
        if (node.nodeType === 1) dfs(node) // 只处理HTML元素节点
      }
    }
  })

  /**
   * 深度优先搜索处理DOM节点
   * @param {HTMLElement} node - 要处理的节点
   */
  async function dfs(node) {
    const tagName = node.tagName.toLowerCase()
    const potentialJsPath = `/frontend/islands/${tagName}.js`
    const isPotentialCustomElementName = /-/.test(tagName) // 自定义元素必须包含连字符

    if (isPotentialCustomElementName && islands[potentialJsPath]) {
      try {
        // client:visible - 元素可见时加载
        if (node.hasAttribute('client:visible')) {
          await visible({ element: node })
        }

        // client:media - 媒体查询匹配时加载
        const clientMedia = node.getAttribute('client:media')
        if (clientMedia) {
          await media({ query: clientMedia })
        }

        // client:idle - 浏览器空闲时加载
        if (node.hasAttribute('client:idle')) {
          await idle()
        }

        // 加载并初始化组件
        await islands[potentialJsPath]()

        // 添加调试信息（开发环境）
        if (process.env.NODE_ENV === 'development') {
          console.log(`🏝️ Hydrated island: ${tagName}`)
        }
      } catch (error) {
        console.error(`Failed to hydrate island ${tagName}:`, error)

        // 可选：添加错误状态到元素
        node.setAttribute('data-hydration-error', 'true')
        node.classList.add('hydration-error')
      }
    }

    // 递归处理子元素
    let child = node.firstElementChild
    while (child) {
      dfs(child)
      child = child.nextElementSibling
    }
  }

  // 初始处理现有DOM
  dfs(document.body)

  // 开始监听DOM变化
  observer.observe(document.body, {
    childList: true, // 监听子节点变化
    subtree: true // 监听所有后代节点
  })

  // 开发环境下的调试信息
  if (process.env.NODE_ENV === 'development') {
    console.log('🏝️ Island architecture initialized')
    console.log('Available islands:', Object.keys(islands))
  }
}
