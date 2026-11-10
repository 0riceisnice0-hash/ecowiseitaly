<?php
/** First-party aggregate campaign counts. No cookies, visitor IDs or individual histories. */
defined( 'ABSPATH' ) || exit;

function ecowise_acquisition_install() {
	global $wpdb;
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	$table = $wpdb->prefix . 'ecowise_acquisition';
	dbDelta( "CREATE TABLE $table (
		day date NOT NULL,
		page varchar(150) NOT NULL,
		campaign varchar(40) NOT NULL,
		source varchar(20) NOT NULL,
		event varchar(40) NOT NULL,
		total bigint unsigned NOT NULL DEFAULT 0,
		PRIMARY KEY (day,page,campaign,source,event)
	) " . $wpdb->get_charset_collate() . ';' );
	if ( ! wp_next_scheduled( 'ecowise_acquisition_cleanup' ) ) {
		wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'ecowise_acquisition_cleanup' );
	}
}
add_action( 'after_switch_theme', 'ecowise_acquisition_install' );

function ecowise_acquisition_cleanup() {
	global $wpdb;
	$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->prefix}ecowise_acquisition WHERE day < %s", gmdate( 'Y-m-d', time() - 90 * DAY_IN_SECONDS ) ) );
}
add_action( 'ecowise_acquisition_cleanup', 'ecowise_acquisition_cleanup' );

function ecowise_acquisition_campaigns() {
	return array( 'unattributed', 'operators-2026-10', 'swiss-schools-2026-10', 'linkedin-2026-10', 'uk-schools-2026-10' );
}

function ecowise_acquisition_count( $event, $page, $campaign = 'unattributed', $source = 'direct-other' ) {
	global $wpdb;
	$allowed = array( 'page_view', 'proposal_cta', 'planning_pack_download', 'partner_brief_download', 'proposal_form_start', 'contact_click', 'form_start', 'enquiry_recorded' );
	if ( ! in_array( $event, $allowed, true ) ) { return false; }
	$campaign = in_array( $campaign, ecowise_acquisition_campaigns(), true ) ? $campaign : 'unattributed';
	$source = in_array( $source, array( 'email', 'google', 'bing', 'facebook', 'linkedin', 'internal', 'direct-other' ), true ) ? $source : 'direct-other';
	$page = '/' . trim( (string) wp_parse_url( $page, PHP_URL_PATH ), '/' );
	$page = '/' === $page ? '/' : $page . '/';
	$routes = array_keys( ecowise_seo_profiles() );
	if ( ! in_array( $page, $routes, true ) ) { return false; }
	return false !== $wpdb->query( $wpdb->prepare(
		"INSERT INTO {$wpdb->prefix}ecowise_acquisition (day,page,campaign,source,event,total) VALUES (%s,%s,%s,%s,%s,1) ON DUPLICATE KEY UPDATE total=total+1",
		gmdate( 'Y-m-d' ), $page, $campaign, $source, $event
	) );
}

function ecowise_acquisition_receive() {
	nocache_headers();
	if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) { status_header( 405 ); exit; }
	$origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? wp_parse_url( wp_unslash( $_SERVER['HTTP_ORIGIN'] ), PHP_URL_HOST ) : '';
	if ( ! $origin || strtolower( $origin ) !== strtolower( (string) wp_parse_url( home_url(), PHP_URL_HOST ) ) ) { status_header( 403 ); exit; }
	if ( is_user_logged_in() ) { status_header( 204 ); exit; }
	// Temporary abuse protection only. The raw IP never enters the reporting table.
	$ip = $_SERVER['REMOTE_ADDR'] ?? '';
	$key = 'eco_count_' . substr( hash_hmac( 'sha256', gmdate( 'Y-m-d-H-i' ) . '|' . $ip, wp_salt( 'nonce' ) ), 0, 24 );
	$hits = (int) get_transient( $key );
	if ( $hits >= 30 ) { status_header( 429 ); exit; }
	set_transient( $key, $hits + 1, 2 * MINUTE_IN_SECONDS );
	$event = sanitize_key( wp_unslash( $_POST['event'] ?? '' ) );
	if ( 'enquiry_recorded' === $event ) { status_header( 400 ); exit; } // Server-only conversion.
	$ok = ecowise_acquisition_count( $event, sanitize_text_field( wp_unslash( $_POST['page'] ?? '' ) ), sanitize_key( wp_unslash( $_POST['campaign'] ?? '' ) ), sanitize_key( wp_unslash( $_POST['source'] ?? '' ) ) );
	status_header( $ok ? 204 : 400 ); exit;
}
add_action( 'admin_post_nopriv_ecowise_acquisition', 'ecowise_acquisition_receive' );
add_action( 'admin_post_ecowise_acquisition', 'ecowise_acquisition_receive' );

function ecowise_acquisition_markup() {
	$config = array( 'endpoint' => admin_url( 'admin-post.php' ), 'exclude' => is_user_logged_in(), 'campaigns' => ecowise_acquisition_campaigns() );
	return '<details style="max-width:1100px;margin:20px auto;padding:16px 24px;font:14px/1.6 sans-serif;color:#34483a;background:#f2f6ef"><summary>How this site measures enquiries and campaign activity</summary><p>EcoWise Italy keeps aggregate counts of page loads, guide downloads, contact-link clicks and enquiry records to understand which programmes and campaigns are useful. Counts contain a date, page, broad source, campaign name and event, not a visitor identity or browsing history. No analytics cookies, browser storage or third-party analytics service are used. Aggregate counts are removed after 90 days. Temporary keyed network hashes limit abuse and expire after two minutes. Browser counts respect Do Not Track. Hosting logs and embedded third-party services have their own data processing. Questions: adamecorose@gmail.com.</p></details><script>window.ecowiseAcquisition=' . wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . ';</script><script defer src="' . esc_url( get_theme_file_uri( '/assets/js/acquisition.js' ) . '?ver=' . wp_get_theme()->get( 'Version' ) ) . '"></script>';
}

function ecowise_acquisition_admin_menu() {
	add_management_page( 'Acquisition report', 'Acquisition report', 'manage_options', 'ecowise-acquisition', 'ecowise_acquisition_report' );
}
add_action( 'admin_menu', 'ecowise_acquisition_admin_menu' );

function ecowise_acquisition_report() {
	if ( ! current_user_can( 'manage_options' ) ) { return; }
	global $wpdb;
	$rows = $wpdb->get_results( $wpdb->prepare( "SELECT campaign,source,event,SUM(total) AS total FROM {$wpdb->prefix}ecowise_acquisition WHERE day >= %s GROUP BY campaign,source,event ORDER BY campaign,source,event", gmdate( 'Y-m-d', time() - 30 * DAY_IN_SECONDS ) ), ARRAY_A );
	echo '<div class="wrap"><h1>EcoWise Italy acquisition — last 30 days</h1><p>Aggregate event counts, not unique visitors, email opens, confirmed deliveries or bookings. Refreshes and automated traffic can contribute. No cookies or visitor identifiers; counts expire after 90 days. Enquiry records are counted on the server, not on a thank-you-page refresh.</p><p>Campaign tags persist in internal links without browser storage. A new direct visit cannot be attributed to an earlier visit. Logged-in administrators and Do Not Track visitors are excluded from browser counts.</p><table class="widefat striped"><thead><tr><th>Campaign</th><th>Source</th><th>Event</th><th>Count</th></tr></thead><tbody>';
	foreach ( $rows as $row ) {
		echo '<tr><td>' . esc_html( $row['campaign'] ) . '</td><td>' . esc_html( $row['source'] ) . '</td><td>' . esc_html( $row['event'] ) . '</td><td>' . esc_html( $row['total'] ) . '</td></tr>';
	}
	echo '</tbody></table><p>Use the private Enquiries screen to review and qualify actual submissions. Search Console remains the source for Google search clicks and impressions.</p></div>';
}
