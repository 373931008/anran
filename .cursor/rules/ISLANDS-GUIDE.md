# Islands 架构开发指南

## 🏝️ 什么是 Islands 架构？

Islands（岛屿）架构是一种前端架构模式，将页面分为静态内容和交互式"岛屿"。每个岛屿是一个独立的、可交互的组件。

### 优势

✅ **性能优化**：只有交互组件需要 JavaScript  
✅ **组件隔离**：避免全局污染和命名冲突  
✅ **按需加载**：减少初始加载体积  
✅ **易于维护**：每个组件独立管理  
✅ **渐进增强**：无 JS 时基础功能仍可用  

---

## 📁 项目结构

```
frontend/islands/
├── example-component.js       # 完整功能示例
├── isolated-widget.js          # Shadow DOM 示例
├── anchor-navigation.js        # 锚点导航（待创建）
├── product-swiper.js           # 产品轮播（待创建）
└── countdown-timer.js          # 倒计时器（待创建）
```

---

## 🎯 创建自定义元素的标准流程

### 1. 创建 JavaScript 文件

**文件位置**：`frontend/islands/your-component.js`

**基本模板**：

```javascript
/**
 * 组件名称
 * 功能描述
 */
export default class YourComponent extends HTMLElement {
  constructor() {
    super()
    
    // 组件状态
    this.state = {
      // 状态数据
    }
    
    // 绑定方法（确保 this 指向正确）
    this.handleEvent = this.handleEvent.bind(this)
  }

  /**
   * 组件连接到 DOM 时调用
   */
  connectedCallback() {
    try {
      this.init()
    } catch (error) {
      console.error('组件初始化失败:', error)
      this.renderErrorState()
    }
  }

  /**
   * 组件从 DOM 移除时调用
   * ⚠️ 重要：必须清理资源，避免内存泄漏
   */
  disconnectedCallback() {
    this.cleanup()
  }

  /**
   * 初始化组件
   */
  init() {
    // 1. 获取配置（从 data-* 属性）
    this.loadConfig()
    
    // 2. 渲染内容
    this.render()
    
    // 3. 绑定事件
    this.setupEventListeners()
  }

  /**
   * 从 HTML 属性加载配置
   */
  loadConfig() {
    this.config = {
      option1: this.getAttribute('data-option1') || 'default',
      option2: this.hasAttribute('data-option2')
    }
  }

  /**
   * 渲染组件
   */
  render() {
    // 使用模板字符串 + 项目样式类
    this.innerHTML = `
      <div class="component-inner">
        <!-- 内容 -->
      </div>
    `
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 使用事件委托
    this.addEventListener('click', this.handleEvent)
    
    // 或绑定到特定元素
    const button = this.querySelector('.my-button')
    if (button) {
      button.addEventListener('click', this.handleEvent)
    }
  }

  /**
   * 事件处理器
   */
  handleEvent(event) {
    // 处理事件
  }

  /**
   * 更新状态（增量更新 DOM）
   */
  updateState(newState) {
    const prevState = { ...this.state }
    this.state = { ...this.state, ...newState }
    
    // ✅ 增量更新：只更新变化的部分
    this.updateDisplay(prevState)
  }

  /**
   * 增量更新 DOM
   */
  updateDisplay(prevState) {
    // 只更新变化的元素
    if (prevState.value !== this.state.value) {
      const element = this.querySelector('.value-display')
      if (element) {
        element.textContent = this.state.value
      }
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 移除事件监听器
    this.removeEventListener('click', this.handleEvent)
    
    // 取消定时器
    if (this.timer) {
      clearTimeout(this.timer)
    }
    
    // 取消请求、清理其他资源
  }

  /**
   * 渲染错误状态
   */
  renderErrorState() {
    this.innerHTML = `
      <div class="error-state">
        组件加载失败
      </div>
    `
  }
}

// ⚠️ 重要：注册自定义元素
customElements.define('your-component', YourComponent)
```

### 2. 在 Liquid 中使用

**Section 文件**：`sections/q-your-section.liquid`

```liquid
{%- comment -%}
  Your Section
  功能说明
{%- endcomment -%}

<!-- 使用自定义元素 -->
<your-component 
  class="your-component"
  data-option1="value1"
  data-option2
>
  <!-- 可选：初始内容（无 JS 时显示） -->
  <div class="loading-placeholder">
    加载中...
  </div>
</your-component>

<!-- 引入 JavaScript -->
<script type="module">
  import YourComponent from '{{ 'your-component.js' | asset_url }}'
</script>

{% schema %}
{
  "name": "Your Section",
  "settings": []
}
{% endschema %}
```

---

## 📐 命名规范

### 文件命名

**格式**：kebab-case（小写 + 连字符）

| ✅ 正确 | ❌ 错误 |
|---------|---------|
| `anchor-navigation.js` | `AnchorNavigation.js` |
| `product-swiper.js` | `productSwiper.js` |
| `countdown-timer.js` | `CountdownTimer.js` |

### 类命名

**格式**：PascalCase（每个单词首字母大写）

| ✅ 正确 | ❌ 错误 |
|---------|---------|
| `AnchorNavigation` | `anchorNavigation` |
| `ProductSwiper` | `product_swiper` |
| `CountdownTimer` | `countdowntimer` |

### 自定义元素名

**格式**：kebab-case（必须包含连字符）

| ✅ 正确 | ❌ 错误 |
|---------|---------|
| `<anchor-navigation>` | `<anchornavigation>` |
| `<product-swiper>` | `<ProductSwiper>` |
| `<countdown-timer>` | `<timer>` |

---

## 🎨 常用模式

### 模式 1：从属性获取配置

```javascript
loadConfig() {
  this.config = {
    // 字符串属性
    title: this.getAttribute('data-title') || '默认标题',
    
    // 数字属性
    count: parseInt(this.getAttribute('data-count') || '0', 10),
    
    // 布尔属性
    enabled: this.hasAttribute('data-enabled'),
    
    // JSON 属性
    items: JSON.parse(this.getAttribute('data-items') || '[]')
  }
}
```

### 模式 2：Sticky 定位

```javascript
connectedCallback() {
  this.init()
  
  // Sticky 状态监听
  this.observeSticky()
}

observeSticky() {
  const observer = new IntersectionObserver(
    ([entry]) => {
      this.classList.toggle('is-sticky', !entry.isIntersecting)
    },
    { threshold: [1] }
  )
  
  // 创建哨兵元素
  const sentinel = document.createElement('div')
  sentinel.style.position = 'absolute'
  sentinel.style.top = '0'
  sentinel.style.height = '1px'
  this.parentElement.prepend(sentinel)
  
  observer.observe(sentinel)
  
  // 保存以便清理
  this.stickyObserver = observer
  this.stickySentinel = sentinel
}

cleanup() {
  if (this.stickyObserver) {
    this.stickyObserver.disconnect()
  }
  if (this.stickySentinel) {
    this.stickySentinel.remove()
  }
}
```

### 模式 3：滚动监听

```javascript
connectedCallback() {
  this.init()
  
  // 节流的滚动处理
  this.handleScroll = this.throttle(this.onScroll.bind(this), 100)
  window.addEventListener('scroll', this.handleScroll, { passive: true })
}

onScroll() {
  const scrollY = window.scrollY
  // 处理滚动
}

throttle(func, delay) {
  let lastCall = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

cleanup() {
  window.removeEventListener('scroll', this.handleScroll)
}
```

### 模式 4：Intersection Observer（观察可见性）

```javascript
observeSections() {
  const sections = document.querySelectorAll('[data-section-id]')
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.dataset.sectionId
          this.setActive(sectionId)
        }
      })
    },
    { threshold: 0.5 }
  )
  
  sections.forEach((section) => observer.observe(section))
  
  // 保存以便清理
  this.sectionObserver = observer
}

cleanup() {
  if (this.sectionObserver) {
    this.sectionObserver.disconnect()
  }
}
```

---

## ⚡ 性能优化

### 1. 事件委托

```javascript
// ❌ 不推荐：为每个元素绑定
buttons.forEach(button => {
  button.addEventListener('click', handler)
})

// ✅ 推荐：事件委托
this.addEventListener('click', (event) => {
  if (event.target.matches('.button')) {
    handler(event)
  }
})
```

### 2. 增量 DOM 更新

```javascript
// ❌ 不推荐：完全重渲染
updateState(newState) {
  this.state = newState
  this.innerHTML = this.render() // 丢失所有 DOM 状态
}

// ✅ 推荐：增量更新
updateState(newState) {
  this.state = { ...this.state, ...newState }
  
  // 只更新变化的部分
  const element = this.querySelector('.count')
  if (element) {
    element.textContent = this.state.count
  }
}
```

### 3. 节流和防抖

```javascript
// 节流：固定时间间隔
throttle(func, delay) {
  let lastCall = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// 防抖：延迟执行
debounce(func, delay) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}
```

---

## ✅ 检查清单

创建新组件时确保：

- [ ] 文件放在 `frontend/islands/` 目录
- [ ] 使用 kebab-case 文件名
- [ ] 类名使用 PascalCase
- [ ] 实现 `connectedCallback()`
- [ ] **必须**实现 `disconnectedCallback()` 清理资源
- [ ] 使用 `data-*` 属性传递配置
- [ ] 使用事件委托优化性能
- [ ] 使用增量 DOM 更新
- [ ] 添加错误处理
- [ ] 注册自定义元素 `customElements.define()`
- [ ] 在 Liquid 中正确引用

---

## 🚨 常见错误

| 错误 | 正确 |
|------|------|
| 忘记清理事件监听器 | 在 `disconnectedCallback()` 中移除 |
| 使用 `innerHTML` 更新状态 | 使用增量 DOM 更新 |
| 没有绑定 `this` | 在 `constructor` 中绑定方法 |
| 没有注册自定义元素 | 添加 `customElements.define()` |
| 元素名没有连字符 | 必须使用 kebab-case |

---

## 📚 参考资源

- 项目示例：`frontend/islands/example-component.js`
- Shadow DOM 示例：`frontend/islands/isolated-widget.js`
- MDN 文档：[Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- 开发规范：`.cursor/rules/shopify-theme-standards.mdc`

---

**现在你可以开始创建锚点导航组件了！** 🚀
