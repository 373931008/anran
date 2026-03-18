// frontend/islands/logo-marquee-element.js
// 功能：Logo 跑马灯 —— 等待 swiper-container 初始化后，将 swiper-wrapper 的过渡缓动设为 linear
// 参考：swiper-container 内部 autoplay delay=0 实现无缝匀速滚动

export default class LogoMarqueeElement extends HTMLElement {
  connectedCallback() {
    this.#init()
  }

  #init() {
    const swiperEl = this.querySelector('swiper-container')
    if (!swiperEl) return

    // swiper-container 初始化是异步的，监听 swiperslidechange 或直接用 MutationObserver
    // 更可靠的方式：等待 swiper 属性出现后注入 linear
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

    if (wrapper) {
      wrapper.style.transitionTimingFunction = 'linear'
    }

    // 每次 swiper 开始新的 transition 时保持 linear
    swiperEl.addEventListener('swiperprogress', () => {
      const w = swiperEl.shadowRoot
        ? swiperEl.shadowRoot.querySelector('.swiper-wrapper')
        : swiperEl.querySelector('.swiper-wrapper')
      if (w) w.style.transitionTimingFunction = 'linear'
    })
  }
}

if (!window.customElements.get('logo-marquee-element')) {
  window.customElements.define('logo-marquee-element', LogoMarqueeElement)
}
