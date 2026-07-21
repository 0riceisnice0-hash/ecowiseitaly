<?php
/**
 * Conservative SEO compatibility helpers for native routes.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

function ecowise_has_seo_plugin() {
	return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'SEOPRESS_VERSION' );
}

function ecowise_native_canonical() {
	if ( ecowise_has_seo_plugin() || is_404() || is_search() || is_paged() ) {
		return;
	}

	$url = '';
	if ( is_singular() ) {
		$url = get_permalink();
	} elseif ( is_home() ) {
		$posts_page = (int) get_option( 'page_for_posts' );
		$url        = $posts_page ? get_permalink( $posts_page ) : home_url( '/' );
	} elseif ( is_day() ) {
		$url = get_day_link( (int) get_query_var( 'year' ), (int) get_query_var( 'monthnum' ), (int) get_query_var( 'day' ) );
	} elseif ( is_month() ) {
		$url = get_month_link( (int) get_query_var( 'year' ), (int) get_query_var( 'monthnum' ) );
	} elseif ( is_year() ) {
		$url = get_year_link( (int) get_query_var( 'year' ) );
	} elseif ( is_category() || is_tag() || is_tax() ) {
		$url = get_term_link( get_queried_object() );
	} elseif ( is_author() ) {
		$url = get_author_posts_url( (int) get_queried_object_id() );
	} elseif ( is_post_type_archive() ) {
		$url = get_post_type_archive_link( get_query_var( 'post_type' ) );
	}

	if ( $url && ! is_wp_error( $url ) ) {
		printf( "\n<link rel=\"canonical\" href=\"%s\">\n", esc_url( $url ) );
	}
}
add_action( 'wp_head', 'ecowise_native_canonical', 1 );

function ecowise_legacy_canonical_redirects() {
	if ( is_admin() || wp_doing_ajax() ) {
		return;
	}

	$path = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/', PHP_URL_PATH );
	if ( '/home/' === trailingslashit( (string) $path ) ) {
		wp_safe_redirect( home_url( '/' ), 301, 'Ecowise Custom' );
		exit;
	}

	if ( '/sitemap.xml' === untrailingslashit( (string) $path ) ) {
		wp_safe_redirect( home_url( '/wp-sitemap.xml' ), 301, 'Ecowise Custom' );
		exit;
	}
}
add_action( 'template_redirect', 'ecowise_legacy_canonical_redirects', -10 );
