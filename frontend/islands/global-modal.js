/**
 * 全局弹窗管理器 Island 组件
 *
 * @description
 * 提供全局可复用的弹窗功能，支持响应式图片、动态内容更新和流畅的动画效果
 *
 * @features
 * - 动态创建弹窗 HTML 结构
 * - 事件委托监听所有触发器
 * - 响应式图片加载（移动端/桌面端）
 * - 多种关闭方式（按钮/遮罩/ESC键）
 * - 流畅的打开/关闭动画
 *
 * @usage
 * 1. 在任何元素上添加 data-modal-trigger 属性
 * 2. 添加数据属性：
 *    - data-modal-image: 桌面端图片 URL
 *    - data-modal-mobile-image: 移动端图片 URL
 *    - data-modal-title: 弹窗标题
 *    - data-modal-content: 弹窗内容
 * 3. 点击元素即可触发弹窗
 *
 * @example
 * <div
 *   data-modal-trigger
 *   data-modal-image="https://example.com/desktop.jpg"
 *   data-modal-mobile-image="https://example.com/mobile.jpg"
 *   data-modal-title="标题"
 *   data-modal-content="内容描述">
 *   点击打开弹窗
 * </div>
 *
 * @author Siipet Theme
 * @version 1.0.0
 */
export default class GlobalModal extends HTMLElement {
  constructor() {
    super()

    // 绑定方法上下文
    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleEscKey = this.handleEscKey.bind(this)
    this.handleOverlayClick = this.handleOverlayClick.bind(this)
  }

  /**
   * 组件挂载到 DOM 时调用
   */
  connectedCallback() {
    try {
      this.init()
    } catch (error) {
      console.error('GlobalModal initialization failed:', error)
    }
  }

  /**
   * 组件从 DOM 移除时调用
   */
  disconnectedCallback() {
    this.cleanup()
  }

  /**
   * 创建弹窗 HTML 结构
   * @private
   */
  createModalHTML() {
    const modalHTML = `
      <div id="global-modal" class="global-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="global-modal__overlay"></div>
        <div class="global-modal__container">
          <button class="global-modal__close" aria-label="关闭弹窗">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_453_3076)">
                <path d="M16.0004 30.8148C24.1824 30.8148 30.8152 24.182 30.8152 16C30.8152 7.818 24.1824 1.18518 16.0004 1.18518C7.81836 1.18518 1.18555 7.818 1.18555 16C1.18555 24.182 7.81836 30.8148 16.0004 30.8148Z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                <path d="M20.1901 11.8098L11.8096 20.1903" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M11.8096 11.8098L20.1901 20.1903" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_453_3076">
                  <rect width="32" height="32" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </button>
          <div class="global-modal__content">
            <!-- 弹窗图片 -->
            <div class="global-modal__image-wrapper">
              <picture>
                <source class="global-modal__image-mobile" media="(max-width: 1023px)" srcset="">
                <img class="global-modal__image" src="" alt="" loading="lazy">
              </picture>
            </div>
            <div class="global-modal__content-wrapper">
              <!-- 标题 -->
              <h3 id="modal-title" class="global-modal__title text-xl lg:tw-text-2xl tw-text-black"></h3>
              <!-- 描述 -->
              <div class="global-modal__description text-sm lg:tw-text-base tw-text-[#252525]"></div>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', modalHTML)
  }

  /**
   * 初始化组件
   * @private
   */
  init() {
    // 检查弹窗是否已存在
    this.modalElement = document.getElementById('global-modal')

    // 如果不存在，则创建
    if (!this.modalElement) {
      this.createModalHTML()
      this.modalElement = document.getElementById('global-modal')
    }

    if (!this.modalElement) {
      console.warn('GlobalModal: Failed to create modal element')
      return
    }

    // 缓存 DOM 引用
    this.closeButton = this.modalElement.querySelector('.global-modal__close')
    this.overlay = this.modalElement.querySelector('.global-modal__overlay')

    // 注册事件监听器
    document.addEventListener('click', this.handleClick)
    document.addEventListener('keydown', this.handleEscKey)

    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.handleClose)
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', this.handleOverlayClick)
    }
  }

  /**
   * 清理事件监听器和 DOM 元素
   * @private
   */
  cleanup() {
    document.removeEventListener('click', this.handleClick)
    document.removeEventListener('keydown', this.handleEscKey)

    if (this.closeButton) {
      this.closeButton.removeEventListener('click', this.handleClose)
    }

    if (this.overlay) {
      this.overlay.removeEventListener('click', this.handleOverlayClick)
    }

    if (this.modalElement) {
      this.modalElement.remove()
    }
  }

  /**
   * 处理触发器点击事件
   * @private
   */
  handleClick(event) {
    const trigger = event.target.closest('[data-modal-trigger]')

    if (!trigger) return

    event.preventDefault()
    event.stopPropagation()

    this.openModal(trigger)
  }

  /**
   * 处理关闭按钮点击
   * @private
   */
  handleClose(event) {
    event.preventDefault()
    event.stopPropagation()
    this.closeModal()
  }

  /**
   * 处理遮罩层点击
   * @private
   */
  handleOverlayClick(event) {
    event.preventDefault()
    event.stopPropagation()
    this.closeModal()
  }

  /**
   * 处理 ESC 键按下
   * @private
   */
  handleEscKey(event) {
    if (event.key === 'Escape' && this.modalElement?.hasAttribute('open')) {
      this.closeModal()
    }
  }

  /**
   * 打开弹窗
   * @param {HTMLElement} trigger - 触发器元素
   * @public
   */
  openModal(trigger) {
    const data = {
      image: trigger.dataset.modalImage || '',
      mobileImage: trigger.dataset.modalMobileImage || '',
      title: trigger.dataset.modalTitle || '',
      content: trigger.dataset.modalContent || ''
    }

    // 验证数据有效性
    if (!data.image && !data.title && !data.content) {
      console.warn('GlobalModal: No content data provided')
      return
    }

    this.updateModalContent(data)
    this.modalElement.setAttribute('open', '')
    document.body.style.overflow = 'hidden'
  }

  /**
   * 关闭弹窗
   * @public
   */
  closeModal() {
    if (!this.modalElement) return

    // 添加关闭动画
    this.modalElement.classList.add('closing')

    // 等待动画完成
    setTimeout(() => {
      this.modalElement.removeAttribute('open')
      this.modalElement.classList.remove('closing')
      document.body.style.overflow = ''
    }, 300)
  }

  /**
   * 更新弹窗内容
   * @param {Object} data - 弹窗数据
   * @param {string} data.image - 电脑端弹窗图片 URL
   * @param {string} data.mobileImage - 移动端弹窗图片 URL
   * @param {string} data.title - 标题
   * @param {string} data.content - 内容
   * @private
   */
  updateModalContent(data) {
    if (!this.modalElement) return

    // 更新响应式图片
    const img = this.modalElement.querySelector('.global-modal__image')
    const mobileSource = this.modalElement.querySelector('.global-modal__image-mobile')
    const imgWrapper = this.modalElement.querySelector(
      '.global-modal__image-wrapper'
    )

    if (img && imgWrapper) {
      // 判断是否有任何图片需要显示
      const hasImage = data.image || data.mobileImage
      
      if (hasImage) {
        // 设置电脑端图片（优先使用 data.image，如果没有则使用 mobileImage）
        img.src = data.image || data.mobileImage
        img.alt = data.title || '弹窗图片'
        
        // 设置移动端图片（如果提供了 mobileImage）
        if (mobileSource && data.mobileImage) {
          mobileSource.srcset = data.mobileImage
        } else if (mobileSource) {
          mobileSource.srcset = ''
        }
        
        imgWrapper.style.display = ''
      } else {
        imgWrapper.style.display = 'none'
      }
    }

    // 更新标题
    const title = this.modalElement.querySelector('.global-modal__title')
    if (title) {
      if (data.title) {
        title.innerHTML = data.title
        title.style.display = ''
      } else {
        title.style.display = 'none'
      }
    }

    // 更新内容描述
    const content = this.modalElement.querySelector(
      '.global-modal__description'
    )
    if (content) {
      if (data.content) {
        content.innerHTML = data.content
        content.style.display = ''
      } else {
        content.style.display = 'none'
      }
    }
  }
}

// 注册自定义元素
if (!window.customElements.get('global-modal')) {
  window.customElements.define('global-modal', GlobalModal)
}
