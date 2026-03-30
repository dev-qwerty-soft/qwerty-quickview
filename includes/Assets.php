<?php

namespace QwertyQuickView;

if (!defined('ABSPATH')) exit;

class Assets
{

    public function __construct()
    {
        add_action('wp_enqueue_scripts', [$this, 'enqueue']);
    }

    public function enqueue()
    {
        // CSS
        wp_enqueue_style(
            'qqv-style',
            plugin_dir_url(__DIR__) . 'dist/css/styles.css',
            [],
            '1.0.0'
        );

        wp_enqueue_style(
            'swiper',
            'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
            [],
            '11'
        );

        // JS
        wp_enqueue_script(
            'qqv-script',
            plugin_dir_url(__DIR__) . 'dist/js/popup.js',
            ['jquery'],
            '1.0.0',
            true
        );

        wp_enqueue_script(
            'swiper',
            'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
            [],
            '11',
            true
        );

        wp_localize_script('qqv-script', 'qqv_ajax', [
            'url'   => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('qqv_add_to_cart'),
        ]);
    }
}
