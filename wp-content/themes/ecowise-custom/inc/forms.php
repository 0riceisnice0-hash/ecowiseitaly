<?php
/**
 * Builder-independent handling for forms inside fidelity snapshots.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

function ecowise_clean_form_fields( $raw ) {
	$clean = array();
	if ( ! is_array( $raw ) ) {
		return $clean;
	}
	$allowed_fields = array( 'name', 'email', 'field_f51b744', 'field_44bd0eb', 'field_6fef306', 'field_ab4d163' );

	foreach ( $raw as $key => $value ) {
		$key = sanitize_key( $key );
		if ( ! in_array( $key, $allowed_fields, true ) ) {
			continue;
		}
		if ( is_array( $value ) ) {
			$value = implode( ', ', array_map( 'sanitize_text_field', $value ) );
		}
		$textarea_fields = array( 'message', 'field_ab4d163' );
		$limit           = in_array( $key, $textarea_fields, true ) ? 5000 : 500;
		$value            = in_array( $key, $textarea_fields, true ) ? sanitize_textarea_field( $value ) : sanitize_text_field( $value );
		$clean[ $key ]   = function_exists( 'mb_substr' ) ? mb_substr( $value, 0, $limit ) : substr( $value, 0, $limit );
	}
	return $clean;
}

function ecowise_form_respond( $success, $message, $status = 200 ) {
	$accepts_json = isset( $_SERVER['HTTP_ACCEPT'] ) && false !== strpos( sanitize_text_field( wp_unslash( $_SERVER['HTTP_ACCEPT'] ) ), 'application/json' );
	if ( $accepts_json || wp_doing_ajax() ) {
		if ( $success ) {
			wp_send_json_success( array( 'message' => $message ), $status );
		}
		wp_send_json_error( array( 'message' => $message ), $status );
	}

	$source = isset( $_POST['source_page'] ) ? esc_url_raw( wp_unslash( $_POST['source_page'] ) ) : wp_get_referer();
	$source = wp_validate_redirect( $source, home_url( '/' ) );
	$source = remove_query_arg( 'ecowise_form', $source );
	$target = add_query_arg( 'ecowise_form', $success ? 'success' : 'error', $source ) . '#ecowise-form-status';
	wp_safe_redirect( $target, 303 );
	exit;
}

function ecowise_handle_fidelity_form() {
	if ( ! check_ajax_referer( 'ecowise_fidelity_form', 'nonce', false ) ) {
		ecowise_form_respond( false, __( 'The form expired. Refresh the page and try again.', 'ecowise' ), 403 );
	}

	if ( ! empty( $_POST['website'] ) ) {
		ecowise_form_respond( true, __( 'Thank you.', 'ecowise' ) );
	}

	$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
	$form_id = isset( $_POST['form_id'] ) ? sanitize_key( wp_unslash( $_POST['form_id'] ) ) : '';
	if ( 421 === $post_id && '68574d28' === $form_id ) {
		$form_type        = 'contact';
		$allowed_for_form = array( 'name', 'field_f51b744', 'email', 'field_44bd0eb', 'field_6fef306', 'field_ab4d163' );
		$required_fields  = array( 'email', 'field_44bd0eb', 'field_6fef306' );
		$default_recipient = 'adamecorose@gmail.com';
	} elseif ( 2444 === $post_id && '1b3fffa7' === $form_id ) {
		$form_type         = 'newsletter';
		$allowed_for_form  = array( 'name', 'email' );
		$required_fields   = array( 'email' );
		$default_recipient = 'saqibbalii099@gmail.com';
	} else {
		ecowise_form_respond( false, __( 'This form is not recognized. Refresh the page and try again.', 'ecowise' ), 400 );
	}

	$raw_fields = isset( $_POST['form_fields'] ) ? wp_unslash( $_POST['form_fields'] ) : array();
	if ( ! is_array( $raw_fields ) || count( $raw_fields ) > 12 || strlen( wp_json_encode( $raw_fields ) ) > 12000 ) {
		ecowise_form_respond( false, __( 'The submitted form is too large.', 'ecowise' ), 413 );
	}
	$fields = ecowise_clean_form_fields( $raw_fields );
	if ( empty( $fields ) ) {
		ecowise_form_respond( false, __( 'Please complete the form.', 'ecowise' ), 400 );
	}
	if ( array_diff( array_keys( $fields ), $allowed_for_form ) ) {
		ecowise_form_respond( false, __( 'The submitted form contains unexpected fields.', 'ecowise' ), 400 );
	}
	foreach ( $required_fields as $required_field ) {
		if ( empty( $fields[ $required_field ] ) ) {
			ecowise_form_respond( false, __( 'Please complete all required fields.', 'ecowise' ), 400 );
		}
	}

	$email = ! empty( $fields['email'] ) && is_email( $fields['email'] ) ? sanitize_email( $fields['email'] ) : '';
	if ( ! $email ) {
		ecowise_form_respond( false, __( 'Please enter a valid email address.', 'ecowise' ), 400 );
	}

	$ip            = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
	$client_ip     = sanitize_text_field( apply_filters( 'ecowise_form_client_ip', $ip ) );
	$rate_identity = $client_ip . '|' . strtolower( $email );
	$rate_key      = 'ecowise_form_' . substr( hash_hmac( 'sha256', $rate_identity, wp_salt( 'nonce' ) ), 0, 24 );
	$send_count    = (int) get_transient( $rate_key );
	if ( $send_count >= 5 ) {
		ecowise_form_respond( false, __( 'Too many messages were sent. Please wait and try again.', 'ecowise' ), 429 );
	}
	set_transient( $rate_key, $send_count + 1, 10 * MINUTE_IN_SECONDS );

	$page      = isset( $_POST['source_page'] ) ? substr( esc_url_raw( wp_unslash( $_POST['source_page'] ) ), 0, 2000 ) : home_url( '/' );
	$form_name = 'contact' === $form_type ? __( 'Contact enquiry', 'ecowise' ) : __( 'Newsletter signup', 'ecowise' );
	$field_labels = array(
		'name'          => 'contact' === $form_type ? 'First Name' : 'Name',
		'email'         => 'Email',
		'field_f51b744' => 'Last Name',
		'field_44bd0eb' => 'Phone',
		'field_6fef306' => 'Subject',
		'field_ab4d163' => 'Message',
	);
	$lines        = array( 'Source: ' . $page, '' );
	foreach ( $fields as $key => $value ) {
		$label   = isset( $field_labels[ $key ] ) ? $field_labels[ $key ] : ucwords( str_replace( array( '-', '_' ), ' ', $key ) );
		$lines[] = $label . ': ' . $value;
	}

	$headers = array( 'Content-Type: text/plain; charset=UTF-8' );
	if ( $email ) {
		$headers[] = 'Reply-To: ' . $email;
	}

	$recipient    = sanitize_email( apply_filters( 'ecowise_form_recipient', $default_recipient, $form_type, $fields ) );
	$mail_subject = substr( ! empty( $fields['field_6fef306'] ) ? $fields['field_6fef306'] : $form_name, 0, 200 );
	$sent         = wp_mail( $recipient, '[Ecowise Italy] ' . $mail_subject, implode( "\n", $lines ), $headers );

	if ( ! $sent ) {
		ecowise_form_respond( false, __( 'The message could not be sent. Please email us directly.', 'ecowise' ), 500 );
	}

	ecowise_form_respond( true, __( 'Thank you. Your message has been sent.', 'ecowise' ) );
}
add_action( 'admin_post_nopriv_ecowise_fidelity_form', 'ecowise_handle_fidelity_form' );
add_action( 'admin_post_ecowise_fidelity_form', 'ecowise_handle_fidelity_form' );
