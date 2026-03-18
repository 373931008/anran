// frontend/islands/logo-marquee-element.js
// 功能：Logo 跑马灯 —— 等待 swiper-container 初始化后，将 swiper-wrapper 的过渡缓动设为 linear
// 备注：自动播放由 swiper-container 属性控制，此处不干预 autoplay，仅保证 linear

export default class LogoMarqueeElement extends HTMLElement {
  constructor() {
    super()
    this.swiperEl = null
    this.boundOnProgress = null
    this.boundOnInit = null
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

    // swiper-container 初始化是异步的，监听 swiperslidechange 或直接用 MutationObserver
    // 更可靠的方式：等待 swiper 属性出现后注入 linear
    if (swiperEl.swiper) {
      this.#applyLinear(swiperEl)
    } else {
      this.boundOnInit = () => this.#applyLinear(swiperEl)
      swiperEl.addEventListener('swiperinit', this.boundOnInit, { once: true })
      // 降级：100ms 后强制执行（部分环境不触发 swiperinit）
      setTimeout(() => this.#applyLinear(swiperEl), 100)
    }
  }

  #applyLinear(swiperEl) {
    const wrapper = swiperEl.shadowRoot
      ? swiperEl.shadowRoot.querySelector('.swiper-wrapper')
      : swiperEl.querySelector('.swiper-wrapper')

    if (wrapper) {
      wrapper.style.transitionTimingFunction = 'linear'
    }

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
    const swiperEl = this.swiperEl
    const swiper = swiperEl?.swiper

    if (swiperEl && this.boundOnProgress) swiperEl.removeEventListener('swiperprogress', this.boundOnProgress)

    this.swiperEl = null
  }
}

if (!window.customElements.get('logo-marquee-element')) {
  window.customElements.define('logo-marquee-element', LogoMarqueeElement)
}
