<?php

namespace QwertyQuickView;

if (!defined('ABSPATH')) exit;

require_once __DIR__ . '/Buttons.php';
require_once __DIR__ . '/Assets.php';
require_once __DIR__ . '/Ajax.php';
require_once __DIR__ . '/MetaBoxes/ProductQuickViewMeta.php';

class Init
{

    public function __construct()
    {
        new Assets();
        new Buttons();
        new Ajax();
        new ProductQuickViewMeta();

        add_action('wp_footer', [$this, 'render_modal']);
    }

    public function render_modal()
    {
?>
        <div class="qqv-modal" id="qqv-modal" style="display:none;">
            <div class="qqv-modal__overlay"></div>
            <div class="qqv-modal__content">
                <div class="qqv-modal__content-top">
                    <a href="" class="qqv-modal__content-link">
                        View full page
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 12L17.5 12M17.5 12L11.5 18M17.5 12L11.5 6" stroke="#330072" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </a>
                    <button class="qqv-modal__close">
                        Close
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.85742 6.85742L17.2897 17.1431" stroke="#1C2230" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M17.29 6.85742L6.8578 17.1431" stroke="#1C2230" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
                <div class="qqv-modal__inner">
                    <div class="qqv-modal__gallery">

                    </div>
                    <div class="qqv-product__details">
                        <div class="qqv-product__top">
                            <div class="qqv-product__details-top">
                                <div class="qqv-product__sku"></div>
                                <div class="qqv-product__stock in-stock">
                                    In stock
                                </div>
                            </div>
                            <h2 class="qqv-product__title"></h2>
                            <div class="qqv-product__price"></div>
                            <div class="qqv-variations"></div>
                            <input type="hidden" class="qqv-variation-id" value="">
                            <div class="qqv-notice" style="display:none;"></div>
                            <div class="qqv-product__cart">
                                <div class="qqv-quantity">
                                    <button class="qqv-quantity__minus">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M3.8457 10L16.1534 10" stroke="#1C2230" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </button>
                                    <input type="number" class="qqv-quantity__input qqv-qty" value="1" min="1">
                                    <button class="qqv-quantity__plus">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M9.99955 16.1534L9.99955 9.99955M9.99955 9.99955L9.99955 3.8457M9.99955 9.99955L16.1534 9.99955M9.99955 9.99955L3.8457 9.99955" stroke="#1C2230" stroke-width="1.5" stroke-linecap="round" />
                                        </svg>
                                    </button>
                                </div>
    
                                <button class="qqv-add-to-cart" data-product-id="">
                                    Add to cart
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                            <path d="M3.03265 9.88016H13.0269C13.7975 9.88016 14.1828 9.88016 14.4896 9.73648C14.7598 9.60992 14.9868 9.40672 15.1424 9.15215C15.3191 8.86315 15.3616 8.4802 15.4467 7.71432L15.8918 3.70843C15.9178 3.4745 15.9308 3.35754 15.8932 3.267C15.8602 3.18749 15.8011 3.12154 15.7258 3.07992C15.6399 3.03254 15.5222 3.03254 15.2869 3.03254H2.65222M0.75 0.75H1.69987C1.90121 0.75 2.00188 0.75 2.08064 0.788289C2.14997 0.821997 2.20743 0.875976 2.2454 0.943074C2.28852 1.01929 2.2948 1.11976 2.30736 1.32071L2.99687 12.3528C3.00943 12.5538 3.01571 12.6543 3.05884 12.7305C3.0968 12.7976 3.15426 12.8515 3.2236 12.8853C3.30236 12.9235 3.40302 12.9235 3.60436 12.9235H13.6844M4.93466 15.5865H4.94226M11.7823 15.5865H11.7899M5.31508 15.5865C5.31508 15.7966 5.14476 15.9669 4.93466 15.9669C4.72455 15.9669 4.55423 15.7966 4.55423 15.5865C4.55423 15.3764 4.72455 15.2061 4.93466 15.2061C5.14476 15.2061 5.31508 15.3764 5.31508 15.5865ZM12.1627 15.5865C12.1627 15.7966 11.9924 15.9669 11.7823 15.9669C11.5722 15.9669 11.4019 15.7966 11.4019 15.5865C11.4019 15.3764 11.5722 15.2061 11.7823 15.2061C11.9924 15.2061 12.1627 15.3764 12.1627 15.5865Z" stroke="#330072" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div class="qqv-accordion">
                            <div class="qqv-accordion__item qqv-accordion__item--desc">
                                <button class="qqv-accordion__header">
                                    Description
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M3.16699 6.41389L7.29366 10.5406C7.48116 10.7278 7.73532 10.833 8.00033 10.833C8.26533 10.833 8.51949 10.7278 8.70699 10.5406L12.8337 6.41389" stroke="#999EAD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                                <div class="qqv-accordion__content">
                                    <div class="qqv-product__description"></div>
                                </div>
                            </div>
                            <div class="qqv-accordion__item qqv-accordion__item--char">
                                <button class="qqv-accordion__header">
                                    Characteristics
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M3.16699 6.41389L7.29366 10.5406C7.48116 10.7278 7.73532 10.833 8.00033 10.833C8.26533 10.833 8.51949 10.7278 8.70699 10.5406L12.8337 6.41389" stroke="#999EAD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                                <div class="qqv-accordion__content">
                                    <div class="qqv-product__char"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
<?php
    }
}
