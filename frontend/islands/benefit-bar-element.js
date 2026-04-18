// frontend/islands/benefit-bar-element.js
// 功能：权益条跑马灯 —— 等待 swiper-container 初始化后，将 swiper-wrapper 的过渡缓动设为 linear
// 与 logo-marquee-element.js 逻辑一致，仅元素名不同

export default class BenefitBarElement extends HTMLElement {
  constructor() {
    super()
    this.swiperEl = null
    this.boundOnProgress = null
  }

  connectedCallback() {
    this.#init()
  }

  disconnectedCallback() {
    this.#teardown()
  }

  #init() {
    const swiperEl = this.querySelector('swiper-container')
    if (!swiperEl) return

    this.swiperEl = swiperEl

    if (swiperEl.swiper) {
      this.#applyLinear(swiperEl)
    } else {
      swiperEl.addEventListener('swiperinit', () => this.#applyLinear(swiperEl), { once: true })
      // 降级：100ms 后强制执行（部分环境不触发 swiperinit）
      setTimeout(() => this.#applyLinear(swiperEl), 100)
    }
  }

  #applyLinear(swiperEl) {
    const wrapper = swiperEl.shadowRoot
      ? swiperEl.shadowRoot.querySelector('.swiper-wrapper')
      : swiperEl.querySelector('.swiper-wrapper')

    if (wrapper) wrapper.style.transitionTimingFunction = 'linear'

    // 每次 swiper 开始新的 transition 时保持 linear
    if (!this.boundOnProgress) {
      this.boundOnProgress = () => {
        const w = swiperEl.shadowRoot
          ? swiperEl.shadowRoot.querySelector('.swiper-wrapper')
          : swiperEl.querySelector('.swiper-wrapper')
        if (w) w.style.transitionTimingFunction = 'linear'
      }
      swiperEl.addEventListener('swiperprogress', this.boundOnProgress)
    }
  }

  #teardown() {
    if (this.swiperEl && this.boundOnProgress) {
      this.swiperEl.removeEventListener('swiperprogress', this.boundOnProgress)
    }
    this.swiperEl = null
    this.boundOnProgress = null
  }
}

if (!window.customElements.get('benefit-bar-element')) {
  window.customElements.define('benefit-bar-element', BenefitBarElement)
}
