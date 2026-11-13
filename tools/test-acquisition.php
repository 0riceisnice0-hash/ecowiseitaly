<?php
/** Run with wp eval-file; transactional tests leave no reporting counts. */
global $wpdb;
$table = $wpdb->prefix . 'ecowise_acquisition';
$status = $wpdb->get_row( $wpdb->prepare( 'SHOW TABLE STATUS WHERE Name=%s', $table ), ARRAY_A );
if ( ! $status || 'InnoDB' !== $status['Engine'] ) { WP_CLI::error( 'Aggregate table must use InnoDB for transactional tests.' ); }
$wpdb->query( 'START TRANSACTION' );
try {
    $before = (int) $wpdb->get_var( "SELECT SUM(total) FROM $table" );
    if ( ecowise_acquisition_count( 'enquiry_recorded', '/not-a-route/' ) ) { throw new Exception( 'Unknown route accepted' ); }
    if ( ecowise_acquisition_count( 'invented_event', '/school-trips-italy/' ) ) { throw new Exception( 'Unknown event accepted' ); }
    if ( ! ecowise_acquisition_count( 'page_view', '/school-trips-italy/', 'operators-2026-10', 'email' ) ) { throw new Exception( 'Insert failed' ); }
    if ( ! ecowise_acquisition_count( 'page_view', '/school-trips-italy/', 'operators-2026-10', 'email' ) ) { throw new Exception( 'Increment failed' ); }
    if ( (int) $wpdb->get_var( "SELECT SUM(total) FROM $table" ) !== $before + 2 ) { throw new Exception( 'Atomic aggregate count wrong' ); }
    if ( ! ecowise_acquisition_count( 'page_view', '/news/' ) ) { throw new Exception( 'Preserved customer route was not measured' ); }
    if ( (int) $wpdb->get_var( "SELECT SUM(total) FROM $table" ) !== $before + 3 ) { throw new Exception( 'Whole-site route count wrong' ); }
    if ( ! wp_next_scheduled( 'ecowise_acquisition_cleanup' ) ) { throw new Exception( 'Retention cleanup missing' ); }
    $html = ecowise_search_content( '/for-schools/science-field-work-data-collection-trips/' );
    if ( false === strpos( $html, 'IB biology' ) || false === strpos( $html, '#teacher-resources' ) ) { throw new Exception( 'Fieldwork search content missing' ); }
    $template = file_get_contents( get_theme_file_path( '/page-school-trips-italy.php' ) );
    if ( 5 !== preg_match_all( '/<(?:input|textarea|select)\b[^>]*\brequired\b/', $template ) ) { throw new Exception( 'Expected five required enquiry controls' ); }
    WP_CLI::success( 'Acquisition aggregate, validation, retention, search content and short enquiry form tests passed.' );
} finally {
    $wpdb->query( 'ROLLBACK' );
}
