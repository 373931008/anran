/**
 * Camera Showcase 摄像头功能展示组件
 *
 * @description
 * 实现 Tab 切换媒体内容（图片/视频）的交互逻辑
 * - 点击 Tab 切换对应媒体面板，有淡入淡出过渡
 * - 媒体类型为视频时，切换到该 Tab 自动播放当前可见端的视频
 * - 第一个 Tab 是视频时，进入视口后自动播放
 * - 所有视频均循环播放（video_tag 的 loop 属性已声明）
 * - 离开视口时暂停视频，重新进入时恢复播放
 *
 * @author Siipet Theme
 * @version 1.0.0
 */
export default class CameraShowcaseElement extends HTMLElement {
  constructor() {
    super()
    this.handleTabClick = this.handleTabClick.bind(this)
    this.handleVisibility = this.handleVisibility.bind(this)
    this.activeIndex = 0
    this.observer = null
  }

  connectedCallback() {
    this.tabBtns = Array.from(this.querySelectorAll('.q-cs__tab-btn'))
    this.panels = Array.from(this.querySelectorAll('.q-cs__media-item'))

    this.addEventListener('click', this.handleTabClick)
    this.#setupVisibilityObserver()
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleTabClick)

    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }

  handleTabClick(event) {
    const btn = event.target.closest('.q-cs__tab-btn')
    if (!btn) return

    const index = parseInt(btn.dataset.tabIndex, 10)
    if (index === this.activeIndex) return

    this.#switchTo(index)
  }

  #switchTo(index) {
    const prevPanel = this.panels[this.activeIndex]
    const nextPanel = this.panels[index]

    if (!nextPanel) return

    // 暂停上一个视频
    this.#pauseVideo(prevPanel)

    // 切换 Tab 按钮激活态
    for (const btn of this.tabBtns) {
      const isActive = parseInt(btn.dataset.tabIndex, 10) === index
      btn.classList.toggle('q-cs__tab-btn--active', isActive)
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false')
    }

    // 切换面板
    if (prevPanel) {
      prevPanel.classList.remove('q-cs__media-item--active')
    }
    nextPanel.classList.add('q-cs__media-item--active')

    this.activeIndex = index

    // 播放新面板的视频（如果是视频类型）
    if (nextPanel.dataset.mediaType === 'video') {
      this.#playVideo(nextPanel)
    }
  }

  #getActiveVideo(panel) {
    if (!panel || panel.dataset.mediaType !== 'video') return null

    const isMobile = window.innerWidth < 750
    const selector = isMobile
      ? '.q-cs__video-placeholder--mobile video'
      : '.q-cs__video-placeholder--desktop video'

    return panel.querySelector(selector)
  }

  #playVideo(panel) {
    const video = this.#getActiveVideo(panel)
    if (!video) return

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // 自动播放被阻止（通常不会，因为视频已静音）
      })
    }
  }

  #pauseVideo(panel) {
    if (!panel || panel.dataset.mediaType !== 'video') return

    const videos = panel.querySelectorAll('video')
    for (const video of videos) {
      video.pause()
    }
  }

  #setupVisibilityObserver() {
    this.observer = new IntersectionObserver(this.handleVisibility, {
      threshold: 0.3,
    })
    this.observer.observe(this)
  }

  handleVisibility(entries) {
    for (const entry of entries) {
      const activePanel = this.panels[this.activeIndex]
      if (!activePanel) continue

      if (entry.isIntersecting) {
        // 进入视口：如果当前激活的是视频，自动播放
        if (activePanel.dataset.mediaType === 'video') {
          this.#playVideo(activePanel)
        }
      } else {
        // 离开视口：暂停所有视频
        for (const panel of this.panels) {
          this.#pauseVideo(panel)
        }
      }
    }
  }
}

if (!window.customElements.get('camera-showcase-element')) {
  window.customElements.define('camera-showcase-element', CameraShowcaseElement)
}
