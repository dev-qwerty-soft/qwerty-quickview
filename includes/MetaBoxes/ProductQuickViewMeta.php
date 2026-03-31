<?php

namespace QwertyQuickView;

if (!defined('ABSPATH')) exit;

class ProductQuickViewMeta
{
    public function __construct()
    {
        add_action('add_meta_boxes', [$this, 'add_meta_box']);
        add_action('save_post_product', [$this, 'save_meta']);
    }

    public function add_meta_box()
    {
        add_meta_box(
            'qv_product_data',
            'Quick View Data',
            [$this, 'render'],
            'product',
            'normal',
            'default'
        );
    }

    public function render($post)
    {
        $characteristics  = get_post_meta($post->ID, '_qv_characteristics', true);
        ?>

        <p>
            <label><strong>Characteristics</strong></label><br>
            <textarea
                name="qv_characteristics"
                style="width:100%;height:120px;"
                placeholder="Enter characteristics..."
            ><?php echo esc_textarea($characteristics); ?></textarea>
        </p>

        <?php
    }

    public function save_meta($post_id)
    {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

        if (!current_user_can('edit_post', $post_id)) return;


        // Characteristics (plain text)
        if (isset($_POST['qv_characteristics'])) {
            update_post_meta(
                $post_id,
                '_qv_characteristics',
                sanitize_textarea_field($_POST['qv_characteristics'])
            );
        }
    }
}