<?php
/**
 * Private lead ledger and school proposal form.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

function ecowise_register_enquiry_type() {
	register_post_type(
		'ecowise_enquiry',
		array(
			'labels' => array(
				'name'          => __( 'Enquiries', 'ecowise' ),
				'singular_name' => __( 'Enquiry', 'ecowise' ),
				'menu_name'     => __( 'Enquiries', 'ecowise' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => false,
			'exclude_from_search' => true,
			'menu_icon'           => 'dashicons-email-alt',
			'supports'            => array( 'title', 'editor' ),
			'capabilities'        => array(
				'edit_post'          => 'manage_options',
				'read_post'          => 'manage_options',
				'delete_post'        => 'manage_options',
				'edit_posts'         => 'manage_options',
				'edit_others_posts'  => 'manage_options',
				'publish_posts'      => 'manage_options',
				'read_private_posts' => 'manage_options',
				'create_posts'       => 'do_not_allow',
			),
			'map_meta_cap'        => false,
		)
	);
}
add_action( 'init', 'ecowise_register_enquiry_type' );

function ecowise_enquiry_label( $key ) {
	$labels = array(
		'school_name'      => 'School',
		'contact_name'     => 'Contact name',
		'role'             => 'Role',
		'country'          => 'Country',
		'email'            => 'Email',
		'phone'            => 'Phone / WhatsApp',
		'pupil_ages'       => 'Pupil ages / year groups',
		'students'         => 'Estimated students',
		'adults'           => 'Estimated adults',
		'preferred_dates'  => 'Preferred dates / season',
		'date_flexibility' => 'Date flexibility',
		'trip_format'      => 'Trip format',
		'duration'         => 'Preferred duration',
		'objectives'       => 'Learning priorities',
		'requirements'     => 'Access / dietary planning notes',
		'message'          => 'Anything else',
		'source_page'      => 'Source page',
		'referrer'         => 'Referrer',
		'utm_source'       => 'UTM source',
		'utm_medium'       => 'UTM medium',
		'utm_campaign'     => 'UTM campaign',
		'utm_content'      => 'UTM content',
		'utm_term'         => 'UTM term',
	);
	return isset( $labels[ $key ] ) ? $labels[ $key ] : ucwords( str_replace( array( '-', '_' ), ' ', $key ) );
}

/**
 * Store an enquiry in a private, administrator-only WordPress ledger.
 */
function ecowise_record_enquiry( $type, $fields, $source = '', $email = '' ) {
	$type       = sanitize_key( $type );
	$email      = sanitize_email( $email );
	$title_part = '';
	foreach ( array( 'school_name', 'name', 'contact_name', 'email' ) as $candidate ) {
		if ( ! empty( $fields[ $candidate ] ) ) {
			$title_part = sanitize_text_field( $fields[ $candidate ] );
			break;
		}
	}
	$lines = array();
	foreach ( $fields as $key => $value ) {
		if ( in_array( $key, array( 'privacy_consent', 'website' ), true ) || '' === (string) $value ) {
			continue;
		}
		$lines[] = ecowise_enquiry_label( $key ) . ': ' . sanitize_textarea_field( $value );
	}
	if ( $source && empty( $fields['source_page'] ) ) {
		$lines[] = 'Source page: ' . esc_url_raw( $source );
	}

	$post_id = wp_insert_post(
		array(
			'post_type'    => 'ecowise_enquiry',
			'post_status'  => 'private',
			'post_title'   => sprintf( '%1$s — %2$s — %3$s', ucfirst( $type ), $title_part ? $title_part : 'Unknown contact', current_time( 'Y-m-d H:i' ) ),
			'post_content' => implode( "\n", $lines ),
		),
		true
	);
	if ( is_wp_error( $post_id ) ) {
		return $post_id;
	}
	update_post_meta( $post_id, '_ecowise_enquiry_type', $type );
	update_post_meta( $post_id, '_ecowise_enquiry_email', $email );
	update_post_meta( $post_id, '_ecowise_enquiry_status', 'new' );
	update_post_meta( $post_id, '_ecowise_enquiry_source', esc_url_raw( $source ) );
	return $post_id;
}

function ecowise_school_enquiry_redirect( $status ) {
	$target = add_query_arg( 'school_enquiry', sanitize_key( $status ), home_url( '/school-trips-italy/' ) ) . '#school-enquiry';
	wp_safe_redirect( $target, 303 );
	exit;
}

function ecowise_handle_school_enquiry() {
	if ( ! check_admin_referer( 'ecowise_school_enquiry', 'ecowise_school_nonce' ) ) {
		ecowise_school_enquiry_redirect( 'expired' );
	}
	if ( ! empty( $_POST['website'] ) ) {
		ecowise_school_enquiry_redirect( 'success' );
	}

	$text_fields = array(
		'school_name',
		'contact_name',
		'role',
		'country',
		'phone',
		'pupil_ages',
		'students',
		'adults',
		'preferred_dates',
		'date_flexibility',
		'trip_format',
		'duration',
		'utm_source',
		'utm_medium',
		'utm_campaign',
		'utm_content',
		'utm_term',
	);
	$fields      = array();
	foreach ( $text_fields as $key ) {
		$value          = isset( $_POST[ $key ] ) ? sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) : '';
		$fields[ $key ] = function_exists( 'mb_substr' ) ? mb_substr( $value, 0, 500 ) : substr( $value, 0, 500 );
	}
	foreach ( array( 'objectives', 'requirements', 'message' ) as $key ) {
		$value          = isset( $_POST[ $key ] ) ? sanitize_textarea_field( wp_unslash( $_POST[ $key ] ) ) : '';
		$fields[ $key ] = function_exists( 'mb_substr' ) ? mb_substr( $value, 0, 5000 ) : substr( $value, 0, 5000 );
	}
	$fields['email']       = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$fields['source_page'] = isset( $_POST['source_page'] ) ? esc_url_raw( wp_unslash( $_POST['source_page'] ) ) : home_url( '/school-trips-italy/' );
	$fields['referrer']    = isset( $_POST['referrer'] ) ? esc_url_raw( wp_unslash( $_POST['referrer'] ) ) : '';

	$required = array( 'school_name', 'contact_name', 'role', 'country', 'email', 'pupil_ages', 'students', 'preferred_dates', 'trip_format', 'objectives' );
	foreach ( $required as $key ) {
		if ( empty( $fields[ $key ] ) ) {
			ecowise_school_enquiry_redirect( 'incomplete' );
		}
	}
	if ( ! is_email( $fields['email'] ) || empty( $_POST['privacy_consent'] ) ) {
		ecowise_school_enquiry_redirect( 'incomplete' );
	}

	$ip        = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
	$rate_key  = 'ecowise_school_' . substr( hash_hmac( 'sha256', $ip . '|' . strtolower( $fields['email'] ), wp_salt( 'nonce' ) ), 0, 24 );
	$send_count = (int) get_transient( $rate_key );
	if ( $send_count >= 4 ) {
		ecowise_school_enquiry_redirect( 'rate' );
	}
	set_transient( $rate_key, $send_count + 1, 15 * MINUTE_IN_SECONDS );

	$record_id = ecowise_record_enquiry( 'school proposal', $fields, $fields['source_page'], $fields['email'] );
	if ( is_wp_error( $record_id ) ) {
		ecowise_school_enquiry_redirect( 'error' );
	}

	$lines = array( 'New school proposal request', 'Lead record: #' . $record_id, '' );
	foreach ( $fields as $key => $value ) {
		if ( '' !== (string) $value ) {
			$lines[] = ecowise_enquiry_label( $key ) . ': ' . $value;
		}
	}
	$headers = array(
		'Content-Type: text/plain; charset=UTF-8',
		'Reply-To: ' . $fields['email'],
	);
	$sent    = wp_mail(
		'adamecorose@gmail.com',
		'[EcoWise Italy] School proposal — ' . $fields['school_name'],
		implode( "\n", $lines ),
		$headers
	);
	update_post_meta( $record_id, '_ecowise_email_delivery', $sent ? 'sent' : 'failed' );

	ecowise_school_enquiry_redirect( $sent ? 'success' : 'saved' );
}
add_action( 'admin_post_nopriv_ecowise_school_enquiry', 'ecowise_handle_school_enquiry' );
add_action( 'admin_post_ecowise_school_enquiry', 'ecowise_handle_school_enquiry' );

