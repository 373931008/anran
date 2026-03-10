// frontend/islands/product-specs.js
// 产品参数板块 - Show more / Show less 折叠交互

export default class ProductSpecsElement extends HTMLElement {
  constructor() {
    super()
    this.expanded = false
    this.handleToggle = this.handleToggle.bind(this)
  }

  connectedCallback() {
    this.btn = this.querySelector('.q-specs__toggle-btn')
    this.footer = this.querySelector('.q-specs__footer')
    this.tags = Array.from(this.querySelectorAll('.q-specs__tag'))

    this.showMoreText = this.dataset.showMoreText || 'Show more'
    this.showLessText = this.dataset.showLessText || 'Show less'

    // 读取断点展示数量
    this.showMobile = parseInt(this.dataset.showMobile, 10) || 4
    this.showDesktop = parseInt(this.dataset.showDesktop, 10) || 8

    this.btn && this.btn.addEventListener('click', this.handleToggle)

    // 初始化：应用折叠状态
    this.applyCollapsed()
  }

  disconnectedCallback() {
    this.btn && this.btn.removeEventListener('click', this.handleToggle)
  }

  // 获取当前断点下的默认展示条数
  getShowCount() {
    return window.innerWidth >= 750 ? this.showDesktop : this.showMobile
  }

  // 应用折叠（收起多余条目）
  applyCollapsed() {
    const showCount = this.getShowCount()
    const total = this.tags.length

    if (total <= showCount) {
      // 条目总数不超过阈值，全部展示，隐藏按钮区
      this.tags.forEach(tag => tag.removeAttribute('data-hidden'))
      this.footer && this.footer.setAttribute('data-all-visible', '')
      return
    }

    // 超过阈值，隐藏多余条目
    this.tags.forEach((tag, i) => {
      if (i < showCount) {
        tag.removeAttribute('data-hidden')
      } else {
        tag.setAttribute('data-hidden', '')
      }
    })

    this.footer && this.footer.removeAttribute('data-all-visible')
    this.expanded = false
    this.btn && (this.btn.textContent = this.showMoreText)
  }

  // 展开全部
  expand() {
    this.tags.forEach(tag => tag.removeAttribute('data-hidden'))
    this.expanded = true
    this.btn && (this.btn.textContent = this.showLessText)
  }

  // 收起
  collapse() {
    this.applyCollapsed()
  }

  handleToggle() {
    if (this.expanded) {
      this.collapse()
    } else {
      this.expand()
    }
  }
}

if (!window.customElements.get('product-specs-element')) {
  window.customElements.define('product-specs-element', ProductSpecsElement)
}
