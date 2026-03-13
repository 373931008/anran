/**
 * Expert Testimonials 专家评价轮播组件
 *
 * @description
 * - 处理卡片内视频播放按钮：点击后在模态窗口中嵌入播放
 * - 导航切换由 Swiper 原生 navigation-prev-el / navigation-next-el 接管
 *
 * @author Siipet Theme
 * @version 1.0.0
 */
export default class ExpertTestimonialsElement extends HTMLElement {
  constructor() {
    super()
    this.handleClick = this.handleClick.bind(this)
    this.handleModalClose = this.handleModalClose.bind(this)
    this.modalEl = null
  }

  connectedCallback() {
    this.addEventListener('click', this.handleClick)
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick)
    this.#removeModal()
  }

  handleClick(event) {
    const playBtn = event.target.closest('.q-et__play-btn')

    if (playBtn) {
      const videoUrl = playBtn.dataset.videoUrl
      if (videoUrl) {
        this.#openVideoModal(videoUrl)
      }
    }
  }

  #openVideoModal(url) {
    this.#removeModal()

    const embedUrl = buildEmbedUrl(url)

    const overlay = document.createElement('div')
    overlay.className = 'q-et-modal-overlay'
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

    const iframe = document.createElement('iframe')
    iframe.src = embedUrl
    iframe.allow = 'autoplay; encrypted-media; fullscreen'
    iframe.allowFullscreen = true
    iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:8px'
    iframe.title = 'Expert testimonial video'

    const closeBtn = document.createElement('button')
    closeBtn.setAttribute('aria-label', 'Close video')
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

    document.addEventListener('keydown', this.handleModalClose)

    inner.appendChild(closeBtn)
    inner.appendChild(iframe)
    overlay.appendChild(inner)
    document.body.appendChild(overlay)
    document.body.style.overflow = 'hidden'
    this.modalEl = overlay

    closeBtn.focus()
  }

  handleModalClose(e) {
    if (e.type === 'keydown' && e.key !== 'Escape') return
    this.#removeModal()
  }

  #removeModal() {
    if (this.modalEl) {
      this.modalEl.remove()
      this.modalEl = null
      document.body.style.overflow = ''
      document.removeEventListener('keydown', this.handleModalClose)
    }
  }
}

const buildEmbedUrl = (url) => {
  try {
    const u = new URL(url)

    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      let videoId = u.searchParams.get('v')
      if (!videoId) {
        videoId = u.pathname.split('/').filter(Boolean).pop()
      }
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    }

    if (u.hostname.includes('vimeo.com')) {
      const videoId = u.pathname.split('/').filter(Boolean).pop()
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`
    }
  } catch {
    // 直接返回原始 URL（已是嵌入链接场景）
  }

  return url
}

if (!window.customElements.get('expert-testimonials-element')) {
  window.customElements.define('expert-testimonials-element', ExpertTestimonialsElement)
}
