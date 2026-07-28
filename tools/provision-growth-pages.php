<?php
/**
 * Idempotently provision code-owned growth pages.
 *
 * Run with: wp eval-file tools/provision-growth-pages.php
 */

defined( 'ABSPATH' ) || exit( "Run this file through WP-CLI with WordPress loaded.\n" );

$pages = array(
	array(
		'slug'    => 'school-trips-italy',
		'title'   => 'School Trips to Italy',
		'excerpt' => 'Tailored outdoor education and residential school trips in Piemonte, Italy.',
	),
);

foreach ( $pages as $page ) {
	$existing = get_page_by_path( $page['slug'], OBJECT, 'page' );
	if ( $existing && 'trash' !== $existing->post_status ) {
		if ( 'page' !== $existing->post_type ) {
			fwrite( STDERR, "Slug {$page['slug']} belongs to a non-page object.\n" );
			exit( 1 );
		}
		$result = wp_update_post(
			array(
				'ID'           => $existing->ID,
				'post_title'   => $page['title'],
				'post_excerpt' => $page['excerpt'],
				'post_status'  => 'publish',
			),
			true
		);
		if ( is_wp_error( $result ) ) {
			fwrite( STDERR, "Could not update {$page['slug']}: {$result->get_error_message()}\n" );
			exit( 1 );
		}
		delete_post_meta( $existing->ID, '_elementor_data' );
		delete_post_meta( $existing->ID, '_elementor_edit_mode' );
		echo "Updated {$page['slug']} as page #{$existing->ID}.\n";
		continue;
	}

	$post_id = wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => $page['title'],
			'post_name'    => $page['slug'],
			'post_excerpt' => $page['excerpt'],
			'post_content' => '',
		),
		true
	);
	if ( is_wp_error( $post_id ) ) {
		fwrite( STDERR, "Could not create {$page['slug']}: {$post_id->get_error_message()}\n" );
		exit( 1 );
	}
	echo "Created {$page['slug']} as page #{$post_id}.\n";
}

flush_rewrite_rules( false );

