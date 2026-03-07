# 快速设置指南

## 🚀 5分钟快速开始

### 1. 复制模板到新项目

```bash
# 复制整个vite-theme目录到你的新项目
cp -r vite-theme/ my-new-shopify-theme/
cd my-new-shopify-theme/
```

### 2. 必要配置修改

#### A. 修改构建输出文件名

编辑 `vite.config.mjs`，第20-22行：

```javascript
// 将 [project-name] 替换为你的项目名（例如：mystore）
entryFileNames: 'mystore.[name].min.js',
chunkFileNames: 'mystore.[name].min.js',
assetFileNames: 'mystore.[name].min[extname]'
```

#### B. 更新项目信息

编辑 `package.json`：

```json
{
  "name": "my-shopify-theme",
  "description": "我的Shopify主题项目",
  "author": "你的名字"
}
```

### 3. 安装依赖

```bash
# 推荐使用pnpm
pnpm install

# 或使用npm
npm install
```

### 4. 开发模式

```bash
# 如果已配置Shopify CLI
pnpm start

# 或仅启动Vite开发服务器
pnpm run vite:dev
```

## 📋 详细配置清单

### 必须修改的文件

- [ ] `vite.config.mjs` - 修改输出文件名前缀
- [ ] `package.json` - 更新项目名称和作者信息
- [ ] `.cursorrules.mdc` - 根据项目需要调整规则

### 可选修改的文件

- [ ] `tailwind.config.cjs` - 添加自定义颜色和样式
- [ ] `frontend/styles/base.css` - 修改CSS变量和基础样式
- [ ] `README.md` - 更新项目说明文档

### Shopify集成配置

如果要与Shopify主题集成：

1. **创建基础Shopify主题结构**：
   ```
   assets/
   layout/
   sections/
   snippets/
   templates/
   config/
   locales/
   ```

2. **在layout/theme.liquid中引入构建文件**：
   ```liquid
   {{ 'mystore.theme.min.css' | asset_url | stylesheet_tag }}
   {{ 'mystore.theme.min.js' | asset_url | script_tag }}
   ```

3. **配置.shopifyignore（如果使用）**：
   ```
   frontend/
   node_modules/
   *.config.*
   .eslint*
   .prettier*
   ```

## 🔧 开发工具设置

### VSCode推荐扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "sissel.shopify-liquid"
  ]
}
```

### VSCode工作区设置

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.includeLanguages": {
    "liquid": "html"
  },
  "files.associations": {
    "*.liquid": "liquid"
  }
}
```

## 🎯 开发工作流

### 1. 创建新组件

```bash
# 在frontend/islands/创建新组件
touch frontend/islands/product-card.js
```

### 2. 组件开发模板

```javascript
// frontend/islands/product-card.js
export default class ProductCard extends HTMLElement {
  connectedCallback() {
    try {
      this.render()
      this.setupEventListeners()
    } catch (error) {
      console.error('ProductCard initialization failed:', error)
      this.renderErrorState()
    }
  }

  render() {
    this.innerHTML = `
      <div class="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-4">
        <h3 class="tw-text-lg tw-font-semibold">产品标题</h3>
        <p class="tw-text-gray-600">产品描述</p>
      </div>
    `
  }

  setupEventListeners() {
    // 添加事件监听器
  }

  disconnectedCallback() {
    // 清理资源
  }
}

customElements.define('product-card', ProductCard)
```

### 3. 在模板中使用

```liquid
<!-- sections/products.liquid -->
<product-card client:visible></product-card>
```

## 🚨 常见问题解决

### 构建失败

1. **检查Node.js版本** (推荐16+)
2. **清理依赖重新安装**：
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### 样式不显示

1. **确认使用tw-前缀**
2. **检查Tailwind配置文件路径**
3. **确认CSS文件正确导入**

### Island组件不工作

1. **检查组件文件名与HTML标签匹配**
2. **确认customElements.define()调用**
3. **查看浏览器控制台错误**

## 📚 学习资源

- [Vite官方文档](https://vitejs.dev/)
- [TailwindCSS文档](https://tailwindcss.com/)
- [Web Components MDN](https://developer.mozilla.org/docs/Web/Web_Components)
- [Shopify主题开发](https://shopify.dev/themes)

---

**配置完成后，你就可以开始高效的Shopify主题开发了！** 🎉
