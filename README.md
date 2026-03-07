# Shopify Vite 主题开发模板

一个现代化的Shopify主题开发模板，基于原生JavaScript + Vite构建工具，提供高性能的开发体验。
**专为只使用原生JavaScript的开发者设计，无需学习复杂框架！**

## ✨ 特性

- 🚀 **Vite**: 快速的开发构建工具，支持HMR和代码分割
- 🎯 **原生JavaScript**: 纯JavaScript开发，无需学习复杂框架
- 📦 **模块化**: 简单的ES6模块，容易理解和使用
- 🔧 **代码质量**: ESLint + Prettier + Husky + lint-staged 完整工作流
- 📱 **响应式**: 移动优先的设计理念
- ⚡ **性能优化**: 自动代码分割、懒加载、Core Web Vitals监控
- 🛠️ **开发体验**: VSCode配置、扩展推荐、编辑器统一
- 📊 **性能监控**: 内置Web Vitals监控和性能优化工具
- 🛒 **Shopify集成**: 完整的API工具库和最佳实践

## 🛠 技术栈

- **构建工具**: Vite 5.3.5 + Shopify CLI
- **JavaScript**: ES6+ 模块，Island架构
- **代码质量**: ESLint + Prettier + PostCSS
- **包管理器**: pnpm

## 📁 项目结构

```
shopify-vite-theme/
├── frontend/                 # 现代前端开发目录
│   ├── api/                 # API相关功能
│   │   └── shopify.js       # Shopify API工具库
│   ├── components/          # 可重用组件和工具函数
│   │   ├── utils.js         # 通用工具函数
│   │   └── performance.js   # 性能优化工具
│   ├── entrypoints/         # Vite入口文件
│   │   ├── theme.js         # 主要JavaScript入口
│   │   └── theme.css        # 主要CSS入口
│   ├── islands/             # Island架构组件
│   │   ├── example-component.js    # 完整示例组件
│   │   └── isolated-widget.js      # Shadow DOM示例
│   ├── lib/                 # 工具库
│   │   └── revive.js        # Island架构核心
│   └── styles/              # 样式文件
│       └── base.css         # 基础样式和CSS变量
├── .vscode/                 # VSCode配置
│   ├── settings.json        # 工作区设置
│   └── extensions.json      # 推荐扩展
├── .husky/                  # Git钩子
│   └── pre-commit          # 提交前检查
├── config/                  # 配置文件
├── assets/                  # 构建输出目录（由Vite生成）
├── .editorconfig           # 编辑器配置
├── .browserslistrc         # 浏览器兼容性
├── .shopifyignore          # Shopify部署忽略
├── .theme-check.yml        # 主题检查配置
├── .eslintrc.cjs           # ESLint配置
├── .prettierrc.cjs         # Prettier配置
├── postcss.config.cjs      # PostCSS配置
├── vite.config.mjs         # Vite配置
├── CHANGELOG.md            # 版本更新日志
└── package.json            # 项目依赖
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 使用pnpm安装依赖（推荐）
pnpm install

# 或使用npm
npm install
```

### 2. 配置项目

在使用前，请修改以下配置：

#### 修改构建输出文件名

编辑 `vite.config.mjs`，将 `[project-name]` 替换为你的项目名：

```javascript
// vite.config.mjs
export default defineConfig({
  // ...其他配置
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'your-project.[name].min.js',     // 替换这里
        chunkFileNames: 'your-project.[name].min.js',     // 替换这里
        assetFileNames: 'your-project.[name].min[extname]' // 替换这里
      }
    }
  }
})
```

#### 更新package.json

修改 `package.json` 中的项目信息：

```json
{
  "name": "your-project-name",
  "description": "你的项目描述",
  "author": "你的名字"
}
```

### 3. 开发模式

```bash
# 启动开发服务器（需要先配置Shopify CLI）
pnpm start

# 或单独启动Vite开发服务器
pnpm run vite:dev
```

### 4. 构建部署

```bash
# 构建生产版本
pnpm build

# 构建并部署到Shopify
pnpm deploy
```

## 🏝️ Island架构使用指南

### 创建Island组件

#### 推荐方式：原生JavaScript组件

1. 在 `frontend/islands/` 目录创建组件文件：

```javascript
// frontend/islands/my-component.js - 纯原生JS，无需框架知识
export default class MyComponent extends HTMLElement {
  constructor() {
    super() // 必须调用super()
    
    // 组件的数据
    this.state = { count: 0 }
    
    // 绑定方法（确保this指向正确）
    this.handleClick = this.handleClick.bind(this)
  }

  // 组件被添加到页面时自动调用
  connectedCallback() {
    this.render()
    this.setupEventListeners()
  }

  // 组件从页面移除时自动调用（重要：清理资源）
  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick)
  }

  // 渲染页面内容 - 就是设置innerHTML
  render() {
    this.innerHTML = `
      <div class="counter-wrapper">
        <h3>计数器组件</h3>
        <p>当前计数: <span class="count-display">${this.state.count}</span></p>
        <button class="increment-btn btn-primary">
          点击增加
        </button>
      </div>
    `
  }

  // 绑定事件监听
  setupEventListeners() {
    this.addEventListener('click', this.handleClick)
  }

  // 处理点击事件
  handleClick(event) {
    if (event.target.classList.contains('increment-btn')) {
      this.updateState({ count: this.state.count + 1 })
    }
  }

  // 更新数据并刷新显示（只更新变化的部分，性能更好）
  updateState(newState) {
    const prevState = { ...this.state }
    this.state = { ...this.state, ...newState }
    
    // 只更新变化的部分，不重新渲染整个组件
    if (prevState.count !== this.state.count) {
      const countDisplay = this.querySelector('.count-display')
      if (countDisplay) {
        countDisplay.textContent = this.state.count
      }
    }
  }
}

// 注册自定义元素，之后就可以在HTML中使用<my-component></my-component>了
customElements.define('my-component', MyComponent)
```

#### 特殊场景：Shadow DOM组件

当需要完全样式隔离时：

```javascript
// frontend/islands/isolated-widget.js
export default class IsolatedWidget extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.state = { theme: 'light' }
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .widget { padding: 20px; background: white; }
        .widget.dark { background: #333; color: white; }
      </style>
      <div class="widget ${this.state.theme}">
        <p>隔离组件内容</p>
      </div>
    `
  }
}

customElements.define('isolated-widget', IsolatedWidget)
```

2. 在Liquid模板中使用：

```liquid
<!-- 立即加载 -->
<my-component></my-component>

<!-- 元素可见时加载 -->
<my-component client:visible></my-component>

<!-- 浏览器空闲时加载 -->
<my-component client:idle></my-component>

<!-- 媒体查询匹配时加载 -->
<my-component client:media="(min-width: 768px)"></my-component>
```

### 渐进式水合策略

- **无属性**: 立即加载和初始化
- **client:visible**: 元素进入视口时加载
- **client:idle**: 浏览器空闲时加载
- **client:media**: 媒体查询匹配时加载

## 🎨 样式开发指南

### 自定义样式

使用 CSS 变量和常规类名编写样式（推荐）：

```css
/* frontend/styles/base.css */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
}

.my-component {
  background-color: var(--color-primary);
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border-radius: 0.25rem;
}
```

## 🔧 开发工具

### 代码质量工具

```bash
# 格式化所有文件
pnpm format

# 检查格式是否正确
pnpm format:check

# 检查代码质量
pnpm lint

# 自动修复ESLint问题
pnpm lint:fix

# 类型检查
pnpm type-check

# Shopify主题检查
pnpm shopify:check

# 清理并重新安装依赖
pnpm clean
```

### Git提交工作流

项目配置了Git钩子，提交时会自动：
1. 运行ESLint检查并自动修复
2. 运行Prettier格式化
3. 只有通过检查才能提交

```bash
git add .
git commit -m "feat: 添加新功能"  # 会自动触发pre-commit检查
```

### 开发环境配置

项目包含完整的VSCode配置：

**推荐扩展**（自动推荐安装）：
- ESLint - 代码质量检查
- Prettier - 代码格式化
- Shopify Liquid - Liquid语法支持
- Path Intellisense - 路径智能提示
- Auto Rename Tag - 标签自动重命名

**工作区设置**：
- 保存时自动格式化
- ESLint自动修复
- 文件关联配置

### 性能监控

内置性能监控工具：

```javascript
import { initPerformanceOptimizations } from '@/components/performance.js'

// 初始化性能优化
const monitor = initPerformanceOptimizations()

// 获取性能指标
const metrics = monitor.getMetrics()
console.log('LCP:', metrics.lcp)
console.log('FID:', metrics.fid) 
console.log('CLS:', metrics.cls)
```

### Shopify API集成

```javascript
import { cart, product, search } from '@/api/shopify.js'

// 购物车操作
const cartData = await cart.get()
await cart.add({ id: variantId, quantity: 1 })

// 产品操作
const productData = await product.get('product-handle')
const recommendations = await product.getRecommendations(productId)

// 搜索功能
const results = await search.predictive('search query')
```

### 配置文件说明

- `.eslintrc.cjs`: ESLint规则配置
- `.prettierrc.cjs`: 代码格式化配置
- `postcss.config.cjs`: PostCSS插件配置
- `vite.config.mjs`: Vite构建配置
- `jsconfig.json`: JavaScript项目配置

## 📦 依赖管理

### 核心依赖

- **GSAP**: 高性能动画库
- **Swiper**: 现代触摸滑块
- **Motion**: Web动画API封装
- **Lucky Canvas**: 抽奖组件

### 添加新依赖

```bash
# 添加生产依赖
pnpm add package-name

# 添加开发依赖
pnpm add -D package-name
```

## 🚀 性能优化

### 自动优化

- **代码分割**: Vite自动进行代码分割
- **懒加载**: Island组件支持多种懒加载策略
- **资源压缩**: 生产环境自动压缩CSS和JS
- **版本号管理**: 避免缓存问题

### 手动优化

- 使用`client:visible`对非关键组件进行懒加载
- 合理使用`client:media`进行响应式加载
- 优化图片格式和大小
- 减少不必要的依赖

## 🔍 常见问题

### 1. Vite构建失败

检查Node.js版本（推荐16+）和依赖版本兼容性。

### 2. 样式不生效

检查 CSS 文件是否正确引入，类名是否与样式表一致。

### 3. Island组件不加载

确认组件文件名与HTML标签名匹配，检查浏览器控制台错误。

### 4. 开发服务器启动失败

确保Shopify CLI正确配置，检查端口占用情况。

## 📚 参考资源

- [Vite文档](https://vitejs.dev/)
- [Shopify主题开发文档](https://shopify.dev/themes)
- [Web Components规范](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License - 查看[LICENSE](LICENSE)文件了解详情。

---

**开发愉快！** 🎉

如果遇到问题或有建议，请创建Issue或联系开发团队。
