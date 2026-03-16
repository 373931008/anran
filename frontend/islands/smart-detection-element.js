// frontend/islands/smart-detection.js
// 智能检测追踪板块：视口内自动播放视频，离开视口时暂停

export default class SmartDetectionElement extends HTMLElement {
  constructor() {
    super()
    console.log('SmartDetectionElement constructor #####')
    this.observer = null
    this.video = null
  }

  connectedCallback() {
    this.video = this.querySelector('[data-autoplay-on-visible]')
    if (!this.video) return
    this.#initObserver()
  }

  disconnectedCallback() {
    this.#cleanup()
  }

  #initObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.#playVideo()
          } else {
            this.#pauseVideo()
          }
        }
      },
      { threshold: 0.3 }
    )
    this.observer.observe(this.video)
  }

  #playVideo() {
    if (!this.video) return
    const playPromise = this.video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // 浏览器策略阻止自动播放时静默处理
      })
    }
  }

  #pauseVideo() { 
    if (!this.video || this.video.paused) return
    this.video.pause()
  }
 
  #cleanup() { 
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

if (!window.customElements.get('smart-detection-element')) {
  window.customElements.define('smart-detection-element', SmartDetectionElement)
}
