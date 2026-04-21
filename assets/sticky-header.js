/**
 * StickyHeader 类
 * 处理页面滚动时头部的吸顶 (Sticky) 行为。
 */
class StickyHeader extends HTMLElement {
  constructor() {
    super();
  }

  // 当元素被插入到 DOM 时调用
  connectedCallback() {
    this.header = document.querySelector('.section-header');
    // 判断是否设置为始终吸顶或滚动时缩小 Logo
    this.headerIsAlwaysSticky =
      this.getAttribute('data-sticky-type') === 'always' ||
      this.getAttribute('data-sticky-type') === 'reduce-logo-size';
    this.headerBounds = {};

    // 初始化时设置头部高度的 CSS 变量
    this.setHeaderHeight();

    // 监听屏幕宽度变化，重新计算头部高度
    window.matchMedia('(max-width: 990px)').addEventListener('change', this.setHeaderHeight.bind(this));

    if (this.headerIsAlwaysSticky) {
      this.header.classList.add('shopify-section-header-sticky');
    }

    this.currentScrollTop = 0;
    this.preventReveal = false;
    this.predictiveSearch = this.querySelector('predictive-search');

    this.onScrollHandler = this.onScroll.bind(this);
    this.hideHeaderOnScrollUp = () => (this.preventReveal = true);

    // 监听自定义事件，防止头部在某些情况下意外显示
    this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
    // 监听窗口滚动事件
    window.addEventListener('scroll', this.onScrollHandler, false);

    // 创建交叉观察器，用于获取头部的初始边界信息
    this.createObserver();
  }

  // 设置头部高度的 CSS 变量，供其他样式使用
  setHeaderHeight() {
    document.documentElement.style.setProperty('--header-height', `${this.header.offsetHeight}px`);
  }

  // 当元素从 DOM 中移除时调用，清理事件监听器
  disconnectedCallback() {
    this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
    window.removeEventListener('scroll', this.onScrollHandler);
  }

  // 创建 IntersectionObserver 以获取头部元素的位置信息
  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    });

    observer.observe(this.header);
  }

  // 滚动事件处理函数
  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 如果搜索框打开，则不处理滚动隐藏/显示逻辑
    if (this.predictiveSearch && this.predictiveSearch.isOpen) return;

    // 向下滚动且超过头部底部边界时
    if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      this.header.classList.add('scrolled-past-header');
      if (this.preventHide) return;
      requestAnimationFrame(this.hide.bind(this));
    } 
    // 向上滚动且仍在头部原始位置下方时
    else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      this.header.classList.add('scrolled-past-header');
      if (!this.preventReveal) {
        requestAnimationFrame(this.reveal.bind(this));
      } else {
        window.clearTimeout(this.isScrolling);

        this.isScrolling = setTimeout(() => {
          this.preventReveal = false;
        }, 66);

        requestAnimationFrame(this.hide.bind(this));
      }
    } 
    // 滚动回到顶部区域时
    else if (scrollTop <= this.headerBounds.top) {
      this.header.classList.remove('scrolled-past-header');
      requestAnimationFrame(this.reset.bind(this));
    }

    this.currentScrollTop = scrollTop;
  }

  // 隐藏头部
  hide() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.add('shopify-section-header-hidden', 'shopify-section-header-sticky');
    this.closeMenuDisclosure();
    this.closeSearchModal();
  }

  // 显示头部
  reveal() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.add('shopify-section-header-sticky', 'animate');
    this.header.classList.remove('shopify-section-header-hidden');
  }

  // 重置头部状态
  reset() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.remove('shopify-section-header-hidden', 'shopify-section-header-sticky', 'animate');
  }

  // 关闭打开的菜单
  closeMenuDisclosure() {
    this.disclosures = this.disclosures || this.header.querySelectorAll('header-menu');
    this.disclosures.forEach((disclosure) => disclosure.close());
  }

  // 关闭搜索模态框
  closeSearchModal() {
    this.searchModal = this.searchModal || this.header.querySelector('details-modal');
    this.searchModal.close(false);
  }
}

customElements.define('sticky-header', StickyHeader);
