export default class ReviewsQuoteElement extends HTMLElement {
  constructor() {
    super()
    this.handleIntersect = this.handleIntersect.bind(this)
    this.handleInit = this.handleInit.bind(this)
    this.observer = null
    this.swiperEl = null
    this.hasAutoplay = false
    this.isVisible = false
  }

  connectedCallback() {
    this.hasAutoplay = this.dataset.autoplayEnabled === 'true'
    this.swiperEl = this.querySelector('swiper-container')
    if (!this.swiperEl || !this.hasAutoplay) return

    this.observer = new IntersectionObserver(this.handleIntersect, { threshold: 0.25 })
    this.observer.observe(this)

    if (this.swiperEl.swiper) {
      this.handleInit()
    } else {
      this.swiperEl.addEventListener('swiperinit', this.handleInit, { once: true })
    }
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    if (this.swiperEl) {
      this.swiperEl.removeEventListener('swiperinit', this.handleInit)
    }
    this.swiperEl = null
  }

  handleInit() {
    const swiper = this.swiperEl?.swiper
    if (!swiper?.autoplay) return

    try {
      swiper.autoplay.stop()
    } catch {
      // ignore
    }

    if (this.isVisible) this.#start()
  }

  handleIntersect(entries) {
    const entry = entries[0]
    if (!entry) return
    this.isVisible = entry.isIntersecting
    if (this.isVisible) this.#start()
    else this.#stop()
  }

  #start() {
    const swiper = this.swiperEl?.swiper
    if (!swiper?.autoplay) return

    try {
      swiper.params.autoplay.disableOnInteraction = false
      if (!swiper.autoplay.running) {
        swiper.autoplay.start()
      }
    } catch {
      // ignore
    }
  }

  #stop() {
    const swiper = this.swiperEl?.swiper
    if (!swiper?.autoplay) return

    try {
      if (swiper.autoplay.running) {
        swiper.autoplay.stop()
      }
    } catch {
      // ignore
    }
  }
}

if (!window.customElements.get('reviews-quote-element')) {
  window.customElements.define('reviews-quote-element', ReviewsQuoteElement)
}

