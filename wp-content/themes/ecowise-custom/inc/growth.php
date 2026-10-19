<?php
/**
 * Conversion links from preserved school pages to the native school funnel.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

function ecowise_school_conversion_routes() {
	return array(
		'/for-schools/',
		'/for-schools/day-programs/',
		'/for-schools/residential-field-trips/',
		'/for-schools/science-ecology-environment-field-trips/',
		'/for-schools/science-field-work-data-collection-trips/',
		'/for-schools/outdoor-service-education-projects/',
	);
}

function ecowise_enhance_school_snapshot( $document, $route ) {
	if ( ! in_array( $route, ecowise_school_conversion_routes(), true ) ) {
		return $document;
	}

	$stylesheet = sprintf(
		'<link id="ecowise-school-conversion-css" rel="stylesheet" href="%s">',
		esc_url( get_theme_file_uri( '/assets/css/school-conversion.css' ) . '?ver=' . wp_get_theme()->get( 'Version' ) . '-' . filemtime( get_theme_file_path( '/assets/css/school-conversion.css' ) ) )
	);
	if ( false === strpos( $document, 'ecowise-school-conversion-css' ) ) {
		$document = str_replace( '</head>', $stylesheet . '</head>', $document );
	}

	$banner = sprintf(
		'<aside class="ecowise-school-cta" aria-label="%1$s"><div class="ecowise-school-cta__inner"><p><strong>%2$s</strong><span>%3$s</span></p><div class="ecowise-school-cta__actions"><a href="%4$s" data-eco-event="proposal_cta" data-eco-location="%5$s">%6$s</a><a class="ecowise-school-cta__download" href="%7$s" data-eco-event="planning_pack_download" data-eco-location="%5$s">Teacher planning guide (PDF)</a></div></div></aside>',
		esc_attr__( 'Plan a school trip to Italy', 'ecowise' ),
		esc_html__( 'Planning a school trip to Italy?', 'ecowise' ),
		esc_html__( 'Explore a five-day programme, field-science experience and clear planning responsibilities. Take a teacher guide back to your colleagues.', 'ecowise' ),
		esc_url( home_url( '/school-trips-italy/' ) ),
		esc_attr( trim( $route, '/' ) ? trim( $route, '/' ) : 'home' ),
		esc_html__( 'Plan your school trip', 'ecowise' ),
		esc_url( get_theme_file_uri( '/assets/documents/ecowise-italy-teacher-planning-pack.pdf' ) )
	);
	$proof = '';
	if ( in_array( $route, array( '/for-schools/', '/for-schools/residential-field-trips/', '/for-schools/science-ecology-environment-field-trips/', '/for-schools/science-field-work-data-collection-trips/' ), true ) ) {
		$proof = '<section class="ecowise-school-proof" aria-label="Field science programme example"><p>Field science in practice</p><h2>Ten annual science trips with Beau Soleil College</h2><p>EcoWise Italy\'s October 2026 report describes five days of interdisciplinary science, terrestrial and aquatic field sampling, and data collection for DP biology and environmental studies projects.</p><a href="' . esc_url( home_url( '/school-trips-italy/#school-evidence' ) ) . '">Explore the field-science example</a></section>';
	}
	if ( false === strpos( $document, 'ecowise-school-cta' ) ) {
		$document = preg_replace( '/(<(?:footer\b|div\b(?=[^>]*\brole=["\']contentinfo["\'])))/i', $proof . $banner . '$1', $document, 1 );
	}

	return $document;
}
