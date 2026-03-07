/**
 * 常用工具函数库 - 纯原生JavaScript
 * 提供常用的辅助函数，无需任何外部依赖
 */

/**
 * 防抖函数 - 延迟执行，避免频繁触发
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait, immediate = false) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}

/**
 * 节流函数 - 限制执行频率，避免性能问题
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 深度克隆对象
 * @param {any} obj - 要克隆的对象
 * @returns {any} 克隆后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map((item) => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 格式化价格
 * @param {number} price - 价格数值
 * @param {string} currency - 货币符号
 * @param {string} locale - 地区设置
 * @returns {string} 格式化后的价格字符串
 */
export function formatPrice(price, currency = '$', locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency === '$' ? 'USD' : currency,
      minimumFractionDigits: 2
    }).format(price / 100) // Shopify价格通常以分为单位
  } catch (error) {
    // 降级处理
    return `${currency}${(price / 100).toFixed(2)}`
  }
}

/**
 * 格式化日期
 * @param {Date|string} date - 日期对象或字符串
 * @param {string} locale - 地区设置
 * @param {Object} options - 格式化选项
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, locale = 'en-US', options = {}) {
  const dateObj = date instanceof Date ? date : new Date(date)
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      ...defaultOptions,
      ...options
    }).format(dateObj)
  } catch (error) {
    return dateObj.toLocaleDateString()
  }
}

/**
 * 获取URL参数
 * @param {string} name - 参数名
 * @returns {string|null} 参数值
 */
export function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

/**
 * 设置URL参数
 * @param {string} name - 参数名
 * @param {string} value - 参数值
 * @param {boolean} pushState - 是否使用pushState
 */
export function setUrlParameter(name, value, pushState = true) {
  const url = new URL(window.location)
  url.searchParams.set(name, value)

  if (pushState) {
    window.history.pushState({}, '', url)
  } else {
    window.history.replaceState({}, '', url)
  }
}

/**
 * 检查元素是否在视口中
 * @param {HTMLElement} element - 要检查的元素
 * @param {number} threshold - 阈值（0-1）
 * @returns {boolean} 是否在视口中
 */
export function isInViewport(element, threshold = 0) {
  const rect = element.getBoundingClientRect()
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight
  const windowWidth = window.innerWidth || document.documentElement.clientWidth

  const verticalThreshold = windowHeight * threshold
  const horizontalThreshold = windowWidth * threshold

  return (
    rect.top >= -verticalThreshold &&
    rect.left >= -horizontalThreshold &&
    rect.bottom <= windowHeight + verticalThreshold &&
    rect.right <= windowWidth + horizontalThreshold
  )
}

/**
 * 平滑滚动到元素
 * @param {HTMLElement|string} target - 目标元素或选择器
 * @param {Object} options - 滚动选项
 */
export function scrollToElement(target, options = {}) {
  const element =
    typeof target === 'string' ? document.querySelector(target) : target

  if (!element) {
    console.warn('Scroll target not found:', target)
    return
  }

  const defaultOptions = {
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest'
  }

  element.scrollIntoView({ ...defaultOptions, ...options })
}

/**
 * 加载图片
 * @param {string} src - 图片源
 * @returns {Promise<HTMLImageElement>} 图片元素
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 本地存储工具
 */
export const storage = {
  /**
   * 设置本地存储
   * @param {string} key - 键名
   * @param {any} value - 值
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to set localStorage:', error)
    }
  },

  /**
   * 获取本地存储
   * @param {string} key - 键名
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn('Failed to get localStorage:', error)
      return defaultValue
    }
  },

  /**
   * 移除本地存储
   * @param {string} key - 键名
   */
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove localStorage:', error)
    }
  },

  /**
   * 清空本地存储
   */
  clear() {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }
}

/**
 * 设备检测工具
 */
export const device = {
  /**
   * 是否为移动设备
   * @returns {boolean}
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  },

  /**
   * 是否为触摸设备
   * @returns {boolean}
   */
  isTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },

  /**
   * 获取屏幕尺寸
   * @returns {Object} 屏幕宽高
   */
  getViewport() {
    return {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight
    }
  }
}

/**
 * 随机生成ID - 用于给元素生成唯一标识
 * @param {string} prefix - 前缀
 * @param {number} length - 长度
 * @returns {string} 随机ID
 */
export function generateId(prefix = 'id', length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = prefix + '_'
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 字符串工具
 */
export const string = {
  /**
   * 首字母大写
   * @param {string} str - 字符串
   * @returns {string} 处理后的字符串
   */
  capitalize(str) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  /**
   * 转为驼峰命名
   * @param {string} str - 字符串
   * @returns {string} 驼峰命名字符串
   */
  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
  },

  /**
   * 转为连字符命名
   * @param {string} str - 字符串
   * @returns {string} 连字符命名字符串
   */
  toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  },

  /**
   * 截断字符串
   * @param {string} str - 字符串
   * @param {number} length - 最大长度
   * @param {string} suffix - 后缀
   * @returns {string} 截断后的字符串
   */
  truncate(str, length = 100, suffix = '...') {
    if (!str || str.length <= length) return str
    return str.substring(0, length) + suffix
  }
}

/**
 * 数字工具
 */
export const number = {
  /**
   * 格式化数字（添加千位分隔符）
   * @param {number} num - 数字
   * @returns {string} 格式化后的数字
   */
  format(num) {
    return new Intl.NumberFormat().format(num)
  },

  /**
   * 限制数字范围
   * @param {number} num - 数字
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 限制后的数字
   */
  clamp(num, min, max) {
    return Math.min(Math.max(num, min), max)
  },

  /**
   * 生成随机数
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 随机数
   */
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}

/**
 * 数组工具
 */
export const array = {
  /**
   * 数组去重
   * @param {Array} arr - 数组
   * @returns {Array} 去重后的数组
   */
  unique(arr) {
    return [...new Set(arr)]
  },

  /**
   * 打乱数组
   * @param {Array} arr - 数组
   * @returns {Array} 打乱后的数组
   */
  shuffle(arr) {
    const newArr = [...arr]
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
    }
    return newArr
  },

  /**
   * 数组分块
   * @param {Array} arr - 数组
   * @param {number} size - 块大小
   * @returns {Array} 分块后的数组
   */
  chunk(arr, size) {
    const chunks = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  }
}

/**
 * 简单的HTTP请求工具 - 封装fetch，更容易使用
 */
export const http = {
  /**
   * GET请求
   * @param {string} url - 请求地址
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  async get(url, options = {}) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('GET请求失败:', error)
      throw error
    }
  },

  /**
   * POST请求
   * @param {string} url - 请求地址
   * @param {Object} data - 请求数据
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  async post(url, data = {}, options = {}) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('POST请求失败:', error)
      throw error
    }
  }
}

/**
 * DOM操作工具
 */
export const dom = {
  /**
   * 查找元素
   * @param {string} selector - CSS选择器
   * @param {HTMLElement} parent - 父元素
   * @returns {HTMLElement|null} 找到的元素
   */
  find(selector, parent = document) {
    return parent.querySelector(selector)
  },

  /**
   * 查找所有元素
   * @param {string} selector - CSS选择器
   * @param {HTMLElement} parent - 父元素
   * @returns {NodeList} 找到的元素列表
   */
  findAll(selector, parent = document) {
    return parent.querySelectorAll(selector)
  },

  /**
   * 创建元素
   * @param {string} tag - 标签名
   * @param {Object} attrs - 属性
   * @param {string} content - 内容
   * @returns {HTMLElement} 创建的元素
   */
  create(tag, attrs = {}, content = '') {
    const element = document.createElement(tag)

    // 设置属性
    Object.keys(attrs).forEach((key) => {
      if (key === 'className') {
        element.className = attrs[key]
      } else if (key === 'dataset') {
        Object.keys(attrs[key]).forEach((dataKey) => {
          element.dataset[dataKey] = attrs[key][dataKey]
        })
      } else {
        element.setAttribute(key, attrs[key])
      }
    })

    // 设置内容
    if (content) {
      element.innerHTML = content
    }

    return element
  },

  /**
   * 添加CSS类
   * @param {HTMLElement} element - 元素
   * @param {string|Array} classes - CSS类名
   */
  addClass(element, classes) {
    const classList = Array.isArray(classes) ? classes : [classes]
    element.classList.add(...classList)
  },

  /**
   * 移除CSS类
   * @param {HTMLElement} element - 元素
   * @param {string|Array} classes - CSS类名
   */
  removeClass(element, classes) {
    const classList = Array.isArray(classes) ? classes : [classes]
    element.classList.remove(...classList)
  },

  /**
   * 切换CSS类
   * @param {HTMLElement} element - 元素
   * @param {string} className - CSS类名
   * @returns {boolean} 是否添加了类
   */
  toggleClass(element, className) {
    return element.classList.toggle(className)
  }
}
