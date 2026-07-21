<?php
/**
 * Theme setup.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

function ecowise_setup() {
	load_theme_textdomain( 'ecowise', get_template_directory() . '/languages' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'custom-logo', array( 'height' => 180, 'width' => 360, 'flex-height' => true, 'flex-width' => true ) );
	register_nav_menus(
		array(
			'primary' => __( 'Primary navigation', 'ecowise' ),
			'footer'  => __( 'Footer navigation', 'ecowise' ),
		)
	);
}
add_action( 'after_setup_theme', 'ecowise_setup' );

function ecowise_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'ecowise_content_width', 820 );
}
add_action( 'after_setup_theme', 'ecowise_content_width', 0 );

function ecowise_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'Footer', 'ecowise' ),
			'id'            => 'footer',
			'before_widget' => '<section class="footer-widget">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="footer-widget__title">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'ecowise_widgets_init' );

