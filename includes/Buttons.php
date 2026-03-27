<?php

namespace QwertyQuickView;

if (!defined('ABSPATH')) exit;

class Buttons
{

    public function __construct()
    {
        add_action('woocommerce_after_shop_loop_item', [$this, 'add_quickview_button'], 20);
    }

    public function add_quickview_button()
    {
        global $product;

        echo '<button class="qqv-btn" data-product-id="' . esc_attr($product->get_id()) . '">';
        echo 'Quick View';
        echo '</button>';
    }
}
