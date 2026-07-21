<?php
/**
 * Exact-route snapshot compatibility layer.
 *
 * The snapshots are complete, captured public documents. They are served only
 * for explicitly mapped GET/HEAD front-end routes. WordPress continues to own
 * admin, feeds, REST, previews, search, sitemaps and all unmapped requests.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

function ecowise_fidelity_enabled() {
	return (bool) apply_filters( 'ecowise_fidelity_enabled', true );
}

function ecowise_fidelity_route_key() {
	$path = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/', PHP_URL_PATH );
	$path = rawurldecode( (string) $path );
	$path = '/' . ltrim( $path, '/' );

	if ( '/' !== $path ) {
		$path = trailingslashit( $path );
	}

	return $path;
}

function ecowise_fidelity_map() {
	$map_file = get_theme_file_path( '/snapshots/routes.php' );
	if ( ! is_readable( $map_file ) ) {
		return array();
	}

	$map = require $map_file;
	return is_array( $map ) ? $map : array();
}

function ecowise_maybe_serve_fidelity_snapshot() {
	if ( ! ecowise_fidelity_enabled() || is_admin() || wp_doing_ajax() || is_user_logged_in() || is_preview() ) {
		return;
	}

	$method = isset( $_SERVER['REQUEST_METHOD'] ) ? strtoupper( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ) ) ) : 'GET';
	if ( ! in_array( $method, array( 'GET', 'HEAD' ), true ) ) {
		return;
	}

	$route = ecowise_fidelity_route_key();
	$map   = ecowise_fidelity_map();
	if ( empty( $map[ $route ] ) ) {
		return;
	}

	$file = get_theme_file_path( '/snapshots/html/' . ltrim( $map[ $route ], '/' ) );
	$root = realpath( get_theme_file_path( '/snapshots/html' ) );
	$real = realpath( $file );

	if ( ! $root || ! $real || 0 !== strpos( $real, $root ) || ! is_readable( $real ) ) {
		return;
	}

	status_header( 200 );
	header( 'Content-Type: text/html; charset=' . get_bloginfo( 'charset' ) );
	header( 'X-Ecowise-Renderer: fidelity-snapshot' );
	header( 'Cache-Control: public, max-age=300, stale-while-revalidate=86400' );

	if ( 'HEAD' !== $method ) {
		// The file is trusted build output committed with the theme.
		$document = file_get_contents( $real ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$config   = array(
			'endpoint' => admin_url( 'admin-post.php' ),
			'action'   => 'ecowise_fidelity_form',
			'nonce'    => wp_create_nonce( 'ecowise_fidelity_form' ),
			'messages' => array(
				'sending' => __( 'Sending…', 'ecowise' ),
				'success' => __( 'Thank you. Your message has been sent.', 'ecowise' ),
				'error'   => __( 'Sorry, the message could not be sent. Please email us directly.', 'ecowise' ),
			),
		);
		$enhancement = sprintf(
			'<script>window.ecowiseFidelity=%1$s;</script><script src="%2$s" defer></script>',
			wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ),
			esc_url( get_theme_file_uri( '/assets/js/fidelity.js' ) . '?ver=' . wp_get_theme()->get( 'Version' ) )
		);
		$document = str_replace( '</body>', $enhancement . '</body>', $document );
		echo $document; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
	exit;
}
add_action( 'template_redirect', 'ecowise_maybe_serve_fidelity_snapshot', 0 );
