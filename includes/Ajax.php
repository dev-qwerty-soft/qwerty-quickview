<?php

namespace QwertyQuickView;

if (!defined('ABSPATH')) exit;

class Ajax
{

    public function __construct()
    {
        add_action('wp_ajax_qqv_get', [$this, 'get_product']);
        add_action('wp_ajax_nopriv_qqv_get', [$this, 'get_product']);
    }

    public function get_product()
    {
        $product_id = intval($_POST['product_id'] ?? 0);
        if (!$product_id) wp_send_json_error('No product ID');

        $product = wc_get_product($product_id);
        if (!$product) wp_send_json_error('Invalid product');

        // --- STOCK LOGIC ---
        $stock_class = 'in-stock';
        $stock_text  = 'In stock';

        if (!$product->is_in_stock()) {
            $stock_class = 'sold-out-stock';
            $stock_text  = 'Temporarily sold out';
        } else {
            $stock_qty = $product->get_stock_quantity();
            if ($product->managing_stock() && $stock_qty !== null && $stock_qty < 5) {
                $stock_class = 'last-stock';
                $stock_text  = 'Last items';
            }
        }

        // --- GALLERY LOGIC ---
        $image_ids = $product->get_gallery_image_ids();
        $main_image = $product->get_image_id();

        $gallery = [];

        if ($main_image) {
            $gallery[] = wp_get_attachment_image_url($main_image, 'large');
        }

        foreach ($image_ids as $img_id) {
            $gallery[] = wp_get_attachment_image_url($img_id, 'large');
        }

        // Variations
        $type = 'simple';
        $attributes = [];
        $variations = [];
        $swatches = [];
        $default_attributes = [];

        if ($product->is_type('variable')) {
            $type = 'variable';
            $attributes = $product->get_variation_attributes();
            $default_attributes = $product->get_default_attributes();
            $available_variations = $product->get_available_variations();
            foreach ($available_variations as $variation) {
                $variations[] = [
                    'variation_id' => $variation['variation_id'],
                    'attributes'   => $variation['attributes'],
                    'price_html'   => $variation['price_html'],
                    'is_in_stock'  => $variation['is_in_stock'],
                    'image'        => $variation['image']['src'] ?? '',
                ];
            }

            foreach ($attributes as $taxonomy => $options) {
                if (!taxonomy_exists($taxonomy)) continue;
                foreach ($options as $term_slug) {
                    $term = get_term_by('slug', $term_slug, $taxonomy);
                    if (!$term) continue;
                    $color = get_term_meta($term->term_id, 'product_attribute_color', true);
                    if (!$color) {
                        $color = get_term_meta($term->term_id, 'color', true);
                    }
                    if ($color) {
                        $swatches[$taxonomy][$term_slug] = $color;
                    }
                }
            }
        }

        wp_send_json_success([
            'type' => $type,

            'title' => $product->get_name(),
            'sku' => $product->get_sku(),
            'permalink' => $product->get_permalink(),
            'price' => $product->get_price_html(),

            'stock' => [
                'class' => $stock_class,
                'text'  => $stock_text
            ],

            'gallery' => $gallery,
            'description' => apply_filters('the_content', $product->get_description()),

            'additional_text' => get_post_meta($product->get_id(), '_qv_additional_text', true),
            'characteristics' => get_post_meta($product->get_id(), '_qv_characteristics', true),

            'type' => $type,
            'attributes' => $attributes,
            'variations' => $variations,
            'default_attributes' => $default_attributes,
            'swatches' => $swatches,
        ]);
    }
}
