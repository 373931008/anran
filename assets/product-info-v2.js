if (!customElements.get('product-info')) {
  customElements.define(
    'product-info',
    class ProductInfo extends HTMLElement {
      quantityInput = undefined;
      quantityForm = undefined;
      onVariantChangeUnsubscriber = undefined;
      cartUpdateUnsubscriber = undefined;
      abortController = undefined;
      pendingRequestUrl = null;
      preProcessHtmlCallbacks = [];
      postProcessHtmlCallbacks = [];
      stickyBarIo = undefined;
      stickyBarUnavailable = false;
      stickyBarBuyInView = null;

      constructor() {
        super();

        this.quantityInput = this.querySelector('.quantity__input');
      }

      connectedCallback() {
        this.initializeProductSwapUtility();

        this.onVariantChangeUnsubscriber = subscribe(
          PUB_SUB_EVENTS.optionValueSelectionChange,
          this.handleOptionValueChange.bind(this)
        );

        this.initQuantityHandlers();
        this.initDirectCheckoutForms();
        this.initStickyBarReveal();
        this.dispatchEvent(new CustomEvent('product-info:loaded', { bubbles: true }));
      }

      addPreProcessCallback(callback) {
        this.preProcessHtmlCallbacks.push(callback);
      }

      initQuantityHandlers() {
        if (!this.quantityInput) return;

        this.quantityForm = this.querySelector('.product-form__quantity');
        if (!this.quantityForm) return;

        this.setQuantityBoundries();
        if (!this.dataset.originalSection) {
          this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, this.fetchQuantityRules.bind(this));
        }
      }

      initDirectCheckoutForms() {
        this.directCheckoutForms = [...this.querySelectorAll('form.product-info__direct-checkout-form')];
        if (this.directCheckoutForms.length === 0) return;

        this.directCheckoutSubmitHandler = this.onDirectCheckoutSubmit.bind(this);
        for (const form of this.directCheckoutForms) {
          form.addEventListener('submit', this.directCheckoutSubmitHandler);
        }
      }

      onDirectCheckoutSubmit(evt) {
        evt.preventDefault();
        const form = evt.target;
        if (!form.classList.contains('product-info__direct-checkout-form')) return;

        const quantityInput = this.querySelector('.quantity__input');
        const qtyField = form.querySelector('input[name="quantity"]');
        if (qtyField && quantityInput) {
          qtyField.value = quantityInput.value;
        }

        const checkoutButtons = [
          ...document.querySelectorAll(`button[type="submit"][form="${form.id}"]`),
        ];

        const setCheckoutLoading = (loading) => {
          for (const btn of checkoutButtons) {
            if (loading) {
              btn.setAttribute('aria-disabled', 'true');
              btn.classList.add('loading');
              btn.querySelector('.loading__spinner')?.classList.remove('hidden');
            } else {
              btn.removeAttribute('aria-disabled');
              btn.classList.remove('loading');
              btn.querySelector('.loading__spinner')?.classList.add('hidden');
            }
          }
        };

        setCheckoutLoading(true);

        const variantInput = form.querySelector('input[name="id"]');
        const variantId = variantInput?.value?.trim();
        let quantity = parseInt(qtyField?.value ?? '1', 10);
        if (!Number.isFinite(quantity) || quantity < 1) {
          quantity = 1;
        }

        if (!variantId) {
          setCheckoutLoading(false);
          return;
        }

        const origin = (window.shopUrl || window.location.origin || '').replace(/\/$/, '');
        const cartPath = window.routes?.cart_url || '/cart';
        const cartBase = `${origin}${cartPath.startsWith('/') ? cartPath : `/${cartPath}`}`.replace(/\/$/, '');
        window.location.href = `${cartBase}/${variantId}:${quantity}`;
      }

      disconnectedCallback() {
        this.onVariantChangeUnsubscriber();
        this.cartUpdateUnsubscriber?.();
        this.stickyBarIo?.disconnect();
        this.stickyBarIo = undefined;
        if (this.directCheckoutForms?.length && this.directCheckoutSubmitHandler) {
          for (const form of this.directCheckoutForms) {
            form.removeEventListener('submit', this.directCheckoutSubmitHandler);
          }
        }
      }

      initStickyBarReveal() {
        const stickyEl = this.querySelector(`#ProductStickyBar-${this.dataset.section}`);
        if (!stickyEl) return;

        if (stickyEl.dataset.stickyReveal !== 'buy-out-of-view') {
          stickyEl.classList.remove('hidden');
          return;
        }

        this.stickyBarUnavailable = false;
        this.stickyBarBuyInView = null;

        const anchor = this.querySelector('.buy-buttons-v2');
        if (!anchor) {
          this.stickyBarBuyInView = false;
          this.updateStickyBarVisibility();
          return;
        }

        this.stickyBarIo?.disconnect();
        this.stickyBarIo = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (!entry) return;
            this.stickyBarBuyInView = entry.isIntersecting;
            this.updateStickyBarVisibility();
          },
          { root: null, threshold: 0, rootMargin: '0px' }
        );
        this.stickyBarIo.observe(anchor);

        requestAnimationFrame(() => {
          const records = typeof this.stickyBarIo.takeRecords === 'function' ? this.stickyBarIo.takeRecords() : [];
          if (records.length > 0) {
            this.stickyBarBuyInView = records[0].isIntersecting;
          }
          this.updateStickyBarVisibility();
        });
      }

      updateStickyBarVisibility() {
        const el = this.querySelector(`#ProductStickyBar-${this.dataset.section}`);
        if (!el) return;

        if (el.dataset.stickyReveal !== 'buy-out-of-view') {
          el.classList.toggle('hidden', !!this.stickyBarUnavailable);
          return;
        }

        if (this.stickyBarUnavailable) {
          el.classList.add('hidden');
          return;
        }

        if (this.stickyBarBuyInView !== false) {
          el.classList.add('hidden');
          return;
        }

        el.classList.remove('hidden');
      }

      initializeProductSwapUtility() {
        this.preProcessHtmlCallbacks.push((html) =>
          html.querySelectorAll('.scroll-trigger').forEach((element) => element.classList.add('scroll-trigger--cancel'))
        );
        this.postProcessHtmlCallbacks.push((newNode) => {
          window?.Shopify?.PaymentButton?.init();
          window?.ProductModel?.loadShopifyXR();
        });
      }

      handleOptionValueChange({ data: { event, target, selectedOptionValues } }) {
        if (!this.contains(event.target)) return;

        this.resetProductFormState();

        const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url;
        this.pendingRequestUrl = productUrl;
        const shouldSwapProduct = this.dataset.url !== productUrl;
        const shouldFetchFullPage = this.dataset.updateUrl === 'true' && shouldSwapProduct;

        this.renderProductInfo({
          requestUrl: this.buildRequestUrlWithParams(productUrl, selectedOptionValues, shouldFetchFullPage),
          targetId: target.id,
          callback: shouldSwapProduct
            ? this.handleSwapProduct(productUrl, shouldFetchFullPage)
            : this.handleUpdateProductInfo(productUrl),
        });
      }

      resetProductFormState() {
        this.querySelectorAll('product-form').forEach((productForm) => {
          productForm.toggleSubmitButton(true);
          productForm.handleErrorMessage();
        });
      }

      handleSwapProduct(productUrl, updateFullPage) {
        return (html) => {
          this.productModal?.remove();

          const selector = updateFullPage ? "product-info[id^='MainProduct']" : 'product-info';
          const variant = this.getSelectedVariant(html.querySelector(selector));
          this.updateURL(productUrl, variant?.id);

          if (updateFullPage) {
            document.querySelector('head title').innerHTML = html.querySelector('head title').innerHTML;

            HTMLUpdateUtility.viewTransition(
              document.querySelector('main'),
              html.querySelector('main'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
          } else {
            HTMLUpdateUtility.viewTransition(
              this,
              html.querySelector('product-info'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
          }
        };
      }

      renderProductInfo({ requestUrl, targetId, callback }) {
        this.abortController?.abort();
        this.abortController = new AbortController();

        fetch(requestUrl, { signal: this.abortController.signal })
          .then((response) => response.text())
          .then((responseText) => {
            this.pendingRequestUrl = null;
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            callback(html);
          })
          .then(() => {
            // set focus to last clicked option value
            document.querySelector(`#${targetId}`)?.focus();
          })
          .catch((error) => {
            if (error.name === 'AbortError') {
              console.log('Fetch aborted by user');
            } else {
              console.error(error);
            }
          });
      }

      getSelectedVariant(productInfoNode) {
        const selectedVariant = productInfoNode.querySelector('variant-selects [data-selected-variant]')?.innerHTML;
        return !!selectedVariant ? JSON.parse(selectedVariant) : null;
      }

      buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
        const params = [];

        !shouldFetchFullPage && params.push(`section_id=${this.sectionId}`);

        if (optionValues.length) {
          params.push(`option_values=${optionValues.join(',')}`);
        }

        return `${url}?${params.join('&')}`;
      }

      updateOptionValues(html) {
        const variantSelects = html.querySelector('variant-selects');
        if (variantSelects) {
          HTMLUpdateUtility.viewTransition(this.variantSelectors, variantSelects, this.preProcessHtmlCallbacks);
        }
      }

      handleUpdateProductInfo(productUrl) {
        return (html) => {
          const variant = this.getSelectedVariant(html);

          this.pickupAvailability?.update(variant);
          this.updateOptionValues(html);
          this.updateURL(productUrl, variant?.id);
          this.updateVariantInputs(variant?.id);

          if (!variant) {
            this.setUnavailable();
            return;
          }

          this.updateMedia(html, variant?.featured_media?.id);

          const updateSourceFromDestination = (id, shouldHide = (source) => false) => {
            const source = html.getElementById(`${id}-${this.sectionId}`);
            const destination = this.querySelector(`#${id}-${this.dataset.section}`);
            if (source && destination) {
              destination.innerHTML = source.innerHTML;
              destination.classList.toggle('hidden', shouldHide(source));
            }
          };

          updateSourceFromDestination('price');
          updateSourceFromDestination('StickyBarPrice');
          updateSourceFromDestination('StickyBarImage');
          updateSourceFromDestination('BuyButtonsV2AtcLine');
          updateSourceFromDestination('BuyButtonsV2BuyLine');
          this.syncDirectCheckoutButtonsDisabled(html);
          updateSourceFromDestination('Sku', ({ classList }) => classList.contains('hidden'));
          updateSourceFromDestination('Inventory', ({ innerText }) => innerText === '');
          updateSourceFromDestination('Volume');
          updateSourceFromDestination('Price-Per-Item', ({ classList }) => classList.contains('hidden'));

          this.stickyBarUnavailable = false;
          this.updateStickyBarVisibility();
          requestAnimationFrame(() => {
            if (this.stickyBarIo && typeof this.stickyBarIo.takeRecords === 'function') {
              const records = this.stickyBarIo.takeRecords();
              if (records.length > 0) {
                this.stickyBarBuyInView = records[0].isIntersecting;
              }
            }
            this.updateStickyBarVisibility();
          });

          this.updateQuantityRules(this.sectionId, html);
          this.querySelector(`#Quantity-Rules-${this.dataset.section}`)?.classList.remove('hidden');
          this.querySelector(`#Volume-Note-${this.dataset.section}`)?.classList.remove('hidden');

          this.querySelectorAll('product-form').forEach((pf) => {
            const btn = pf.querySelector('button[type="submit"][name="add"]');
            if (!btn || !btn.id) return;
            const fetchedBtn = html.getElementById(btn.id);
            if (!fetchedBtn) return;
            const disabled = fetchedBtn.hasAttribute('disabled');
            pf.toggleSubmitButton(disabled, window.variantStrings.soldOut);
          });

          publish(PUB_SUB_EVENTS.variantChange, {
            data: {
              sectionId: this.sectionId,
              html,
              variant,
            },
          });
        };
      }

      updateVariantInputs(variantId) {
        this.querySelectorAll(
          `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}, form.product-info__direct-checkout-form`
        ).forEach((productForm) => {
          const input = productForm.querySelector('input[name="id"]');
          if (!input) return;
          input.value = variantId ?? '';
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      syncDirectCheckoutButtonsDisabled(html) {
        const v2Root = this.querySelector('.buy-buttons-v2');
        const v2Fetched = html.querySelector('.buy-buttons-v2');
        if (v2Root && v2Fetched) {
          const checkoutBtn = v2Root.querySelector('.buy-buttons-v2__checkout');
          const checkoutFetched = v2Fetched.querySelector('.buy-buttons-v2__checkout');
          if (checkoutBtn && checkoutFetched) {
            checkoutBtn.toggleAttribute('disabled', checkoutFetched.hasAttribute('disabled'));
          }
        }

        const stickyRoot = this.querySelector(`#ProductStickyBar-${this.dataset.section}`);
        const stickyFetched = html.querySelector(`#ProductStickyBar-${this.dataset.section}`);
        if (stickyRoot && stickyFetched) {
          const buttons = stickyRoot.querySelectorAll('.product-sticky-bar__checkout');
          const fetchedButtons = stickyFetched.querySelectorAll('.product-sticky-bar__checkout');
          buttons.forEach((btn, index) => {
            const fetchedBtn = fetchedButtons[index];
            if (fetchedBtn) btn.toggleAttribute('disabled', fetchedBtn.hasAttribute('disabled'));
          });
        }
      }

      updateURL(url, variantId) {
        this.querySelector('share-button')?.updateUrl(
          `${window.shopUrl}${url}${variantId ? `?variant=${variantId}` : ''}`
        );

        if (this.dataset.updateUrl === 'false') return;
        window.history.replaceState({}, '', `${url}${variantId ? `?variant=${variantId}` : ''}`);
      }

      setUnavailable() {
        this.querySelectorAll('product-form').forEach((pf) => {
          pf.toggleSubmitButton(true, window.variantStrings.unavailable);
        });

        this.stickyBarUnavailable = true;
        this.updateStickyBarVisibility();

        const selectors = ['price', 'Inventory', 'Sku', 'Price-Per-Item', 'Volume-Note', 'Volume', 'Quantity-Rules']
          .map((id) => `#${id}-${this.dataset.section}`)
          .join(', ');
        document.querySelectorAll(selectors).forEach(({ classList }) => classList.add('hidden'));
      }

      updateMedia(html, variantFeaturedMediaId) {
        if (!variantFeaturedMediaId) return;

        const mediaGallerySource = this.querySelector('media-gallery ul');
        const mediaGalleryDestination = html.querySelector(`media-gallery ul`);

        const refreshSourceData = () => {
          if (this.hasAttribute('data-zoom-on-hover')) enableZoomOnHover(2);
          const mediaGallerySourceItems = Array.from(mediaGallerySource.querySelectorAll('li[data-media-id]'));
          const sourceSet = new Set(mediaGallerySourceItems.map((item) => item.dataset.mediaId));
          const sourceMap = new Map(
            mediaGallerySourceItems.map((item, index) => [item.dataset.mediaId, { item, index }])
          );
          return [mediaGallerySourceItems, sourceSet, sourceMap];
        };

        if (mediaGallerySource && mediaGalleryDestination) {
          let [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();
          const mediaGalleryDestinationItems = Array.from(
            mediaGalleryDestination.querySelectorAll('li[data-media-id]')
          );
          const destinationSet = new Set(mediaGalleryDestinationItems.map(({ dataset }) => dataset.mediaId));
          let shouldRefresh = false;

          // add items from new data not present in DOM
          for (let i = mediaGalleryDestinationItems.length - 1; i >= 0; i--) {
            if (!sourceSet.has(mediaGalleryDestinationItems[i].dataset.mediaId)) {
              mediaGallerySource.prepend(mediaGalleryDestinationItems[i]);
              shouldRefresh = true;
            }
          }

          // remove items from DOM not present in new data
          for (let i = 0; i < mediaGallerySourceItems.length; i++) {
            if (!destinationSet.has(mediaGallerySourceItems[i].dataset.mediaId)) {
              mediaGallerySourceItems[i].remove();
              shouldRefresh = true;
            }
          }

          // refresh
          if (shouldRefresh) [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();

          // if media galleries don't match, sort to match new data order
          mediaGalleryDestinationItems.forEach((destinationItem, destinationIndex) => {
            const sourceData = sourceMap.get(destinationItem.dataset.mediaId);

            if (sourceData && sourceData.index !== destinationIndex) {
              mediaGallerySource.insertBefore(
                sourceData.item,
                mediaGallerySource.querySelector(`li:nth-of-type(${destinationIndex + 1})`)
              );

              // refresh source now that it has been modified
              [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();
            }
          });
        }

        // set featured media as active in the media gallery
        this.querySelector(`media-gallery`)?.setActiveMedia?.(
          `${this.dataset.section}-${variantFeaturedMediaId}`,
          true
        );

        // update media modal
        const modalContent = this.productModal?.querySelector(`.product-media-modal__content`);
        const newModalContent = html.querySelector(`product-modal .product-media-modal__content`);
        if (modalContent && newModalContent) modalContent.innerHTML = newModalContent.innerHTML;
      }

      setQuantityBoundries() {
        const data = {
          cartQuantity: this.quantityInput.dataset.cartQuantity ? parseInt(this.quantityInput.dataset.cartQuantity) : 0,
          min: this.quantityInput.dataset.min ? parseInt(this.quantityInput.dataset.min) : 1,
          max: this.quantityInput.dataset.max ? parseInt(this.quantityInput.dataset.max) : null,
          step: this.quantityInput.step ? parseInt(this.quantityInput.step) : 1,
        };

        let min = data.min;
        const max = data.max === null ? data.max : data.max - data.cartQuantity;
        if (max !== null) min = Math.min(min, max);
        if (data.cartQuantity >= data.min) min = Math.min(min, data.step);

        this.quantityInput.min = min;

        if (max) {
          this.quantityInput.max = max;
        } else {
          this.quantityInput.removeAttribute('max');
        }
        this.quantityInput.value = min;

        publish(PUB_SUB_EVENTS.quantityUpdate, undefined);
      }

      fetchQuantityRules() {
        const currentVariantId = this.productForm?.variantIdInput?.value;
        if (!currentVariantId) return;

        this.querySelector('.quantity__rules-cart .loading__spinner').classList.remove('hidden');
        return fetch(`${this.dataset.url}?variant=${currentVariantId}&section_id=${this.dataset.section}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            this.updateQuantityRules(this.dataset.section, html);
          })
          .catch((e) => console.error(e))
          .finally(() => this.querySelector('.quantity__rules-cart .loading__spinner').classList.add('hidden'));
      }

      updateQuantityRules(sectionId, html) {
        if (!this.quantityInput) return;
        this.setQuantityBoundries();

        const quantityFormUpdated = html.getElementById(`Quantity-Form-${sectionId}`);
        const selectors = ['.quantity__input', '.quantity__rules', '.quantity__label'];
        for (let selector of selectors) {
          const current = this.quantityForm.querySelector(selector);
          const updated = quantityFormUpdated.querySelector(selector);
          if (!current || !updated) continue;
          if (selector === '.quantity__input') {
            const attributes = ['data-cart-quantity', 'data-min', 'data-max', 'step'];
            for (let attribute of attributes) {
              const valueUpdated = updated.getAttribute(attribute);
              if (valueUpdated !== null) {
                current.setAttribute(attribute, valueUpdated);
              } else {
                current.removeAttribute(attribute);
              }
            }
          } else {
            current.innerHTML = updated.innerHTML;
            if (selector === '.quantity__label') {
              const updatedAriaLabelledBy = updated.getAttribute('aria-labelledby');
              if (updatedAriaLabelledBy) {
                current.setAttribute('aria-labelledby', updatedAriaLabelledBy);
                // Update the referenced visually hidden element
                const labelId = updatedAriaLabelledBy;
                const currentHiddenLabel = document.getElementById(labelId);
                const updatedHiddenLabel = html.getElementById(labelId);
                if (currentHiddenLabel && updatedHiddenLabel) {
                  currentHiddenLabel.textContent = updatedHiddenLabel.textContent;
                }
              }
            }
          }
        }
      }

      get productForm() {
        return this.querySelector(`product-form`);
      }

      get productModal() {
        return document.querySelector(`#ProductModal-${this.dataset.section}`);
      }

      get pickupAvailability() {
        return this.querySelector(`pickup-availability`);
      }

      get variantSelectors() {
        return this.querySelector('variant-selects');
      }

      get relatedProducts() {
        const relatedProductsSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'related-products'
        );
        return document.querySelector(`product-recommendations[data-section-id^="${relatedProductsSectionId}"]`);
      }

      get quickOrderList() {
        const quickOrderListSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'quick_order_list'
        );
        return document.querySelector(`quick-order-list[data-id^="${quickOrderListSectionId}"]`);
      }

      get sectionId() {
        return this.dataset.originalSection || this.dataset.section;
      }
    }
  );
}
