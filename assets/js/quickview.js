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
        return name
            .replace('attribute_', '')
            .replace('pa_', '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    $(document).on('click', '.qqv-btn', function (e) {
        e.preventDefault();

        var $btn = $(this);
        var productId = $btn.data('product-id');

        if ($btn.hasClass('is-loading')) return;

        $btn.addClass('is-loading');

        if (!$btn.data('original-text')) {
            $btn.data('original-text', $btn.html());
        }

        $btn.html('<span class="qqv-loader"></span>');

        $.post(qqv_ajax.url, { action: 'qqv_get', product_id: productId })
            .done(function (response) {
                if (response.success) {
                    $('#qqv-modal .qqv-product__title').text(response.data.title);

                    if (response.data.sku) {
                        $('#qqv-modal .qqv-product__sku').text('SKU: ' + response.data.sku);
                    }

                    $('#qqv-modal .qqv-modal__content-link').attr('href', response.data.permalink);
                    $('#qqv-modal .qqv-product__price').html(response.data.price);

                    // Stock
                    $('#qqv-modal .qqv-product__stock')
                        .removeClass('in-stock last-stock sold-out-stock')
                        .addClass(response.data.stock.class)
                        .text(response.data.stock.text);

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
                        renderVariations(response.data.attributes, response.data.swatches);
                        $('.qqv-add-to-cart').prop('disabled', true);
                    } else {
                        $('.qqv-variations').html('');
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
                                prevEl: '.qqv-swiper__prev',
                            },
                        });

                    });
                }
            })
            .always(function () {
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
    observer.observe(document.body, { childList: true, subtree: true });


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
});