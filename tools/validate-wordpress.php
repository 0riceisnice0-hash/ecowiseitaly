<?php
/**
 * Read-only post-restore validation. Run with: wp eval-file tools/validate-wordpress.php
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit( "Run this file through WP-CLI with WordPress loaded.\n" );

global $wpdb;

$errors   = array();
$warnings = array();
$root     = dirname( __DIR__ );

function ecowise_preflight_expect( $condition, $message ) {
	global $errors;
	if ( ! $condition ) {
		$errors[] = $message;
	}
}

ecowise_preflight_expect( 'wp_' === $wpdb->prefix, "Expected the substantive wp_ table prefix; received {$wpdb->prefix}." );
ecowise_preflight_expect( 'ecowise-custom' === get_option( 'template' ), 'Ecowise Custom is not the active parent theme.' );
ecowise_preflight_expect( 'ecowise-custom' === get_option( 'stylesheet' ), 'Ecowise Custom is not the active stylesheet.' );
ecowise_preflight_expect( 'page' === get_option( 'show_on_front' ), 'Settings > Reading is not configured to use a static front page.' );
ecowise_preflight_expect( 6 === (int) get_option( 'page_on_front' ), 'Front page is not WordPress object 6.' );
ecowise_preflight_expect( 2448 === (int) get_option( 'page_for_posts' ), 'Posts page is not WordPress object 2448.' );
ecowise_preflight_expect( '/%postname%/' === get_option( 'permalink_structure' ), 'Permalink structure is not /%postname%/.' );

$site_url = untrailingslashit( site_url() );
$home_url = untrailingslashit( home_url() );
ecowise_preflight_expect( $site_url === $home_url, "WordPress site URL ({$site_url}) and home URL ({$home_url}) differ." );
$expected_url = untrailingslashit( (string) getenv( 'ECOWISE_EXPECTED_URL' ) );
if ( $expected_url ) {
	ecowise_preflight_expect( $home_url === $expected_url, "Expected deployed URL {$expected_url}; WordPress reports {$home_url}." );
}

$expected_admin_email = strtolower( trim( (string) getenv( 'ECOWISE_EXPECTED_ADMIN_EMAIL' ) ) );
if ( $expected_admin_email ) {
	$users = get_users(
		array(
			'fields' => array( 'ID', 'user_email' ),
		)
	);
	ecowise_preflight_expect( 1 === count( $users ), 'Expected exactly one WordPress user; found ' . count( $users ) . '.' );
	if ( 1 === count( $users ) ) {
		$owner = $users[0];
		ecowise_preflight_expect(
			$expected_admin_email === strtolower( $owner->user_email ),
			"Expected sole WordPress owner {$expected_admin_email}; found {$owner->user_email}."
		);
		ecowise_preflight_expect(
			user_can( $owner->ID, 'manage_options' ),
			"Expected {$owner->user_email} to be an administrator."
		);
		ecowise_preflight_expect(
			empty( get_user_meta( $owner->ID, '_application_passwords', true ) ),
			"Unexpected application password exists for {$owner->user_email}."
		);
	}
	ecowise_preflight_expect( ! get_option( 'users_can_register' ), 'Public WordPress user registration is enabled.' );
}

$total_posts = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->posts}" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
ecowise_preflight_expect( 3899 <= $total_posts, "Expected at least 3,899 restored post rows; found {$total_posts}." );

$published_pages = wp_count_posts( 'page' );
$published_posts = wp_count_posts( 'post' );
$attachments     = wp_count_posts( 'attachment' );
ecowise_preflight_expect( 31 === (int) $published_pages->publish, "Expected 31 published pages; found {$published_pages->publish}." );
ecowise_preflight_expect( 3 === (int) $published_posts->publish, "Expected three published posts; found {$published_posts->publish}." );
ecowise_preflight_expect( 413 === (int) $attachments->inherit, "Expected 413 attachments; found {$attachments->inherit}." );

$school_funnel = get_page_by_path( 'school-trips-italy', OBJECT, 'page' );
ecowise_preflight_expect( $school_funnel && 'publish' === $school_funnel->post_status, 'The school-trips-italy growth page is missing or unpublished.' );
if ( $school_funnel ) {
	ecowise_preflight_expect( '' === (string) get_post_meta( $school_funnel->ID, '_elementor_data', true ), 'The school-trips-italy page unexpectedly contains Elementor data.' );
}

$legacy_plugins = array(
	'duplicate-page/duplicatepage.php',
	'elementor-pro/elementor-pro.php',
	'elementor/elementor.php',
	'elementskit-lite/elementskit-lite.php',
	'google-site-kit/google-site-kit.php',
	'microsoft-clarity/clarity.php',
	'pdfjs-viewer-for-elementor/pdf-viewer.php',
	'php_console/php_console.php',
	'skyboot-custom-icons-for-elementor/skyboot-custom-icons-for-elementor.php',
	'updraftplus/updraftplus.php',
	'wp-file-manager/file_folder_manager.php',
);
$active_plugins = (array) get_option( 'active_plugins', array() );
foreach ( array_intersect( $legacy_plugins, $active_plugins ) as $plugin ) {
	$errors[] = "Legacy plugin is still active: {$plugin}.";
}

$manifest_file = $root . '/audit/source/uploads-manifest.json';
ecowise_preflight_expect( is_readable( $manifest_file ), "Upload manifest is not readable at {$manifest_file}." );
$upload_count = 0;
if ( is_readable( $manifest_file ) ) {
	$manifest   = json_decode( file_get_contents( $manifest_file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$upload_dir = wp_get_upload_dir();
	ecowise_preflight_expect( is_array( $manifest ), 'Upload manifest is not valid JSON.' );
	if ( is_array( $manifest ) ) {
		foreach ( $manifest as $item ) {
			$relative_path = (string) $item['path'];
			if ( preg_match( '#^(?:template-kits/.*\.php|elementor/css/post-\d+\.css)$#i', $relative_path ) ) {
				continue;
			}
			$file = trailingslashit( $upload_dir['basedir'] ) . str_replace( '/', DIRECTORY_SEPARATOR, $item['path'] );
			if ( ! is_file( $file ) ) {
				$errors[] = "Restored upload is missing: {$item['path']}.";
				continue;
			}
			if ( filesize( $file ) !== (int) $item['size_bytes'] ) {
				$errors[] = "Restored upload has the wrong size: {$item['path']}.";
				continue;
			}
			++$upload_count;
		}
	}

	$uploads = new RecursiveIteratorIterator(
		new RecursiveDirectoryIterator( $upload_dir['basedir'], FilesystemIterator::SKIP_DOTS )
	);
	foreach ( $uploads as $upload ) {
		if ( $upload->isFile() && preg_match( '/\.(?:php\d*|phtml|phar)$/i', $upload->getFilename() ) ) {
			$errors[] = 'Executable PHP is present in uploads: ' . $upload->getPathname() . '.';
		}
	}
}

if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
	$warnings[] = 'WP_DEBUG is enabled; disable it for the production cutover.';
}

if ( $errors ) {
	fwrite( STDERR, 'WordPress restore validation failed (' . count( $errors ) . "):" . PHP_EOL . '- ' . implode( PHP_EOL . '- ', $errors ) . PHP_EOL );
	exit( 1 );
}

echo "WordPress restore validation passed: wp_ database, Ecowise Custom theme, reading/permalink settings, account ownership, 31 pages, 3 posts, 413 attachments and {$upload_count} upload files verified." . PHP_EOL;
if ( $warnings ) {
	echo 'Warnings:' . PHP_EOL . '- ' . implode( PHP_EOL . '- ', $warnings ) . PHP_EOL;
}
