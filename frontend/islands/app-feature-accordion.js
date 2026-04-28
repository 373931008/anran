/**
 * App 功能手风琴 + 右侧/移动端配图联动
 *
 * @description
 * 手风琴交互与 faq-tabs（q-faq）一致：slide down、summary 旋转、键盘 Enter/Space。
 * 额外行为：同一时间仅展开一项；展开项变化时切换桌面端右侧配图。
 *
 * @version 1.0.0
 */
export default class AppFeatureAccordion extends HTMLElement {
  constructor() {
    super()
    /** @type {string | undefined} 最近一次关联右侧素材的条目索引；收起全部项时仍用于桌面端展示该配图 */
    this.lastMediaIndex = undefined
    this.handleItemClick = this.handleItemClick.bind(this)
    this.handleItemKeydown = this.handleItemKeydown.bind(this)
  }

  connectedCallback() {
    this.init()
  }

  disconnectedCallback() {
    this.cleanup()
  }

  init() {
    this.list = this.querySelector('.q-app-accordion__list')
    if (this.list) {
      this.list.addEventListener('click', this.handleItemClick)
      this.list.addEventListener('keydown', this.handleItemKeydown)
    }

    const defaultOpen = this.querySelector('.q-app-accordion__item--default-open')
    if (defaultOpen) {
      this.openItem(defaultOpen, false)
    }
    this.syncMedia()
  }

  cleanup() {
    if (this.list) {
      this.list.removeEventListener('click', this.handleItemClick)
      this.list.removeEventListener('keydown', this.handleItemKeydown)
    }
  }

  handleItemClick(event) {
    const summary = event.target.closest('.q-app-accordion__summary')
    if (!summary) return

    const item = summary.closest('.q-app-accordion__item')
    if (!item) return

    this.toggleItem(item)
  }

  handleItemKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return

    const summary = event.target.closest('.q-app-accordion__summary')
    if (!summary) return

    event.preventDefault()
    const item = summary.closest('.q-app-accordion__item')
    if (item) this.toggleItem(item)
  }

  /**
   * 切换展开：已展开则收起；否则先收起其它项再展开当前项（互斥）
   */
  toggleItem(item) {
    if (item.hasAttribute('data-open')) {
      this.closeItem(item, true)
    } else {
      this.querySelectorAll('.q-app-accordion__item[data-open]').forEach((el) => {
        if (el !== item) this.closeItem(el, true)
      })
      this.openItem(item, true)
    }
    this.syncMedia()
  }

  openItem(item, animate) {
    const answerWrap = item.querySelector('.q-app-accordion__answer-wrap')
    const summary = item.querySelector('.q-app-accordion__summary')

    const index = item.dataset.itemIndex
    if (index !== undefined && index !== '') {
      this.lastMediaIndex = index
    }

    item.setAttribute('data-open', '')
    if (summary) summary.setAttribute('aria-expanded', 'true')

    if (!answerWrap) return

    if (animate) {
      answerWrap.style.transition = 'max-height 0.3s ease'
      answerWrap.style.maxHeight = answerWrap.scrollHeight + 'px'

      answerWrap.addEventListener(
        'transitionend',
        () => {
          answerWrap.style.maxHeight = '2000px'
          answerWrap.style.transition = ''
        },
        { once: true }
      )
    } else {
      answerWrap.style.transition = ''
      answerWrap.style.maxHeight = '2000px'
    }
  }

  closeItem(item, animate) {
    const answerWrap = item.querySelector('.q-app-accordion__answer-wrap')
    const summary = item.querySelector('.q-app-accordion__summary')

    item.removeAttribute('data-open')
    if (summary) summary.setAttribute('aria-expanded', 'false')

    if (!answerWrap) return

    if (animate) {
      const currentHeight = answerWrap.scrollHeight + 'px'
      answerWrap.style.transition = 'none'
      answerWrap.style.maxHeight = currentHeight
      // eslint-disable-next-line no-unused-expressions
      answerWrap.offsetHeight
      answerWrap.style.transition = 'max-height 0.3s ease'
      answerWrap.style.maxHeight = '0'
    } else {
      answerWrap.style.transition = 'none'
      answerWrap.style.maxHeight = '0'
    }
  }

  syncMedia() {
    const openEl = this.querySelector('.q-app-accordion__item[data-open]')
    let idx = openEl?.dataset?.itemIndex ?? ''

    // 桌面端：全部收起时仍显示最近一次展开项对应的右侧素材（避免整块留白）
    if (idx === '' && this.lastMediaIndex != null && this.lastMediaIndex !== '') {
      idx = String(this.lastMediaIndex)
    }

    this.querySelectorAll('.q-app-accordion__media-panel').forEach((panel) => {
      const match = idx !== '' && panel.dataset.mediaIndex === idx
      panel.classList.toggle('q-app-accordion__media-panel--active', match)
      panel.setAttribute('aria-hidden', match ? 'false' : 'true')
    })
  }
}

if (!window.customElements.get('app-feature-accordion')) {
  window.customElements.define('app-feature-accordion', AppFeatureAccordion)
}
