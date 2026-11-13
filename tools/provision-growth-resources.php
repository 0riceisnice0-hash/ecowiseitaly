<?php
/** Create the two reviewed resource routes without overwriting existing user content. */
defined( 'ABSPATH' ) || exit;
$items = array( 'planning-a-school-trip-to-italy' => 'Planning a school trip to Italy', 'school-travel-partners' => 'School travel partners' );
foreach ( $items as $slug => $title ) {
    $existing = get_page_by_path( $slug, OBJECT, 'page' );
    if ( $existing ) {
        if ( 'publish' !== $existing->post_status || ! get_post_meta( $existing->ID, '_ecowise_resource_owned', true ) ) { WP_CLI::error( "Refusing to overwrite existing $slug" ); }
        WP_CLI::log( "Retained existing resource $slug" ); continue;
    }
    $id = wp_insert_post( array( 'post_type'=>'page', 'post_status'=>'publish', 'post_title'=>$title, 'post_name'=>$slug, 'post_content'=>'' ), true );
    if ( is_wp_error( $id ) ) { WP_CLI::error( $id->get_error_message() ); }
    update_post_meta( $id, '_ecowise_resource_owned', '1' );
    WP_CLI::success( "Created $slug as #$id" );
}
flush_rewrite_rules( false );
