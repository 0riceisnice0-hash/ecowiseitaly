<?php
/**
 * Native-template assets.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

function ecowise_enqueue_assets() {
	$version = wp_get_theme()->get( 'Version' );
	wp_enqueue_style( 'ecowise-site', get_theme_file_uri( '/assets/css/site.css' ), array(), $version );
	wp_enqueue_script( 'ecowise-site', get_theme_file_uri( '/assets/js/site.js' ), array(), $version, true );
}
add_action( 'wp_enqueue_scripts', 'ecowise_enqueue_assets' );

