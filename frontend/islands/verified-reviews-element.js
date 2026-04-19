/**
 * Verified Reviews — 证言轮播（q-verified-reviews）
 *
 * Swiper watchOverflow → isLocked（整轨已放下、无需滑动）时隐藏箭头与分页点，
 * 避免仅剩一页仍出现禁用态控件。
 *
 * @version 1.0.0
 */
export default class VerifiedReviewsElement extends HTMLElement {
  constructor() {
    super()
    this._swiperInitHandler = undefined
    this._boundSync = this.#syncControlsVisibility.bind(this)
  }

  connectedCallback() {
    this.#setupSwiper()
  }

  disconnectedCallback() {
    const container = this.querySelector('swiper-container')
    if (container && this._swiperInitHandler) {
      container.removeEventListener('swiperinit', this._swiperInitHandler)
      this._swiperInitHandler = undefined
    }
    const sw = container?.swiper
    if (sw) {
      sw.off('resize', this._boundSync)
      sw.off('update', this._boundSync)
      sw.off('lock', this._boundSync)
      sw.off('unlock', this._boundSync)
      sw.off('breakpoint', this._boundSync)
    }
    window.removeEventListener('resize', this._boundSync)
  }

  #setupSwiper() {
    const container = this.querySelector('swiper-container')
    if (!container) return

    const controls = this.querySelector('.q-vr__controls')
    if (!controls) return

    const onReady = () => {
      const sw = container.swiper
      if (!sw) return
      sw.on('resize', this._boundSync)
      sw.on('update', this._boundSync)
      sw.on('lock', this._boundSync)
      sw.on('unlock', this._boundSync)
      sw.on('breakpoint', this._boundSync)
      window.addEventListener('resize', this._boundSync)

      requestAnimationFrame(() => {
        if (!this.isConnected || !container.swiper) return
        this.#syncControlsVisibility()
      })
    }

    if (container.swiper) {
      onReady()
    } else {
      const handler = () => {
        container.removeEventListener('swiperinit', handler)
        this._swiperInitHandler = undefined
        onReady()
      }
      this._swiperInitHandler = handler
      container.addEventListener('swiperinit', handler)
    }
  }

  #syncControlsVisibility() {
    const controls = this.querySelector('.q-vr__controls')
    if (!controls) return

    const container = this.querySelector('swiper-container')
    const sw = container?.swiper
    const hide = Boolean(sw?.isLocked)

    controls.toggleAttribute('hidden', hide)
    controls.setAttribute('aria-hidden', hide ? 'true' : 'false')
  }
}

if (!window.customElements.get('verified-reviews-element')) {
  window.customElements.define(
    'verified-reviews-element',
    VerifiedReviewsElement
  )
}
