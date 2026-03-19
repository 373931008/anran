/**
 * 产品页可展开项：点击标题行展开/收起内容，slide down/up 动画
 * 与 section-development 规范中的 slide down/up 标准实现一致
 */
export default class QAccordionItemElement extends HTMLElement {
  constructor() {
    super()
    this.handleTriggerClick = this.handleTriggerClick.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
  }

  connectedCallback() {
    this.trigger = this.querySelector('[data-accordion-trigger]')
    this.answerWrap = this.querySelector('.answer-wrap')
    if (this.trigger) {
      this.trigger.addEventListener('click', this.handleTriggerClick)
      this.trigger.addEventListener('keydown', this.handleKeydown)
    }
  }

  disconnectedCallback() {
    if (this.trigger) {
      this.trigger.removeEventListener('click', this.handleTriggerClick)
      this.trigger.removeEventListener('keydown', this.handleKeydown)
    }
  }

  handleTriggerClick() {
    this.toggle(true)
  }

  handleKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    this.toggle(true)
  }

  toggle(animate) {
    if (this.hasAttribute('data-open')) {
      this.close(animate)
    } else {
      this.open(animate)
    }
  }

  open(animate) {
    this.setAttribute('data-open', '')
    if (this.trigger) this.trigger.setAttribute('aria-expanded', 'true')
    if (!this.answerWrap) return
    if (animate) {
      this.answerWrap.style.transition = 'max-height 0.3s ease'
      this.answerWrap.style.maxHeight = this.answerWrap.scrollHeight + 'px'
      this.answerWrap.addEventListener(
        'transitionend',
        () => {
          this.answerWrap.style.maxHeight = '2000px'
          this.answerWrap.style.transition = ''
        },
        { once: true }
      )
    } else {
      this.answerWrap.style.transition = ''
      this.answerWrap.style.maxHeight = '2000px'
    }
  }

  close(animate) {
    this.removeAttribute('data-open')
    if (this.trigger) this.trigger.setAttribute('aria-expanded', 'false')
    if (!this.answerWrap) return
    if (animate) {
      this.answerWrap.style.transition = 'none'
      this.answerWrap.style.maxHeight = this.answerWrap.scrollHeight + 'px'
      this.answerWrap.offsetHeight
      this.answerWrap.style.transition = 'max-height 0.3s ease'
      this.answerWrap.style.maxHeight = '0'
    } else {
      this.answerWrap.style.transition = 'none'
      this.answerWrap.style.maxHeight = '0'
    }
  }
}

if (!window.customElements.get('q-accordion-item-element')) {
  window.customElements.define('q-accordion-item-element', QAccordionItemElement)
}
