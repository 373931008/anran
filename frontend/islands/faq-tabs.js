/**
 * FAQ Tab 切换 + 手风琴动画组件
 *
 * @description
 * 实现 FAQ 板块的 Tab 分类切换和手风琴展开收起功能
 * - 点击 Tab 按钮后，显示对应分类的 FAQ 条目，隐藏其余条目
 * - 点击问题行，以 slide down 动画展开/收起答案区域
 * - 展开时 summary 下方圆角消失，视觉上与答案区连接
 *
 * @features
 * - 事件委托监听 Tab 按钮点击和条目点击
 * - 切换激活 Tab 样式
 * - 显示/隐藏对应分类的 FAQ 条目
 * - max-height 过渡实现 slide down 动画
 * - 支持默认展开第一条（data-open 属性）
 * - 键盘可访问（Enter/Space 触发）
 *
 * @author Siipet Theme
 * @version 1.1.0
 */
export default class FaqTabs extends HTMLElement {
  constructor() {
    super()
    console.log('FaqTabs#########1211121')
    this.handleTabClick = this.handleTabClick.bind(this)
    this.handleItemClick = this.handleItemClick.bind(this)
    this.handleItemKeydown = this.handleItemKeydown.bind(this)
  }

  connectedCallback() {
    this.init()
  }

  disconnectedCallback() {
    this.cleanup()
  }

  /**
   * 初始化组件
   * @private
   */
  init() {
    this.tabBar = this.querySelector('.q-faq__tab-bar')
    this.list = this.querySelector('.q-faq__list')

    if (this.tabBar) {
      this.tabBar.addEventListener('click', this.handleTabClick)
    }

    if (this.list) {
      this.list.addEventListener('click', this.handleItemClick)
      this.list.addEventListener('keydown', this.handleItemKeydown)
    }

    // 默认展开第一条（带 data-open-default 标记的条目）
    const defaultOpen = this.querySelector('.q-faq__item--default-open')
    if (defaultOpen) {
      this.openItem(defaultOpen, false)
    }

    // 初始 Tab 激活
    const firstActiveBtn = this.tabBar
      ? this.tabBar.querySelector('.q-faq__tab-btn--active')
      : null
    if (firstActiveBtn) {
      this.switchTab(firstActiveBtn.dataset.tab)
    }
  }

  /**
   * 清理事件监听器
   * @private
   */
  cleanup() {
    if (this.tabBar) {
      this.tabBar.removeEventListener('click', this.handleTabClick)
    }
    if (this.list) {
      this.list.removeEventListener('click', this.handleItemClick)
      this.list.removeEventListener('keydown', this.handleItemKeydown)
    }
  }

  /**
   * 处理 Tab 点击事件（事件委托）
   * @param {Event} event
   * @private
   */
  handleTabClick(event) {
    const btn = event.target.closest('.q-faq__tab-btn')
    if (!btn) return

    const tabId = btn.dataset.tab
    if (!tabId) return

    this.switchTab(tabId)
  }

  /**
   * 处理 FAQ 条目点击事件（事件委托）
   * @param {Event} event
   * @private
   */
  handleItemClick(event) {
    const summary = event.target.closest('.q-faq__summary')
    if (!summary) return

    const item = summary.closest('.q-faq__item')
    if (!item) return

    this.toggleItem(item)
  }

  /**
   * 处理键盘事件（可访问性）
   * @param {Event} event
   * @private
   */
  handleItemKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return

    const summary = event.target.closest('.q-faq__summary')
    if (!summary) return

    event.preventDefault()
    const item = summary.closest('.q-faq__item')
    if (item) this.toggleItem(item)
  }

  /**
   * 切换到指定 Tab
   * @param {string} tabId - Tab 标识
   * @public
   */
  switchTab(tabId) {
    // 更新 Tab 按钮激活状态
    if (this.tabBar) {
      const allBtns = this.tabBar.querySelectorAll('.q-faq__tab-btn')
      allBtns.forEach((btn) => {
        if (btn.dataset.tab === tabId) {
          btn.classList.add('q-faq__tab-btn--active')
          btn.setAttribute('aria-selected', 'true')
        } else {
          btn.classList.remove('q-faq__tab-btn--active')
          btn.setAttribute('aria-selected', 'false')
        }
      })
    }

    // 显示/隐藏对应分类的 FAQ 条目，收起隐藏的条目
    const allItems = this.querySelectorAll('.q-faq__item')
    allItems.forEach((item) => {
      if (item.dataset.tabGroup === tabId) {
        item.hidden = false
      } else {
        item.hidden = true
        this.closeItem(item, false)
      }
    })
  }

  /**
   * 切换条目展开/收起状态
   * @param {HTMLElement} item
   * @public
   */
  toggleItem(item) {
    if (item.hasAttribute('data-open')) {
      this.closeItem(item, true)
    } else {
      this.openItem(item, true)
    }
  }

  /**
   * 展开条目（slide down 动画）
   * @param {HTMLElement} item
   * @param {boolean} animate - 是否播放动画
   * @public
   */
  openItem(item, animate) {
    const answerWrap = item.querySelector('.q-faq__answer-wrap')
    const summary = item.querySelector('.q-faq__summary')

    item.setAttribute('data-open', '')
    if (summary) summary.setAttribute('aria-expanded', 'true')

    if (!answerWrap) return

    if (animate) {
      answerWrap.style.transition = 'max-height 0.3s ease'
      answerWrap.style.maxHeight = answerWrap.scrollHeight + 'px'

      answerWrap.addEventListener(
        'transitionend',
        () => {
          // 动画完成后设为较大固定值，防止内容变化时被截断
          answerWrap.style.maxHeight = '2000px'
          answerWrap.style.transition = ''
        },
        { once: true }
      )
    } else {
      // 无动画直接展开：设为足够大的值确保内容可见
      answerWrap.style.transition = ''
      answerWrap.style.maxHeight = '2000px'
    }
  }

  /**
   * 收起条目（slide up 动画）
   * @param {HTMLElement} item
   * @param {boolean} animate - 是否播放动画
   * @public
   */
  closeItem(item, animate) {
    const answerWrap = item.querySelector('.q-faq__answer-wrap')
    const summary = item.querySelector('.q-faq__summary')

    item.removeAttribute('data-open')
    if (summary) summary.setAttribute('aria-expanded', 'false')

    if (!answerWrap) return

    if (animate) {
      // 先将 maxHeight 固定为实际内容高度（从 2000px 收拢到真实高度，触发重绘）
      const currentHeight = answerWrap.scrollHeight + 'px'
      answerWrap.style.transition = 'none'
      answerWrap.style.maxHeight = currentHeight

      // 强制浏览器重绘，确保上一步的高度已生效
      // eslint-disable-next-line no-unused-expressions
      answerWrap.offsetHeight

      // 再启动动画收起到 0
      answerWrap.style.transition = 'max-height 0.3s ease'
      answerWrap.style.maxHeight = '0'
    } else {
      answerWrap.style.transition = 'none'
      answerWrap.style.maxHeight = '0'
    }
  }
}

if (!window.customElements.get('faq-tabs')) {
  window.customElements.define('faq-tabs', FaqTabs)
}
