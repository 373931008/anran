/**
 * Professionals Saying — 专家说视频卡片横滑（q-professionals-saying）
 *
 * @description
 * - 外链视频：整块媒体区点击弹窗 iframe（YouTube/Vimeo）
 * - 本地视频：视口内当前 slide 自动播放 / 滑动切换 / 播放结束滑下一张；纯本地可无外链时点击区域 play()
 *
 * @version 1.2.0
 */
export default class ProfessionalsSayingElement extends HTMLElement {
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
    /** @type {number | undefined} */
    this._deferRafOuter = undefined
    /** @type {number | undefined} */
    this._deferRafInner = undefined
    /** @type {(() => void) | undefined} */
    this._swiperInitHandler = undefined
    this._boundSyncDesktopNav = this.#syncDesktopNavVisibility.bind(this)
  }

  connectedCallback() {
    this.swiperContainer = this.querySelector('swiper-container')
    this.addEventListener('click', this.handleClick)
    this.#deferInitialSetup()
  }

  disconnectedCallback() {
    if (this._deferRafOuter !== undefined) {
      cancelAnimationFrame(this._deferRafOuter)
      this._deferRafOuter = undefined
    }
    if (this._deferRafInner !== undefined) {
      cancelAnimationFrame(this._deferRafInner)
      this._deferRafInner = undefined
    }
    const pendingHost = this.swiperContainer
    if (pendingHost && this._swiperInitHandler) {
      pendingHost.removeEventListener('swiperinit', this._swiperInitHandler)
      this._swiperInitHandler = undefined
    }
    window.removeEventListener('resize', this._boundSyncDesktopNav)
    const swTeardown = this.swiperContainer?.swiper
    if (swTeardown && this._boundSyncDesktopNav) {
      swTeardown.off('resize', this._boundSyncDesktopNav)
      swTeardown.off('update', this._boundSyncDesktopNav)
      swTeardown.off('lock', this._boundSyncDesktopNav)
      swTeardown.off('unlock', this._boundSyncDesktopNav)
      swTeardown.off('breakpoint', this._boundSyncDesktopNav)
    }
    this.removeEventListener('click', this.handleClick)
    this.#removeModal()
    this.#teardownViewportObserver()
    this.#teardownSwiperAndVideos()
  }

  /**
   * Swiper Web Component 首帧会测量 slide；若同帧注册 IO + 批量操作 video，
   * 易与 Swiper 内部 update 连环强制布局。延后到下一帧再挂 observer / swiper 监听。
   */
  #deferInitialSetup() {
    if (this._deferRafOuter !== undefined)
      cancelAnimationFrame(this._deferRafOuter)
    if (this._deferRafInner !== undefined)
      cancelAnimationFrame(this._deferRafInner)

    this._deferRafOuter = requestAnimationFrame(() => {
      this._deferRafOuter = undefined
      this._deferRafInner = requestAnimationFrame(() => {
        this._deferRafInner = undefined
        if (!this.isConnected) return
        this.#setupViewportObserver()
        this.#setupSwiperAndVideos()
      })
    })
  }

  handleClick(event) {
    const wrapModal = event.target.closest('.q-et__media-wrap--has-video')
    if (wrapModal) {
      const url = wrapModal.dataset.etVideoUrl
      if (url) this.#openVideoModal({ url })
      return
    }

    const wrapInline = event.target.closest('.q-et__media-wrap')
    if (
      !wrapInline ||
      wrapInline.classList.contains('q-et__media-wrap--has-video')
    )
      return

    const inlineVideo = wrapInline.querySelector('video[data-et-inline-video]')
    if (!inlineVideo) return

    const playPromise = inlineVideo.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {})
    }
  }

  #openVideoModal({ url }) {
    this.#removeModal()

    const overlay = document.createElement('div')
    overlay.className = 'q-ps-modal-overlay'
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
    inner.style.cssText =
      'position:relative;width:100%;max-width:900px;aspect-ratio:16/9'

    const embedUrl = buildEmbedUrl(url || '')
    const iframe = document.createElement('iframe')
    iframe.src = embedUrl
    iframe.allow = 'autoplay; encrypted-media; fullscreen'
    iframe.allowFullscreen = true
    iframe.style.cssText =
      'width:100%;height:100%;border:none;border-radius:8px'
    iframe.title = 'Professional testimonial video'
    inner.appendChild(iframe)

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
    const inlineVideos = this.querySelectorAll('video[data-et-inline-video]')
    if (inlineVideos.length === 0) return

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        this.isInView = entry.isIntersecting
        requestAnimationFrame(() => {
          if (!this.isConnected) return
          if (this.isInView) {
            this.#playActiveSlideVideo()
          } else {
            this.#pauseAllInlineVideos()
          }
        })
      },
      { root: null, rootMargin: '0px', threshold: 0.25 }
    )
    requestAnimationFrame(() => {
      if (!this.isConnected || !this.intersectionObserver) return
      this.intersectionObserver.observe(this)
    })
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

    const inlineVideos = this.querySelectorAll('video[data-et-inline-video]')
    inlineVideos.forEach((video) => {
      video.addEventListener('ended', this.onVideoEnded)
    })

    const onReady = () => {
      const sw = container.swiper
      if (!sw) return
      sw.on('slideChangeTransitionEnd', this.onSlideChange)
      sw.on('resize', this._boundSyncDesktopNav)
      sw.on('update', this._boundSyncDesktopNav)
      sw.on('lock', this._boundSyncDesktopNav)
      sw.on('unlock', this._boundSyncDesktopNav)
      sw.on('breakpoint', this._boundSyncDesktopNav)
      window.addEventListener('resize', this._boundSyncDesktopNav)

      requestAnimationFrame(() => {
        if (!this.isConnected || !container.swiper) return
        this.#syncDesktopNavVisibility()
        if (this.isInView) this.#playActiveSlideVideo()
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

  #teardownSwiperAndVideos() {
    const container = this.swiperContainer
    if (container && this._swiperInitHandler) {
      container.removeEventListener('swiperinit', this._swiperInitHandler)
      this._swiperInitHandler = undefined
    }
    if (container && container.swiper) {
      container.swiper.off('slideChangeTransitionEnd', this.onSlideChange)
    }
    this.querySelectorAll('video[data-et-inline-video]').forEach((video) => {
      video.removeEventListener('ended', this.onVideoEnded)
    })
  }

  onSlideChange() {
    requestAnimationFrame(() => {
      if (!this.isConnected) return
      if (this.isInView) this.#playActiveSlideVideo()
      else this.#pauseAllInlineVideos()
    })
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
      ? activeSlide.querySelector('video[data-et-inline-video]')
      : null

    this.querySelectorAll('video[data-et-inline-video]').forEach((video) => {
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
    this.querySelectorAll('video[data-et-inline-video]').forEach((video) => {
      video.pause()
      video.currentTime = 0
    })
  }

  /** 桌面端：Swiper 判定无需滚动（isLocked）时隐藏箭头；移动端仅 CSS 隐藏 */
  #syncDesktopNavVisibility() {
    const nav = this.querySelector('.q-ps__nav')
    if (!nav) return

    const desktop = window.matchMedia('(min-width: 750px)').matches
    if (!desktop) {
      nav.removeAttribute('hidden')
      nav.removeAttribute('aria-hidden')
      return
    }

    const sw = this.swiperContainer?.swiper
    const hideNav = Boolean(sw?.isLocked)
    nav.toggleAttribute('hidden', hideNav)
    nav.setAttribute('aria-hidden', hideNav ? 'true' : 'false')
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
    // 已是嵌入或其它 URL
  }

  return url || ''
}

if (!window.customElements.get('professionals-saying-element')) {
  window.customElements.define(
    'professionals-saying-element',
    ProfessionalsSayingElement
  )
}
