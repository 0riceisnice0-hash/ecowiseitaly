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

	foreach ( $raw as $key => $value ) {
		$key = sanitize_key( $key );
		if ( is_array( $value ) ) {
			$value = implode( ', ', array_map( 'sanitize_text_field', $value ) );
		}
		$textarea_fields = array( 'message', 'field_ab4d163' );
		$clean[ $key ]   = in_array( $key, $textarea_fields, true ) ? sanitize_textarea_field( $value ) : sanitize_text_field( $value );
	}
	return $clean;
}

function ecowise_handle_fidelity_form() {
	if ( ! check_ajax_referer( 'ecowise_fidelity_form', 'nonce', false ) ) {
		wp_send_json_error( array( 'message' => __( 'The form expired. Refresh the page and try again.', 'ecowise' ) ), 403 );
	}

	if ( ! empty( $_POST['website'] ) ) {
		wp_send_json_success( array( 'message' => __( 'Thank you.', 'ecowise' ) ) );
	}

	$ip        = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
	$rate_key  = 'ecowise_form_' . substr( hash_hmac( 'sha256', $ip, wp_salt( 'nonce' ) ), 0, 24 );
	$send_count = (int) get_transient( $rate_key );
	if ( $send_count >= 5 ) {
		wp_send_json_error( array( 'message' => __( 'Too many messages were sent. Please wait and try again.', 'ecowise' ) ), 429 );
	}
	set_transient( $rate_key, $send_count + 1, 10 * MINUTE_IN_SECONDS );

	$fields = ecowise_clean_form_fields( isset( $_POST['form_fields'] ) ? wp_unslash( $_POST['form_fields'] ) : array() );
	if ( empty( $fields ) ) {
		wp_send_json_error( array( 'message' => __( 'Please complete the form.', 'ecowise' ) ), 400 );
	}

	$email = '';
	foreach ( array( 'email', 'field_2', 'email_address' ) as $email_key ) {
		if ( ! empty( $fields[ $email_key ] ) && is_email( $fields[ $email_key ] ) ) {
			$email = sanitize_email( $fields[ $email_key ] );
			break;
		}
	}

	$page      = isset( $_POST['source_page'] ) ? esc_url_raw( wp_unslash( $_POST['source_page'] ) ) : home_url( '/' );
	$form_name = isset( $_POST['form_name'] ) ? sanitize_text_field( wp_unslash( $_POST['form_name'] ) ) : __( 'Website enquiry', 'ecowise' );
	$field_labels = array(
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

	$recipient    = sanitize_email( apply_filters( 'ecowise_form_recipient', get_option( 'admin_email' ) ) );
	$mail_subject = ! empty( $fields['field_6fef306'] ) ? $fields['field_6fef306'] : $form_name;
	$sent         = wp_mail( $recipient, '[Ecowise Italy] ' . $mail_subject, implode( "\n", $lines ), $headers );

	if ( ! $sent ) {
		wp_send_json_error( array( 'message' => __( 'The message could not be sent. Please email us directly.', 'ecowise' ) ), 500 );
	}

	wp_send_json_success( array( 'message' => __( 'Thank you. Your message has been sent.', 'ecowise' ) ) );
}
add_action( 'admin_post_nopriv_ecowise_fidelity_form', 'ecowise_handle_fidelity_form' );
add_action( 'admin_post_ecowise_fidelity_form', 'ecowise_handle_fidelity_form' );
