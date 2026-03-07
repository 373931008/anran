# 开发规范更新日志

## 📅 2026-02-01 - 第二次更新：Islands 架构规范

### ✨ 新增规则

#### 7. JavaScript 交互实现规范 ⭐⭐⭐

**新增内容**：
- 所有 JavaScript 功能使用 Islands 架构
- 自定义元素（Custom Elements）方式实现
- 文件统一放在 `frontend/islands/` 目录

**Islands 架构优势**：
- ✅ 组件隔离，避免命名冲突
- ✅ 按需加载，提升性能
- ✅ 自动资源管理（connectedCallback/disconnectedCallback）
- ✅ 符合 Web Components 标准

**命名规范**：

| 组件类型 | 文件名 | 自定义元素名 |
|---------|--------|-------------|
| 锚点导航 | `anchor-navigation.js` | `<anchor-navigation>` |
| 产品轮播 | `product-swiper.js` | `<product-swiper>` |
| 倒计时器 | `countdown-timer.js` | `<countdown-timer>` |

**基本模板**：
```javascript
export default class ComponentName extends HTMLElement {
  constructor() {
    super()
    this.state = {}
    this.handleEvent = this.handleEvent.bind(this)
  }

  connectedCallback() {
    this.init()
  }

  disconnectedCallback() {
    this.cleanup() // ⚠️ 必须清理资源
  }
}

customElements.define('component-name', ComponentName)
```

**影响文件**：
- `shopify-theme-standards.mdc` - 新增第 5 节
- `QUICK-REFERENCE.md` - 新增第 7 节

#### 8. Sticky 定位规范

**方案 A：贴顶部**（推荐简单场景）

```liquid
<div class="tw-sticky tw-top-0 tw-z-40 tw-bg-white">
  导航内容
</div>
```

**Z-index 层级规范**：

| 层级 | Z-index | 用途 |
|------|---------|------|
| 模态框/主导航 | 50 | 最高层级 |
| 锚点导航 | 40 | 页面内导航 |
| 悬浮按钮 | 30 | 返回顶部等 |
| 内容层 | 10 | 默认内容 |

---

## 📅 2026-02-01 - 第一次更新：响应式和像素值规范

### ✨ 新增规则

#### 1. 简化响应式断点策略 ⭐⭐⭐

**变更内容**：
- 只使用 **一个断点**：`lg: 1024px`
- 移除 `sm:`、`md:`、`xl:` 的使用

**原因**：
- 简化代码，提高可维护性
- 移动端（< 1024px）和 PC 端（≥ 1024px）界限清晰
- 对应 Figma 设计稿的两套方案（375px 移动端 + 1920px PC 端）

**影响文件**：
- `responsive-design.mdc`
- `README.md`

#### 2. 像素值标准化规则 ⭐⭐⭐

**新增要求**：
- 所有自定义像素值必须是 **整数且为偶数**
- 小数值向上取整到偶数
- 奇数值 +1 变为偶数

**转换规则表**：

| Figma 设计稿 | 标准化后 | 规则 |
|-------------|---------|------|
| `163.5px` | `164px` | 小数向上到偶数 |
| `91.5px` | `92px` | 小数向上到偶数 |
| `163px` | `164px` | 奇数 +1 |
| `335px` | `336px` | 奇数 +1（设计稿特殊值可保留）|
| `560px` | `560px` | ✅ 已是偶数 |

**原因**：
- 避免亚像素渲染问题
- 确保跨设备一致性
- 方便使用 `/2` 计算居中
- 提高代码可读性

**影响文件**：
- `shopify-theme-standards.mdc`
- `responsive-design.mdc`
- `README.md`

---

### 📝 更新的文件

1. **shopify-theme-standards.mdc**
   - ✅ 新增"像素值标准化规则"章节
   - ✅ 更新 Tailwind 配置说明（只用 lg 断点）
   - 行数：308 行

2. **responsive-design.mdc**
   - ✅ 简化断点配置（只保留 lg）
   - ✅ 新增"像素值标准化"章节
   - ✅ 添加错误示例对比
   - 行数：271 行

3. **README.md**
   - ✅ 更新 Tailwind 配置说明
   - ✅ 新增"响应式设计原则"章节
   - ✅ 添加"像素值转换规则"表格
   - 行数：209 行

4. **QUICK-REFERENCE.md** 🆕
   - ✅ 新建快速参考文档
   - ✅ 包含所有核心规则的快速查阅
   - ✅ 提供尺寸对照表
   - ✅ 常见错误列表
   - 行数：约 200 行

---

### 📊 规范文件统计

| 文件 | 大小 | 行数 | 说明 |
|------|------|------|------|
| `shopify-theme-standards.mdc` | 8.1 KB | 308 行 | Shopify Liquid 开发规范 |
| `responsive-design.mdc` | 7.9 KB | 271 行 | 响应式设计规范 |
| `project-conventions.mdc` | 2.9 KB | 149 行 | 项目通用规范 |
| `README.md` | 6.0 KB | 209 行 | 规范使用说明 |
| `QUICK-REFERENCE.md` 🆕 | 5.6 KB | ~200 行 | 快速参考手册 |

**总计**：约 **30.5 KB**，**1,294 行**完整开发规范

---

### 🎯 关键变更对比

#### 断点使用

**之前**：
```liquid
<div class="tw-text-base md:tw-text-lg lg:tw-text-2xl xl:tw-text-3xl">
```

**现在**：
```liquid
<div class="tw-text-base lg:tw-text-2xl">
```

#### 像素值

**之前**：
```liquid
<div class="tw-w-[163.5px] tw-h-[91px]">
```

**现在**：
```liquid
<div class="tw-w-[164px] tw-h-[92px]">
```

---

### 📚 快速参考

查看 `QUICK-REFERENCE.md` 文件获取：
- ⚡ 核心规则（必须遵守）
- 📐 常用尺寸对照表
- 🎨 响应式布局模式
- 🖼️ 响应式图片实现
- 🔄 Swiper 差异化方案
- ✅ 开发检查清单
- 🚨 常见错误列表

---

### 🔄 迁移指南

如果你有现有代码需要更新：

#### 1. 移除多余断点

```bash
# 查找使用了 md: 的代码
grep -r "md:tw-" sections/

# 替换为 lg:
# md:tw-text-lg → lg:tw-text-2xl
```

#### 2. 标准化像素值

```bash
# 查找小数像素值
grep -r "\[.*\.5px\]" sections/

# 查找奇数像素值（需要手动检查）
grep -r "tw-[wh]-\[[0-9]*[13579]px\]" sections/
```

#### 3. 验证响应式

- 测试 < 1024px（移动端）
- 测试 ≥ 1024px（PC 端）
- 确认布局正确切换

---

### ✅ 验证检查清单

使用更新后的规范时，确保：

- [ ] 只使用 `lg:` 断点（不用 sm/md/xl）
- [ ] 所有自定义像素值是偶数
- [ ] Tailwind 类使用 `tw-` 前缀
- [ ] Schema 提供有效默认值
- [ ] 使用 `container` 控制宽度
- [ ] 轮播使用 `swiper-container`
- [ ] 图片使用响应式方案

---

### 💡 最佳实践示例

完整的响应式 Section 示例（符合所有新规则）：

```liquid
{%- comment -%}
  Product Campaign Section
  符合最新开发规范：
  - 只使用 lg 断点
  - 像素值全部为偶数
{%- endcomment -%}

<div class="{% unless section.settings.full_width %}container{% endunless %}">
  <div class="tw-flex tw-flex-col lg:tw-flex-row tw-gap-8 lg:tw-gap-10">
    
    <!-- 图片区：336x336 → 560x560 -->
    <div class="tw-w-[336px] lg:tw-w-[560px]">
      <swiper-container
        class="tw-h-[336px] lg:tw-h-[560px]"
        pagination="true"
      >
        <!-- slides -->
      </swiper-container>
    </div>
    
    <!-- 详情区：336px → 600px -->
    <div class="tw-w-full lg:tw-w-[600px]">
      <h1 class="tw-text-[28px] lg:tw-text-[40px] tw-font-semibold">
        {{ section.settings.title }}
      </h1>
      <!-- 更多内容 -->
    </div>
  </div>
</div>
```

---

### 🎉 更新完成

所有开发规范已更新完毕！新的规范将帮助你：

1. ✅ 简化响应式开发（只用一个断点）
2. ✅ 避免像素渲染问题（偶数值）
3. ✅ 提高代码一致性
4. ✅ 减少决策时间
5. ✅ 提升可维护性

开始使用新规范开发吧！🚀
