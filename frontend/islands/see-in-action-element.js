/**
 * See in Action 视频卡片轮播
 *
 * - 整块视频区域可点击，弹窗播放完整视频（支持本地视频与 YouTube/Vimeo/备用 URL）
 * - 进入视口时自动播放当前页本地视频，播完自动下一张并播放下一个视频
 * - 滑动后播放当前张视频，播完继续下一张
 * - 可配置自动轮播（定时切换）
 *
 * @author Siipet Theme
 */
export default class SeeInActionElement extends HTMLElement {
  constructor() {
    super()
    this.handleClick = this.handleClick.bind(this)
    this.handleModalClose = this.handleModalClose.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
    this.onSlideChange = this.onSlideChange.bind(this)
    this.onVideoEnded = this.onVideoEnded.bind(this)
    this.modalEl = null
    this.swiperContainer = null
    this.intersectionObserver = null
    this.isInView = false
    this.autoplayTimerId = null
  }

  connectedCallback() {
    this.swiperContainer = this.querySelector('swiper-container')
    this.addEventListener('click', this.handleClick)
    this.#setupViewportObserver()
    this.#setupSwiperAndVideos()
    this.#maybeStartAutoplayTimer()
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick)
    this.#removeModal()
    this.#teardownViewportObserver()
    this.#teardownSwiperAndVideos()
    this.#stopAutoplayTimer()
  }

  handleClick(event) {
    const card = event.target.closest('.product__sia-card--has-video')
    if (!card) return

    const type = card.dataset.siaVideoType || ''
    const url = (card.dataset.siaVideoUrl || '').trim()
    if (type && url) this.#openVideoModal({ type, url })
  }

  #openVideoModal({ type, url }) {
    this.#removeModal()

    const overlay = document.createElement('div')
    overlay.className = 'product__sia-modal-overlay'
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:9999',
      'background:rgba(0,0,0,0.85)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:16px'
    ].join(';')

    const inner = document.createElement('div')
    inner.style.cssText = 'position:relative;width:100%;max-width:900px;aspect-ratio:16/9'

    if (type === 'external') {
      const embedUrl = buildEmbedUrl(url)
      const iframe = document.createElement('iframe')
      iframe.src = embedUrl
      iframe.allow = 'autoplay; encrypted-media; fullscreen'
      iframe.allowFullscreen = true
      iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:8px'
      iframe.title = 'Video'
      inner.appendChild(iframe)
    } else {
      const video = document.createElement('video')
      video.src = url
      video.controls = true
      video.autoplay = true
      video.style.cssText = 'width:100%;height:100%;border:none;border-radius:8px;object-fit:contain'
      inner.appendChild(video)
    }

    const closeBtn = document.createElement('button')
    closeBtn.setAttribute('aria-label', 'Close video')
    closeBtn.type = 'button'
    closeBtn.style.cssText = [
      'position:absolute',
      'top:-40px',
      'right:0',
      'width:36px',
      'height:36px',
      'border-radius:50%',
      'border:none',
      'background:rgba(255,255,255,0.15)',
      'color:#fff',
      'font-size:20px',
      'cursor:pointer',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'line-height:1'
    ].join(';')
    closeBtn.innerHTML = '&times;'
    closeBtn.addEventListener('click', this.handleModalClose)

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.#removeModal()
    })

    document.addEventListener('keydown', this.handleKeydown)

    inner.appendChild(closeBtn)
    overlay.appendChild(inner)
    document.body.appendChild(overlay)
    document.body.style.overflow = 'hidden'
    this.modalEl = overlay
    closeBtn.focus()
  }

  handleModalClose(e) {
    if (e && e.type === 'keydown' && e.key !== 'Escape') return
    this.#removeModal()
  }

  handleKeydown(e) {
    if (e.key === 'Escape') this.#removeModal()
  }

  #removeModal() {
    if (this.modalEl) {
      this.modalEl.remove()
      this.modalEl = null
      document.body.style.overflow = ''
      document.removeEventListener('keydown', this.handleKeydown)
    }
  }

  #setupViewportObserver() {
    const inlineVideos = this.querySelectorAll('video[data-sia-inline-video]')
    if (inlineVideos.length === 0) return

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        this.isInView = entry.isIntersecting
        if (this.isInView) {
          this.#playActiveSlideVideo()
        } else {
          this.#pauseAllInlineVideos()
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.25 }
    )
    this.intersectionObserver.observe(this)
  }

  #teardownViewportObserver() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = null
    }
  }

  #setupSwiperAndVideos() {
    const container = this.swiperContainer
    if (!container) return

    this.querySelectorAll('video[data-sia-inline-video]').forEach((video) => {
      video.addEventListener('ended', this.onVideoEnded)
    })

    if (container.swiper) {
      container.swiper.on('slideChangeTransitionEnd', this.onSlideChange)
      if (this.isInView) this.#playActiveSlideVideo()
    } else {
      container.addEventListener(
        'swiperinit',
        () => {
          container.swiper.on('slideChangeTransitionEnd', this.onSlideChange)
          if (this.isInView) this.#playActiveSlideVideo()
        },
        { once: true }
      )
    }
  }

  #teardownSwiperAndVideos() {
    const container = this.swiperContainer
    if (container && container.swiper) {
      container.swiper.off('slideChangeTransitionEnd', this.onSlideChange)
    }
    this.querySelectorAll('video[data-sia-inline-video]').forEach((video) => {
      video.removeEventListener('ended', this.onVideoEnded)
    })
  }

  onSlideChange() {
    if (this.isInView) this.#playActiveSlideVideo()
    else this.#pauseAllInlineVideos()
  }

  onVideoEnded(e) {
    const video = e.target
    const slide = video.closest('swiper-slide')
    const container = this.swiperContainer
    if (!slide || !container || !container.swiper) return

    const swiper = container.swiper
    const activeSlide = swiper.slides[swiper.activeIndex]
    if (slide !== activeSlide) return

    swiper.slideNext()
  }

  #playActiveSlideVideo() {
    const container = this.swiperContainer
    if (!container || !container.swiper) return

    const swiper = container.swiper
    const activeSlide = swiper.slides[swiper.activeIndex]
    const activeVideo = activeSlide
      ? activeSlide.querySelector('video[data-sia-inline-video]')
      : null

    this.querySelectorAll('video[data-sia-inline-video]').forEach((video) => {
      if (video === activeVideo) {
        video.currentTime = 0
        const playPromise = video.play()
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {})
        }
      } else {
        video.pause()
        video.currentTime = 0
      }
    })
  }

  #pauseAllInlineVideos() {
    this.querySelectorAll('video[data-sia-inline-video]').forEach((video) => {
      video.pause()
      video.currentTime = 0
    })
  }

  #maybeStartAutoplayTimer() {
    const enabled = this.dataset.autoplayTimer === 'true'
    const delay = parseInt(this.dataset.autoplayDelay, 10) || 5000
    if (!enabled || delay <= 0) return

    this.#stopAutoplayTimer()
    this.autoplayTimerId = setInterval(() => {
      const container = this.swiperContainer
      if (!container || !container.swiper) return
      container.swiper.slideNext()
    }, delay)
  }

  #stopAutoplayTimer() {
    if (this.autoplayTimerId) {
      clearInterval(this.autoplayTimerId)
      this.autoplayTimerId = null
    }
  }
}

function buildEmbedUrl(url) {
  try {
    const u = new URL(url)

    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      let videoId = u.searchParams.get('v')
      if (!videoId) {
        const segments = u.pathname.split('/').filter(Boolean)
        if (segments[0] === 'shorts' && segments[1]) {
          videoId = segments[1]
        } else {
          videoId = segments.pop()
        }
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
      }
    }

    if (u.hostname.includes('vimeo.com')) {
      const videoId = u.pathname.split('/').filter(Boolean).pop()
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}?autoplay=1`
      }
    }
  } catch {
    // ignore
  }

  return url || ''
}

if (!window.customElements.get('see-in-action-element')) {
  window.customElements.define('see-in-action-element', SeeInActionElement)
}
