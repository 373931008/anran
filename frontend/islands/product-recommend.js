/**
 * 产品推荐 Tab 切换组件
 *
 * @description
 * 实现产品推荐板块的 Tab 分类切换功能
 * - 点击 Tab 按钮后，显示对应分类的产品卡片，隐藏其余分类
 * - 移动端和桌面端共用同一套 swiper-slide 卡片，通过 CSS 切换布局
 *
 * @version 2.0.0
 */
export default class ProductRecommendTabs extends HTMLElement {
  constructor() {
    super()
    this.handleTabClick = this.handleTabClick.bind(this)
  }

  connectedCallback() {
    this.init()
  }

  disconnectedCallback() {
    this.cleanup()
  }

  init() {
    this.tabBar = this.querySelector('.q-pr__tab-bar')
    this.swiper = this.querySelector('swiper-container')

    if (this.tabBar) {
      this.tabBar.addEventListener('click', this.handleTabClick)
    }

    // 初始化：显示第一个 Tab 对应的卡片
    const firstActiveBtn = this.tabBar
      ? this.tabBar.querySelector('.q-pr__tab-btn--active')
      : null
    if (firstActiveBtn) {
      this.switchTab(firstActiveBtn.dataset.tab, false)
    }
  }

  cleanup() {
    if (this.tabBar) {
      this.tabBar.removeEventListener('click', this.handleTabClick)
    }
  }

  /**
   * 处理 Tab 按钮点击（事件委托）
   * @param {Event} event
   */
  handleTabClick(event) {
    const btn = event.target.closest('.q-pr__tab-btn')
    if (!btn) return

    const tabId = btn.dataset.tab
    if (!tabId) return

    this.switchTab(tabId, true)
  }

  /**
   * 切换到指定 Tab
   * @param {string} tabId - Tab 编号（'1', '2' 等）
   * @param {boolean} animate - 是否触发 Swiper 更新
   */
  switchTab(tabId, animate) {
    // 更新 Tab 按钮激活状态
    if (this.tabBar) {
      this.tabBar.querySelectorAll('.q-pr__tab-btn').forEach((btn) => {
        const isActive = btn.dataset.tab === tabId
        btn.classList.toggle('q-pr__tab-btn--active', isActive)
        btn.setAttribute('aria-selected', String(isActive))
      })
    }

    // 更新卡片显示（移动端 Swiper / 桌面端 Grid 共用）
    if (this.swiper) {
      const slides = this.swiper.querySelectorAll('swiper-slide')
      slides.forEach((slide) => {
        if (slide.dataset.tabGroup === tabId) {
          slide.style.display = ''
        } else {
          slide.style.display = 'none'
        }
      })

      // 切换后重置滚动位置并更新 Swiper（仅移动端有效）
      if (animate && this.swiper.swiper) {
        this.swiper.swiper.slideTo(0, 0)
        this.swiper.swiper.update()
      }
    }
  }
}

if (!window.customElements.get('product-recommend-tabs')) {
  window.customElements.define('product-recommend-tabs', ProductRecommendTabs)
}
