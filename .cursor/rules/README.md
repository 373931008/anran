# Cursor 开发规范

本目录包含 Siipet Shopify 主题项目的 Cursor AI 开发规范。

## 📋 规则文件

| 文件 | 说明 | 应用范围 | 行数 |
|------|------|----------|------|
| `project-conventions.mdc` | 项目通用开发规范 | 全局（始终应用） | 148 行 |
| `shopify-theme-standards.mdc` | Shopify Liquid 主题开发规范 | `sections/**/*.liquid` | 307 行 |
| `responsive-design.mdc` | 响应式设计最佳实践 | `**/*.liquid` | 270 行 |

**总计**: 725 行完整的开发规范

## 🎯 规范内容概览

### 1. Shopify 主题开发规范 (`shopify-theme-standards.mdc`)

**核心要点**:

- ✅ **样式**: 优先使用 Tailwind CSS（`tw-` 前缀）
- ✅ **布局**: 使用 `container` 类控制内容宽度
- ✅ **Schema**: 所有 `url`、`video_url`、`color` 必须提供有效默认值
- ✅ **轮播**: 优先使用 `swiper-container` Web Component
- ✅ **验证**: 使用 Shopify Dev MCP 验证代码

**包含内容**:
- Tailwind CSS 使用规范
- Container 布局配置
- Schema 字段类型注意事项（含完整类型表格）
- Swiper 轮播实现（包括 Thumbs 联动）
- 响应式设计模式
- 性能优化（图片懒加载、响应式尺寸）
- Liquid 最佳实践
- MCP 工具使用方法
- 完整检查清单

### 2. 项目通用规范 (`project-conventions.mdc`)

**适用**: 所有文件（全局规则）

**包含内容**:
- 技术栈说明
- 代码风格（中文注释）
- 文件命名规范
- MCP 工具使用指南（Figma、Shopify、Swiper）
- Git Commit 规范
- 开发流程
- 注意事项

### 3. 响应式设计规范 (`responsive-design.mdc`)

**包含内容**:
- Tailwind 断点配置
- 移动端优先设计原则
- 常用响应式模式：
  - 文字大小适配
  - 间距适配
  - 布局适配（Flex、Grid）
  - 宽度限制
- 响应式图片（Picture、Sizes、性能优化）
- 响应式视频
- 常见场景示例：
  - Hero Banner
  - 产品卡片网格
  - 左右分栏
- 检查清单

## 🚀 如何使用

### 自动应用

Cursor 会根据文件类型自动应用对应的规则：

- 编辑任何文件 → 应用 `project-conventions.mdc`（全局规则）
- 编辑 `sections/*.liquid` → 应用 `shopify-theme-standards.mdc`
- 编辑任何 `.liquid` 文件 → 可应用 `responsive-design.mdc`

### 手动触发

在 Cursor 中：
1. 按 `Cmd+Shift+P`（Mac）或 `Ctrl+Shift+P`（Windows）
2. 搜索 "Rules"
3. 选择需要应用的规则

## 📚 补充说明

### Schema 默认值规范（重点）

| 类型 | 是否必需默认值 | 示例 |
|------|----------------|------|
| `image_picker` | ❌ 否 | - |
| `url` | ✅ 是 | `"/"` |
| `video_url` | ✅ 是 | YouTube/Vimeo 链接 |
| `color` | ✅ 是 | `"#FFFFFF"` |
| `number`/`range` | ✅ 是 | 具体数字 |

### Tailwind 配置

- **前缀**: `tw-`
- **断点**: **只使用 `lg: 1024px`**（移动端 < 1024px，PC 端 ≥ 1024px）
- **Container**: 自动居中，响应式内边距
- **像素值**: **必须是整数且为偶数**（如 `164px` 而非 `163.5px`）

### 响应式设计原则 ⭐

```liquid
<!-- ✅ 正确：只使用 lg 断点 -->
<div class="tw-w-[336px] lg:tw-w-[560px]">
<div class="tw-text-base lg:tw-text-2xl">
<div class="tw-flex-col lg:tw-flex-row">

<!-- ❌ 错误：不使用其他断点 -->
<div class="tw-text-base md:tw-text-lg lg:tw-text-2xl">

<!-- ❌ 错误：小数或奇数像素值 -->
<div class="tw-w-[163.5px] tw-h-[91px]">

<!-- ✅ 正确：整数偶数像素值 -->
<div class="tw-w-[164px] tw-h-[92px]">
```

### 像素值转换规则

| Figma 设计稿 | 标准化后 | 说明 |
|-------------|---------|------|
| `163.5px` | `164px` | 小数向上取整到偶数 |
| `91.5px` | `92px` | 小数向上取整到偶数 |
| `163px` | `164px` | 奇数 +1 变偶数 |
| `335px` | `336px` | 奇数 +1（设计稿值可保留）|
| `560px` | `560px` | ✅ 已是偶数 |

### MCP 工具

项目集成了以下 MCP 服务器：

- **user-Figma**: 读取 Figma 设计稿
- **user-shopify-dev-mcp**: 验证 Shopify Liquid 代码
- **user-swiper**: 获取 Swiper 官方示例和文档

## 🔍 示例代码

### 创建 Section 的完整示例

```liquid
{%- comment -%}
  Section: 产品特性展示
  功能：使用 Swiper 展示产品特性
{%- endcomment -%}

<style>
  #shopify-section-{{ section.id }} .feature-slide {
    /* 组件专属样式 */
  }
</style>

<div class="{% unless section.settings.full_width %}container{% endunless %}">
  <div class="tw-py-8 lg:tw-py-16">
    <h2 class="tw-text-2xl lg:tw-text-4xl tw-font-bold tw-text-center">
      {{ section.settings.title }}
    </h2>
    
    <swiper-container
      slides-per-view="1"
      navigation="true"
      pagination="true"
      class="tw-mt-8"
    >
      {%- for block in section.blocks -%}
        <swiper-slide>
          <div class="tw-aspect-video">
            {{ block.settings.image | image_url: width: 800 | 
               image_tag: loading: 'lazy' }}
          </div>
        </swiper-slide>
      {%- endfor -%}
    </swiper-container>
  </div>
</div>

{% schema %}
{
  "name": "产品特性",
  "settings": [
    {
      "type": "checkbox",
      "id": "full_width",
      "label": "全宽显示",
      "default": false
    },
    {
      "type": "text",
      "id": "title",
      "label": "标题",
      "default": "产品特性"
    }
  ],
  "blocks": [
    {
      "type": "slide",
      "name": "幻灯片",
      "settings": [
        {
          "type": "image_picker",
          "id": "image",
          "label": "图片"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "产品特性"
    }
  ]
}
{% endschema %}
```

## 📝 更新日志

- **2026-02-01**: 创建初始规则文件
  - 添加 Shopify 主题开发规范
  - 添加项目通用规范
  - 添加响应式设计规范

## 🤝 贡献

如需更新规则，请编辑对应的 `.mdc` 文件并保持：
- 每个规则文件 < 500 行
- 包含具体代码示例
- 提供清晰的 ✅/❌ 对比
- 添加检查清单

---

**注意**: 这些规则会持续影响 Cursor AI 的代码生成和建议，请确保规范的准确性和实用性。
