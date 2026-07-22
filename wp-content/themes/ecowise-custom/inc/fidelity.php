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
	$is_rest_request = ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || isset( $_GET['rest_route'] );
	$is_sitemap      = (bool) get_query_var( 'sitemap' ) || isset( $_GET['sitemap'] );
	$is_dynamic_view = is_search() || is_feed() || is_trackback() || is_robots() || is_favicon() || is_paged() || is_embed();

	if ( ! ecowise_fidelity_enabled() || is_admin() || wp_doing_ajax() || is_user_logged_in() || is_preview() || $is_rest_request || $is_sitemap || $is_dynamic_view ) {
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
	$form_result = isset( $_GET['ecowise_form'] ) ? sanitize_key( wp_unslash( $_GET['ecowise_form'] ) ) : '';
	header( in_array( $form_result, array( 'success', 'error' ), true ) ? 'Cache-Control: private, no-store, max-age=0' : 'Cache-Control: private, max-age=300, must-revalidate' );

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
		$result_markup   = '';
		if ( 'success' === $form_result ) {
			$result_markup = '<div id="ecowise-form-status" role="status" style="margin:1rem 0;padding:.85rem 1rem;border:2px solid #19733b;background:#eef9f1;color:#153d23">' . esc_html__( 'Thank you. Your message has been sent.', 'ecowise' ) . '</div>';
		} elseif ( 'error' === $form_result ) {
			$result_markup = '<div id="ecowise-form-status" role="alert" style="margin:1rem 0;padding:.85rem 1rem;border:2px solid #a62b2b;background:#fff2f2;color:#641b1b">' . esc_html__( 'The message could not be sent. Please review the form and try again.', 'ecowise' ) . '</div>';
		}
		$fallback_fields = sprintf(
			'<input type="hidden" name="action" value="ecowise_fidelity_form"><input type="hidden" name="nonce" value="%1$s"><input type="hidden" name="source_page" value="%2$s"><input type="hidden" name="form_name" value="%3$s"><div aria-hidden="true" style="position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden"><label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>%4$s',
			esc_attr( $config['nonce'] ),
			esc_url( home_url( ecowise_fidelity_route_key() ) ),
			esc_attr__( 'Website enquiry', 'ecowise' ),
			$result_markup
		);
		$document        = preg_replace_callback(
			'/<form\b(?=[^>]*\bclass=(["\'])[^"\']*\belementor-form\b[^"\']*\1)[^>]*>/i',
			function ( $matches ) use ( $config, $fallback_fields ) {
				$form = $matches[0];
				if ( ! preg_match( '/\saction\s*=/i', $form ) ) {
					$form = preg_replace( '/>$/', ' action="' . esc_url( $config['endpoint'] ) . '">', $form );
				}
				return $form . $fallback_fields;
			},
			$document
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
