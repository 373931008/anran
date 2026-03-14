/**
 * App Features 功能展示板块
 * - 卡片可配置为图片或视频（Shopify video）
 * - 桌面：进入视口时自动播放第一个视频，播完自动播放下一个；鼠标移入卡片时播放该卡片视频，播完继续下一个
 * - 移动：当前 slide 进入视口时自动播放该 slide 视频，滑动切换时播放当前 slide 视频，播完自动播放下一个
 */
export default class AppFeaturesElement extends HTMLElement {
  constructor() {
    super()
    this.videoList = []
    this.slides = []
    this.sectionObserver = null
    this.slideObserver = null
    this.hasPlayedFirstOnDesktop = false
    this.currentSlideIndex = -1
    this.desktopQuery = null

    this.handleSectionVisible = this.handleSectionVisible.bind(this)
    this.handleVideoEnded = this.handleVideoEnded.bind(this)
    this.handleCardMouseEnter = this.handleCardMouseEnter.bind(this)
    this.handleSlideVisible = this.handleSlideVisible.bind(this)
  }

  connectedCallback() {
    this.videoList = Array.from(this.querySelectorAll('.q-af__img-area video'))
    this.slides = Array.from(this.querySelectorAll('swiper-slide'))
    this.desktopQuery = window.matchMedia('(min-width: 750px)')

    if (this.videoList.length === 0) return

    this.#bindVideoEnded()
    this.#setupSectionObserver()
    this.#setupCardHover()
    this.#setupSlideObserver()
  }

  disconnectedCallback() {
    for (const video of this.videoList) {
      video.removeEventListener('ended', this.handleVideoEnded)
    }
    this.removeEventListener('mouseenter', this.handleCardMouseEnter, true)
    if (this.sectionObserver) {
      this.sectionObserver.disconnect()
      this.sectionObserver = null
    }
    if (this.slideObserver) {
      this.slideObserver.disconnect()
      this.slideObserver = null
    }
  }

  #bindVideoEnded() {
    for (const video of this.videoList) {
      video.addEventListener('ended', this.handleVideoEnded)
    }
  }

  handleVideoEnded(e) {
    const video = e.target
    const idx = this.videoList.indexOf(video)
    if (idx === -1) return
    const nextIdx = idx + 1
    if (nextIdx < this.videoList.length) {
      this.#playVideo(this.videoList[nextIdx])
    }
  }

  #setupSectionObserver() {
    this.sectionObserver = new IntersectionObserver(
      this.handleSectionVisible,
      { threshold: 0.2 }
    )
    this.sectionObserver.observe(this)
  }

  handleSectionVisible(entries) {
    const entry = entries[0]
    if (!entry?.isIntersecting || this.videoList.length === 0) return
    if (this.desktopQuery.matches && !this.hasPlayedFirstOnDesktop) {
      this.hasPlayedFirstOnDesktop = true
      this.#pauseAll()
      this.#playVideo(this.videoList[0])
    }
  }

  #setupCardHover() {
    this.addEventListener('mouseenter', this.handleCardMouseEnter, true)
  }

  handleCardMouseEnter(event) {
    if (!this.desktopQuery.matches) return
    const card = event.target.closest('.q-af__card')
    if (!card) return
    const video = card.querySelector('.q-af__img-area video')
    if (!video) return
    this.#pauseAll()
    this.#playVideo(video)
  }

  #setupSlideObserver() {
    this.slideObserver = new IntersectionObserver(
      this.handleSlideVisible,
      { threshold: 0.5 }
    )
    for (const slide of this.slides) {
      this.slideObserver.observe(slide)
    }
  }

  handleSlideVisible(entries) {
    if (this.desktopQuery.matches) return
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const slide = entry.target
      const index = this.slides.indexOf(slide)
      if (index === -1 || index === this.currentSlideIndex) continue
      this.currentSlideIndex = index
      const video = slide.querySelector('.q-af__img-area video')
      this.#pauseAll()
      if (video) this.#playVideo(video)
      break
    }
  }

  #pauseAll() {
    for (const video of this.videoList) {
      if (!video.paused) video.pause()
    }
  }

  #playVideo(video) {
    if (!video) return
    const p = video.play()
    if (p !== undefined) p.catch(() => {})
  }
}

if (!window.customElements.get('app-features-element')) {
  window.customElements.define('app-features-element', AppFeaturesElement)
}
