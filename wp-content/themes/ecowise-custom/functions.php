<?php
/**
 * Ecowise Custom theme bootstrap.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

$ecowise_includes = array(
	'/inc/setup.php',
	'/inc/assets.php',
	'/inc/template-tags.php',
	'/inc/fidelity.php',
	'/inc/forms.php',
	'/inc/seo.php',
);

foreach ( $ecowise_includes as $ecowise_include ) {
	require_once get_theme_file_path( $ecowise_include );
}
