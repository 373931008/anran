if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.primarySubmitButton = this.form.querySelector('button[type="submit"][name="add"]');
        this.submitButton = this.primarySubmitButton;
        this.submitButtonText = this.primarySubmitButton?.querySelector('span');

        if (document.querySelector('cart-drawer')) this.primarySubmitButton?.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      getAddToCartSubmitButtons() {
        const formId = this.form.id;
        const inside = [...this.form.querySelectorAll('button[type="submit"][name="add"]')];
        const external = [...document.querySelectorAll(`button[type="submit"][name="add"][form="${formId}"]`)];
        const seen = new Set();
        const list = [];
        for (const btn of [...inside, ...external]) {
          if (!seen.has(btn)) {
            seen.add(btn);
            list.push(btn);
          }
        }
        return list;
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        const addButtons = this.getAddToCartSubmitButtons();
        const activeButton =
          evt.submitter &&
          evt.submitter.getAttribute('name') === 'add' &&
          (evt.submitter.form === this.form || evt.submitter.getAttribute('form') === this.form.id)
            ? evt.submitter
            : this.primarySubmitButton;

        if (!activeButton || activeButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        for (const btn of addButtons) {
          btn.setAttribute('aria-disabled', 'true');
        }
        activeButton.classList.add('loading');
        activeButton.querySelector('.loading__spinner')?.classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage = this.primarySubmitButton?.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              for (const btn of addButtons) {
                btn.setAttribute('aria-disabled', 'true');
              }
              this.submitButtonText?.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              }).then(() => {
                CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    CartPerformance.measure("add:paint-updated-sections", () => {
                      this.cart.renderContents(response);
                    });
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              CartPerformance.measure("add:paint-updated-sections", () => {
                this.cart.renderContents(response);
              });
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            for (const btn of addButtons) {
              btn.classList.remove('loading');
              btn.querySelector('.loading__spinner')?.classList.add('hidden');
            }
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) {
              for (const btn of addButtons) {
                btn.removeAttribute('aria-disabled');
              }
            }

            CartPerformance.measureFromEvent("add:user-action", evt);
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        const buttons = this.getAddToCartSubmitButtons();
        for (const btn of buttons) {
          if (disable) {
            btn.setAttribute('disabled', 'disabled');
          } else {
            btn.removeAttribute('disabled');
          }

          const stickyLabel = btn.querySelector('.product-sticky-bar__atc-text');
          const textSpan = stickyLabel || btn.querySelector('span');

          if (textSpan) {
            if (disable && text) {
              textSpan.textContent = text;
            } else if (!disable) {
              // buy-buttons-v2：文案由服务端片段同步（含价格），勿覆盖为通用「加入购物车」
              if (!btn.classList.contains('buy-buttons-v2__btn--atc')) {
                textSpan.textContent = window.variantStrings.addToCart;
              }
            }
          }
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}
