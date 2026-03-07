/**
 * 性能优化工具函数
 * 提供图片懒加载、预加载、性能监控等功能
 */

/**
 * 图片懒加载实现
 * @param {string} selector - 图片选择器
 * @param {Object} options - 配置选项
 */
export function lazyLoadImages(selector = 'img[data-src]', options = {}) {
  const defaultOptions = {
    rootMargin: '50px 0px',
    threshold: 0.01,
    ...options
  }

  if (!('IntersectionObserver' in window)) {
    // 降级处理：直接加载所有图片
    document.querySelectorAll(selector).forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src
        img.removeAttribute('data-src')
      }
    })
    return
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target

        // 创建新图片对象预加载
        const imageLoader = new Image()
        imageLoader.onload = () => {
          img.src = img.dataset.src
          img.classList.add('loaded')
          img.removeAttribute('data-src')
        }
        imageLoader.onerror = () => {
          img.classList.add('error')
        }
        imageLoader.src = img.dataset.src

        observer.unobserve(img)
      }
    })
  }, defaultOptions)

  document.querySelectorAll(selector).forEach((img) => {
    imageObserver.observe(img)
  })
}

/**
 * 预加载关键资源
 * @param {Array} resources - 资源URL数组
 * @param {string} type - 资源类型 ('image', 'script', 'style', 'font')
 */
export function preloadResources(resources, type = 'image') {
  resources.forEach((src) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = src

    switch (type) {
      case 'image':
        link.as = 'image'
        break
      case 'script':
        link.as = 'script'
        break
      case 'style':
        link.as = 'style'
        break
      case 'font':
        link.as = 'font'
        link.crossOrigin = 'anonymous'
        break
    }

    document.head.appendChild(link)
  })
}

/**
 * 预连接到外部域名
 * @param {Array} domains - 域名数组
 */
export function preconnectDomains(domains) {
  domains.forEach((domain) => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    document.head.appendChild(link)
  })
}

/**
 * 性能监控和报告
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {}
    this.observers = []
  }

  /**
   * 开始监控Core Web Vitals
   */
  startWebVitalsMonitoring() {
    // Largest Contentful Paint (LCP)
    this.observeLCP()

    // First Input Delay (FID)
    this.observeFID()

    // Cumulative Layout Shift (CLS)
    this.observeCLS()
  }

  /**
   * 监控LCP
   */
  observeLCP() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]

      this.metrics.lcp = {
        value: lastEntry.startTime,
        rating: this.getRating(lastEntry.startTime, [2500, 4000])
      }

      this.reportMetric('lcp', this.metrics.lcp)
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
    this.observers.push(observer)
  }

  /**
   * 监控FID
   */
  observeFID() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.metrics.fid = {
          value: entry.processingStart - entry.startTime,
          rating: this.getRating(
            entry.processingStart - entry.startTime,
            [100, 300]
          )
        }

        this.reportMetric('fid', this.metrics.fid)
      })
    })

    observer.observe({ type: 'first-input', buffered: true })
    this.observers.push(observer)
  }

  /**
   * 监控CLS
   */
  observeCLS() {
    if (!('PerformanceObserver' in window)) return

    let clsValue = 0
    let sessionValue = 0
    let sessionEntries = []

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0]
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

          if (
            sessionValue &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            sessionValue += entry.value
            sessionEntries.push(entry)
          } else {
            sessionValue = entry.value
            sessionEntries = [entry]
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue

            this.metrics.cls = {
              value: clsValue,
              rating: this.getRating(clsValue, [0.1, 0.25])
            }

            this.reportMetric('cls', this.metrics.cls)
          }
        }
      })
    })

    observer.observe({ type: 'layout-shift', buffered: true })
    this.observers.push(observer)
  }

  /**
   * 获取性能评级
   * @param {number} value - 指标值
   * @param {Array} thresholds - 阈值数组 [good, needs-improvement]
   * @returns {string} 评级
   */
  getRating(value, thresholds) {
    if (value <= thresholds[0]) return 'good'
    if (value <= thresholds[1]) return 'needs-improvement'
    return 'poor'
  }

  /**
   * 报告性能指标
   * @param {string} metricName - 指标名称
   * @param {Object} metric - 指标数据
   */
  reportMetric(metricName, metric) {
    // 在开发环境下输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${metricName.toUpperCase()}:`, metric)
    }

    // 发送到分析服务（可选）
    // this.sendToAnalytics(metricName, metric)
  }

  /**
   * 发送数据到分析服务
   * @param {string} metricName - 指标名称
   * @param {Object} metric - 指标数据
   */
  sendToAnalytics(metricName, metric) {
    // 示例：发送到Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', metricName, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating
      })
    }

    // 或发送到其他分析服务
    // navigator.sendBeacon('/api/analytics', JSON.stringify({
    //   metric: metricName,
    //   value: metric.value,
    //   rating: metric.rating,
    //   timestamp: Date.now()
    // }))
  }

  /**
   * 获取所有性能指标
   * @returns {Object} 性能指标对象
   */
  getMetrics() {
    return { ...this.metrics }
  }

  /**
   * 清理观察器
   */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

/**
 * 资源加载优化
 */
export class ResourceOptimizer {
  /**
   * 智能预加载下一页内容
   * @param {string} nextPageUrl - 下一页URL
   */
  static preloadNextPage(nextPageUrl) {
    if (!nextPageUrl) return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = nextPageUrl
    document.head.appendChild(link)
  }

  /**
   * 优化字体加载
   * @param {Array} fontUrls - 字体URL数组
   */
  static optimizeFontLoading(fontUrls) {
    fontUrls.forEach((url) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = url
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
  }

  /**
   * 延迟加载非关键JavaScript
   * @param {Array} scripts - 脚本配置数组
   */
  static deferNonCriticalScripts(scripts) {
    const loadScript = (src, async = true) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.async = async
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
      })
    }

    // 在页面加载完成后加载非关键脚本
    if (document.readyState === 'complete') {
      scripts.forEach((src) => loadScript(src))
    } else {
      window.addEventListener('load', () => {
        scripts.forEach((src) => loadScript(src))
      })
    }
  }
}

/**
 * 初始化性能优化
 */
export function initPerformanceOptimizations() {
  // 启动懒加载
  lazyLoadImages()

  // 预连接到常用域名
  preconnectDomains([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.shopify.com'
  ])

  // 启动性能监控
  const monitor = new PerformanceMonitor()
  monitor.startWebVitalsMonitoring()

  // 页面卸载时清理
  window.addEventListener('beforeunload', () => {
    monitor.cleanup()
  })

  return monitor
}
