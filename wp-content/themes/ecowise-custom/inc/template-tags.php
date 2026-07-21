<?php
/**
 * Small reusable template helpers.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

function ecowise_site_logo() {
	if ( has_custom_logo() ) {
		the_custom_logo();
		return;
	}

	printf(
		'<a class="site-brand__text" href="%1$s" rel="home">%2$s</a>',
		esc_url( home_url( '/' ) ),
		esc_html( get_bloginfo( 'name' ) )
	);
}

function ecowise_posted_on() {
	printf(
		'<time class="entry-date published" datetime="%1$s">%2$s</time>',
		esc_attr( get_the_date( DATE_W3C ) ),
		esc_html( get_the_date() )
	);
}

