# 导航栏与菜单重构及规划记录 (Header & Menu Refactoring Record)

本文档记录了本次关于 Shopify Dawn 主题 `header` 及导航菜单的重构过程、已完成的工作以及后续的开发规划。

## 1. 代码清理与解耦 (已完成)
针对原本臃肿的 `sections/header.liquid` 进行了拆分，提升了代码的可维护性和页面加载性能：
- **提取 Logo 渲染逻辑**：新建 `snippets/header-logo.liquid`，消除重复的 Logo 渲染代码，支持传入 `logo_class` 和 `logo_sizes`。
- **提取 SEO 结构化数据**：新建 `snippets/seo-schema-header.liquid`，将底部的 JSON-LD 脚本抽离。
- **提取 JavaScript**：新建 `assets/sticky-header.js`，将 `StickyHeader` 类抽离为独立文件并引入，添加了详细的中文注释。

## 2. 电脑端一级导航样式调整 (已完成)
根据 Figma 设计稿，在 `sections/header.liquid` 中添加了自定义 CSS：
- 字体设置为 `Poppins`, 18px, 颜色 `#1e1e1e`。
- 鼠标悬停 (Hover) 和激活 (Active) 状态颜色改为蓝色 `#1565d8`，并去除了默认的下划线 (`text-decoration: none`)。
- 调整了菜单项间距 (`gap: 2rem`) 和右侧图标间距 (`gap: 16px`)。
- 强制右侧所有图标尺寸统一为 `24px`。

## 3. 全局图标替换 (已完成)
使用设计稿提供的 SVG 代码，直接替换了主题的默认资产文件，确保全站统一：
- `assets/icon-search.svg` (搜索)
- `assets/icon-account.svg` (用户)
- `assets/icon-cart.svg` / `assets/icon-cart-empty.svg` (购物袋)
- `assets/icon-hamburger.svg` (移动端汉堡菜单)

## 4. 移动端抽屉菜单重构 (已完成)
对 `snippets/header-drawer.liquid` 进行了深度定制：
- **顶部结构**：添加了包含 Logo 和关闭按钮的自定义 Header。
- **搜索栏**：在导航列表上方插入了带圆角边框的搜索框。
- **导航列表**：调整了字体样式 (`Poppins`, 18px, Medium)。
- **底部区域**：
  - 添加了带图标的 "Log in" 链接。
  - 添加了信任徽章列表 (30-Day Trial, Free Local Shipping, 2-Year Warranty 等)。
  - 添加了 "Payment Secured" 模块。
- **层级修复 (Z-index)**：将 `.section-header` 和 `.menu-drawer` 的 `z-index` 提升至浏览器最大值 `2147483647`，并设置 `fixed` 全屏，彻底解决了抽屉被顶部公告栏和第三方插件（如客服、多语言切换）覆盖穿透的问题。

## 5. 移动端后台配置项规划 (待开发)
为了让商家能在 Theme Editor 中灵活修改抽屉底部内容，计划在 `sections/header.liquid` 的 Schema 中添加：
- **信任徽章 (Trust Badges)**：作为 Block (类型 `trust_badge`)，包含 `icon` (图片) 和 `text` (文本)。
- **安全支付 (Payment Secured)**：作为 Section Settings，包含开启开关、标题和描述文案配置。

## 6. 电脑端超级菜单 (Mega Menu) 规划 (待开发)
根据 Figma 设计稿，超级菜单为两栏复杂布局：
- **左侧边栏 (二级菜单)**：垂直排列的分类列表（支持 Hover 切换右侧内容，支持 "Hot" 徽章）。
- **右侧内容区 (三级菜单及产品展示)**：
  - 顶部：水平排列的药丸状 (Pill) 子分类标签和 "View all" 链接。
  - 下方：产品网格 (Grid)，展示产品图片、标题、描述和促销徽章 (New, 20% OFF 等)。

**实现思路**：
1. **Schema 配置**：在 Header 中添加 `mega_menu` Block，配置触发超级菜单的一级菜单名称。
2. **数据获取**：直接通过导航菜单关联的 Collection (`link.object`) 动态获取产品数据，减少商家重复配置。
3. **DOM 结构**：重写 `snippets/header-mega-menu.liquid`，构建左右分栏的 HTML 结构。
4. **交互逻辑**：编写 JS 监听左侧菜单的 `mouseenter` 事件，动态切换右侧对应的 Panel 面板显示。