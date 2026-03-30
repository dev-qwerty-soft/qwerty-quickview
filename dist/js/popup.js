/******/ (function() { // webpackBootstrap
/*!****************************!*\
  !*** ./assets/js/popup.js ***!
  \****************************/
jQuery(function ($) {
  // Button Quick View
  function addQuickViewButtons() {
    $('.custom-product-card').each(function () {
      var $card = $(this);
      if ($card.find('.qqv-btn').length === 0) {
        var match = $card.attr('class').match(/post-(\d+)/);
        var productId = match ? match[1] : '';
        if (productId) {
          $card.append('<button class="qqv-btn" data-product-id="' + productId + '">Quick View</button>');
        }
      }
    });
  }
  addQuickViewButtons();

  // Render Variations
  function renderVariations(attributes, swatches = {}) {
    let html = '';
    Object.keys(attributes).forEach(attrName => {
      const options = normalizeOptions(attributes[attrName]);
      const isColor = swatches[attrName] !== undefined;
      html += `<div class="qqv-attribute" data-attribute="${attrName}">`;
      html += `<div class="qqv-attribute__title">
                    ${formatAttributeName(attrName)}
                 </div>`;
      html += `<div class="qqv-attribute__options ${isColor ? 'qqv-attribute__options--color' : ''}">`;
      options.forEach(option => {
        if (isColor && swatches[attrName][option]) {
          const color = swatches[attrName][option];
          html += `
                    <button 
                        type="button"
                        class="qqv-option qqv-option--color"
                        data-attribute="${attrName}"
                        data-value="${option}"
                        title="${option}">
                        <span style="background:${color}"></span>
                    </button>
                `;
        } else {
          html += `
                    <button 
                        type="button"
                        class="qqv-option"
                        data-attribute="${attrName}"
                        data-value="${option}">
                        ${option}
                    </button>
                `;
        }
      });
      html += `</div></div>`;
    });
    $('.qqv-variations').html(html);

    // Mark unavailable options on initial render (no selection yet)
    updateOptionStates();
  }
  function normalizeOptions(options) {
    if (Array.isArray(options)) {
      return options;
    }
    if (typeof options === 'string') {
      return options.split('|').map(o => o.trim());
    }
    if (typeof options === 'object' && options !== null) {
      return Object.values(options);
    }
    return [];
  }
  function formatAttributeName(name) {
    return name.replace('attribute_', '').replace('pa_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Normalize attribute key to always have "attribute_" prefix.
   */
  function normKey(key) {
    return key.startsWith('attribute_') ? key : 'attribute_' + key;
  }

  /**
   * Check if a given option value for a given attribute has at least one
   * available (in_stock) variation that matches the currently selected
   * attributes (excluding the attribute being tested).
   *
   * @param {string} attrName  - attribute key (with or without "attribute_" prefix)
   * @param {string} value     - option value to test
   * @param {Object} selected  - currently selected attributes (qqvSelectedAttributes)
   * @param {Array}  variations - all variations from qqvState
   * @returns {boolean}
   */
  function isOptionAvailable(attrName, value, selected, variations) {
    const testKey = normKey(attrName);
    return variations.some(v => {
      // Variation must be in stock
      if (!v.is_in_stock) return false;

      // The variation must match the tested value for the tested attribute.
      // An empty string in variation attributes means "any" (WooCommerce "Any ...")
      const varVal = v.attributes[testKey];
      if (varVal !== '' && varVal !== value) return false;

      // The variation must also be compatible with every other already-selected attribute
      for (const [selKey, selVal] of Object.entries(selected)) {
        const selNorm = normKey(selKey);

        // Skip the attribute we are currently testing
        if (selNorm === testKey) continue;
        const varSelVal = v.attributes[selNorm];
        // Empty string means "any" — always compatible
        if (varSelVal !== '' && varSelVal !== selVal) return false;
      }
      return true;
    });
  }

  /**
   * Walk through every rendered option button and add/remove
   * the "is-unavailable" class based on current selection.
   * Called after initial render and after every attribute click.
   */
  function updateOptionStates() {
    if (!window.qqvState || !window.qqvState.variations) return;
    const variations = window.qqvState.variations;
    const selected = qqvSelectedAttributes;
    $('.qqv-option').each(function () {
      const $opt = $(this);
      const attr = $opt.data('attribute');
      const value = $opt.data('value');
      const available = isOptionAvailable(attr, value, selected, variations);
      $opt.toggleClass('is-unavailable', !available);

      // If the option that was previously selected becomes unavailable,
      // deselect it and remove from selected map so state stays consistent.
      if (!available && $opt.hasClass('is-active')) {
        $opt.removeClass('is-active');
        const nk = normKey(attr);
        delete selected[nk];
        delete selected[attr];
      }
    });
  }
  let qqvSelectedAttributes = {};
  $(document).on('click', '.qqv-btn', function (e) {
    e.preventDefault();
    qqvSelectedAttributes = {};
    var $btn = $(this);
    var productId = $btn.data('product-id');
    if ($btn.hasClass('is-loading')) return;
    $btn.addClass('is-loading');
    if (!$btn.data('original-text')) {
      $btn.data('original-text', $btn.html());
    }
    $btn.html('<span class="qqv-loader"></span>');
    $.post(qqv_ajax.url, {
      action: 'qqv_get',
      product_id: productId
    }).done(function (response) {
      if (response.success) {
        $('#qqv-modal .qqv-product__title').text(response.data.title);
        if (response.data.sku) {
          $('#qqv-modal .qqv-product__sku').text('SKU: ' + response.data.sku);
        }
        $('#qqv-modal .qqv-modal__content-link').attr('href', response.data.permalink);
        $('#qqv-modal .qqv-product__price').html(response.data.price);
        $('#qqv-modal').attr('data-product-id', response.data.product_id);
        $('#qqv-modal').attr('data-product-type', response.data.type);
        window.qqvState = {
          productId: response.data.product_id,
          variations: response.data.variations
        };

        // Stock
        $('#qqv-modal .qqv-product__stock').removeClass('in-stock last-stock sold-out-stock').addClass(response.data.stock.class).text(response.data.stock.text);

        // Gallery
        var galleryHtml = `
                        <div class="qqv-swiper swiper">
                            <div class="swiper-wrapper">
                                ${response.data.gallery.map(img => `
                                    <div class="swiper-slide">
                                        <img src="${img}" alt="">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="qqv-swiper__arrow qqv-swiper__next">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M6 12L17.5 12M17.5 12L11.5 18M17.5 12L11.5 6" stroke="#1C2230" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="qqv-swiper__arrow qqv-swiper__prev">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M17.5 12L6 12M6 12L12 18M6 12L12 6" stroke="#1C2230" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    `;
        $('#qqv-modal .qqv-modal__gallery').html(galleryHtml);

        // Description
        if (response.data.description) {
          $('#qqv-modal .qqv-product__description').html(response.data.description);
          $('#qqv-modal .qqv-accordion__item--desc').show();
        } else {
          $('#qqv-modal .qqv-accordion__item--desc').hide();
        }

        // Additional Text
        if (response.data.additional_text) {
          $('#qqv-modal .qqv-product__additional').html(response.data.additional_text);
          $('#qqv-modal .qqv-product__additional').show();
        } else {
          $('#qqv-modal .qqv-product__additional').hide();
        }

        // Characteristics
        if (response.data.characteristics) {
          $('#qqv-modal .qqv-product__char').html(response.data.characteristics);
          $('#qqv-modal .qqv-accordion__item--char').show();
        } else {
          $('#qqv-modal .qqv-accordion__item--char').hide();
        }

        // VARIATIONS
        if (response.data.type === 'variable') {
          window.qqvVariations = response.data.variations;
          // renderVariations already calls updateOptionStates() at the end
          renderVariations(response.data.attributes, response.data.swatches);
          $('.qqv-add-to-cart').prop('disabled', true);
        } else {
          $('.qqv-variations').html('');
          $('.qqv-add-to-cart').prop('disabled', false);
        }
        console.log('Product Data:', response.data);

        // Show modal
        $('#qqv-modal').fadeIn(200, function () {
          if (window.qqvSwiper) {
            window.qqvSwiper.destroy(true, true);
          }
          window.qqvSwiper = new Swiper('.qqv-swiper', {
            slidesPerView: 1,
            loop: true,
            navigation: {
              nextEl: '.qqv-swiper__next',
              prevEl: '.qqv-swiper__prev'
            }
          });
        });
      }
    }).always(function () {
      $btn.removeClass('is-loading');
      $btn.html($btn.data('original-text'));
    });
  });
  $(document).on('click', '.qqv-modal__close, .qqv-modal__overlay', function () {
    $('#qqv-modal').fadeOut(200);
  });
  var observer = new MutationObserver(function () {
    addQuickViewButtons();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Accordion
  $(document).on('click', '.qqv-accordion__header', function () {
    var $item = $(this).closest('.qqv-accordion__item');
    var $content = $item.find('.qqv-accordion__content');
    $item.toggleClass('is-open');
    $content.stop().slideToggle(200);
  });

  // Quantity
  $(document).on('click', '.qqv-quantity__plus', function () {
    var $input = $(this).siblings('.qqv-quantity__input');
    $input.val(parseInt($input.val()) + 1).change();
  });
  $(document).on('click', '.qqv-quantity__minus', function () {
    var $input = $(this).siblings('.qqv-quantity__input');
    var val = parseInt($input.val());
    if (val > 1) {
      $input.val(val - 1).change();
    }
  });

  // Choose variation
  $(document).on('click', '.qqv-option', function () {
    // Prevent clicking unavailable options
    const $btn = $(this);
    if ($btn.hasClass('is-unavailable')) return;
    const attr = $btn.data('attribute');
    const value = $btn.data('value');
    qqvSelectedAttributes[attr] = value;
    $btn.closest('.qqv-attribute').find('.qqv-option').removeClass('is-active');
    $btn.addClass('is-active');
    $('#qqv-modal .qqv-notice').hide();

    // Re-evaluate availability for ALL options based on new selection
    updateOptionStates();
    const allAttrKeys = [...new Set(window.qqvState.variations.flatMap(v => Object.keys(v.attributes)))];
    const hasAll = allAttrKeys.every(nk => {
      const shortKey = nk.replace('attribute_', '');
      return qqvSelectedAttributes[nk] || qqvSelectedAttributes[shortKey];
    });
    $('.qqv-add-to-cart').prop('disabled', !hasAll);
    const match = findVariation(window.qqvState.variations, qqvSelectedAttributes);
    if (match && match.price_html) {
      $('#qqv-modal .qqv-product__price').html(match.price_html);
    }
  });

  // Find matching variation
  function findVariation(variations, selected) {
    return variations.find(v => {
      return Object.entries(selected).every(([key, value]) => {
        const nk = key.startsWith('attribute_') ? key : 'attribute_' + key;
        return v.attributes[nk] === value;
      });
    });
  }
  function normalizeVariation(selected) {
    const out = {};
    Object.entries(selected).forEach(([key, value]) => {
      const nk = key.startsWith('attribute_') ? key : 'attribute_' + key;
      out[nk] = value;
    });
    return out;
  }

  // Add to Cart
  $(document).on('click', '.qqv-add-to-cart', function (e) {
    e.preventDefault();
    e.stopPropagation();
    let productId = parseInt($('#qqv-modal').attr('data-product-id'));
    let productType = $('#qqv-modal').attr('data-product-type');
    let variations = window.qqvState.variations;
    const qty = parseInt($('.qqv-qty').val()) || 1;
    let data = {
      product_id: productId,
      quantity: qty
    };
    if (productType === 'variable') {
      const selected = qqvSelectedAttributes;
      const allAttrKeys = [...new Set(variations.flatMap(v => Object.keys(v.attributes)))];
      const hasAll = allAttrKeys.every(nk => {
        const shortKey = nk.replace('attribute_', '');
        return selected[nk] || selected[shortKey];
      });
      if (!hasAll) {
        $('#qqv-modal .qqv-notice').text('Please select all options').show();
        return;
      }
      const match = findVariation(variations, selected);
      if (!match) {
        $('#qqv-modal .qqv-notice').text('This combination is not available').show();
        return;
      }
      if (!match.is_in_stock) {
        $('#qqv-modal .qqv-notice').text('This variation is out of stock').show();
        return;
      }
      $('#qqv-modal .qqv-notice').hide();
      data.variation_id = match.variation_id;
      data.variation = normalizeVariation(selected);
    }
    addToCartAjax(data, $(this));
  });
  function addToCartAjax(data, $btn) {
    $btn.addClass('loading').prop('disabled', true);
    const flatData = {
      action: 'qqv_add_to_cart',
      nonce: qqv_ajax.nonce,
      product_id: data.product_id,
      quantity: data.quantity,
      variation_id: data.variation_id || 0
    };
    Object.entries(data.variation || {}).forEach(([key, val]) => {
      flatData[`variation[${key}]`] = val;
    });
    console.log('Cart data:', JSON.stringify(flatData));
    $.ajax({
      type: 'POST',
      url: qqv_ajax.url,
      data: flatData,
      success: function (response) {
        if (!response) return;
        if (response.error) {
          $('#qqv-modal .qqv-notice').text('Could not add to cart. Please try again.').show();
          return;
        }
        $(document.body).trigger('added_to_cart', [response.fragments, response.cart_hash, $btn]);
      },
      complete: function () {
        $('#qqv-modal').fadeOut(200);
        $btn.removeClass('loading').prop('disabled', false);
      }
    });
  }
});
/******/ })()
;
//# sourceMappingURL=popup.js.map