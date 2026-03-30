<?php
/**
 * Plugin Name: Qwerty QuickView
 * Description: AJAX Quick View for WooCommerce
 * Version:     1.0.0
 * Author:      QWERTY Soft
 * Author URI:  https://qwerty-soft.com/
 * Text Domain: qwerty-quickview
 * Requires Plugins: woocommerce, woo-variation-swatches
 */

if (!defined('ABSPATH')) exit;


define('QQV_PATH', plugin_dir_path(__FILE__));
define('QQV_URL', plugin_dir_url(__FILE__));

require_once plugin_dir_path(__FILE__) . 'includes/Init.php';

new QwertyQuickView\Init();