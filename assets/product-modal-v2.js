if (!customElements.get('product-modal')) {
  customElements.define(
    'product-modal',
    class ProductModal extends ModalDialog {
      constructor() {
        super();

        // 防止浏览器对弹窗内元素触发原生拖拽（mac 上会出现“禁止/叉号”光标）。
        // 需要兼容 Swiper Element 的 Shadow DOM，因此用 composedPath + capture。
        this.addEventListener(
          'dragstart',
          (event) => {
            const path = event.composedPath?.() || [];
            const inThisModal = path.includes(this);
            if (!inThisModal) return;

            const inV2Content = path.some(
              (node) => node?.classList?.contains?.('product-media-modal__content--v2') === true
            );
            if (!inV2Content) return;

            event.preventDefault();
          },
          true
        );
      }

      hide() {
        super.hide();
      }

      show(opener) {
        super.show(opener);
        this.showActiveMedia();
      }

      showActiveMedia() {
        const openedByMediaId = this.openedBy?.getAttribute?.('data-media-id');
        if (!openedByMediaId) return;

        const sectionId = this.dataset.section;
        const mainSwiperEl = this.querySelector(`#ProductModalMain-${sectionId}`);
        if (!mainSwiperEl) return;

        const trySlideTo = (attempt = 0) => {
          const swiper = mainSwiperEl.swiper;
          if (!swiper) {
            if (attempt < 10) setTimeout(() => trySlideTo(attempt + 1), 50);
            return;
          }

          const slides = Array.from(mainSwiperEl.querySelectorAll('swiper-slide[data-media-id]'));
          const index = slides.findIndex((slide) => slide.getAttribute('data-media-id') === openedByMediaId);
          if (index < 0) return;

          swiper.slideTo(index, 0);
        };

        trySlideTo(0);
      }
    }
  );
}

