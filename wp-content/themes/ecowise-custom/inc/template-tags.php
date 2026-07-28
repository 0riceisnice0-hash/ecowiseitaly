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

function ecowise_navigation_fallback( $args = array() ) {
	$menu_id = ! empty( $args['menu_id'] ) ? $args['menu_id'] : 'primary-menu';
	$items   = array(
		home_url( '/' )                    => __( 'Home', 'ecowise' ),
		home_url( '/for-schools/' )        => __( 'For Schools', 'ecowise' ),
		home_url( '/school-trips-italy/' ) => __( 'Plan a School Trip', 'ecowise' ),
		home_url( '/family-ecoadventures/' ) => __( 'Family Eco-Adventures', 'ecowise' ),
		home_url( '/gateways/' )           => __( 'Getaways', 'ecowise' ),
		home_url( '/contact-us/' )         => __( 'Contact', 'ecowise' ),
	);
	printf( '<ul id="%s" class="menu">', esc_attr( $menu_id ) );
	foreach ( $items as $url => $label ) {
		printf( '<li class="menu-item"><a href="%1$s">%2$s</a></li>', esc_url( $url ), esc_html( $label ) );
	}
	echo '</ul>';
}
