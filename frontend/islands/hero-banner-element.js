// frontend/islands/hero-banner-element.js
// 使用 swiper.on() API 绑定事件，绕过 Web Component Shadow DOM 事件传播隐患
// fill 使用 transform: scaleX() — GPU Compositor 线程，无 Layout/Paint

export default class HeroBannerElement extends HTMLElement {
  constructor() {
    super()
    this.handleBulletClick = this.handleBulletClick.bind(this)
    this._swiper = null
    this._onSlideChange = null
  }

  connectedCallback() {
    this.init()
  }

  disconnectedCallback() {
    this.cleanup()
  }

  init() {
    this.swiperEl = this.querySelector('swiper-container')
    this.bullets = Array.from(this.querySelectorAll('.q-hero-banner__bullet'))

    if (!this.swiperEl) return

    this.addEventListener('click', this.handleBulletClick)

    // Swiper Web Component 初始化完成后才能拿到 swiper 实例
    if (this.swiperEl.swiper) {
      this._attachSwiper(this.swiperEl.swiper)
    } else {
      // swiperinit 是 Swiper Web Component 提供的 DOM 事件，在 swiper 实例挂载后触发
      this.swiperEl.addEventListener('swiperinit', (e) => {
        this._attachSwiper(e.target.swiper)
      }, { once: true })
    }
  }

  _attachSwiper(swiper) {
    if (!swiper) return
    this._swiper = swiper

    // 使用 Swiper 实例的 .on() API，不依赖 DOM 事件传播
    this._onSlideChange = () => {
      // realIndex：loop 模式下去掉克隆 slide 后的真实索引，与圆点数组严格对应
      this.updateBullets(swiper.realIndex ?? 0)
    }
    swiper.on('slideChange', this._onSlideChange)

    // 同步初始状态：如果 Swiper 已经不在 index=0（极少数场景），修正圆点
    const currentIndex = swiper.realIndex ?? 0
    if (currentIndex !== 0) {
      this.updateBullets(currentIndex)
    }
  }

  handleBulletClick(event) {
    const bullet = event.target.closest('.q-hero-banner__bullet')
    if (!bullet) return
    const index = parseInt(bullet.dataset.index, 10)
    if (this._swiper && !isNaN(index)) {
      this._swiper.slideToLoop(index)
    }
  }

  updateBullets(activeIndex) {
    this.bullets.forEach((bullet, i) => {
      const isActive = i === activeIndex
      bullet.classList.toggle('q-hero-banner__bullet--active', isActive)

      const fill = bullet.querySelector('.q-hero-banner__bullet-fill')
      if (!fill) return

      fill.classList.remove('q-hero-banner__bullet-fill--animating')

      if (isActive) {
        void fill.offsetWidth // 强制重绘，确保 scaleX 从 0 重新开始
        fill.classList.add('q-hero-banner__bullet-fill--animating')
      }
    })
  }

  cleanup() {
    if (this._swiper && this._onSlideChange) {
      this._swiper.off('slideChange', this._onSlideChange)
    }
    this.removeEventListener('click', this.handleBulletClick)
    this._swiper = null
    this._onSlideChange = null
  }
}

if (!customElements.get('hero-banner-element')) {
  customElements.define('hero-banner-element', HeroBannerElement)
}
