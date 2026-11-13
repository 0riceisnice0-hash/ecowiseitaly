<?php
/**
 * Conversion links from preserved school pages to the native school funnel.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

function ecowise_growth_resource_template( $template ) {
	if ( is_page( array( 'planning-a-school-trip-to-italy', 'school-travel-partners' ) ) ) { return get_theme_file_path( '/page-growth-resource.php' ); }
	return $template;
}
add_filter( 'template_include', 'ecowise_growth_resource_template' );

function ecowise_search_content( $route ) {
	$file = get_theme_file_path( '/config/search-content.json' );
	$all = is_readable( $file ) ? json_decode( file_get_contents( $file ), true ) : array();
	if ( empty( $all[ $route ] ) ) { return ''; }
	$item = $all[ $route ];
	$html = '<section class="ecowise-search-content" aria-label="School programme planning"><h2>' . esc_html( $item['heading'] ) . '</h2><p>' . esc_html( $item['intro'] ) . '</p><div class="ecowise-search-content__grid">';
	foreach ( $item['sections'] as $section ) {
		$html .= '<div><h3>' . esc_html( $section['heading'] ) . '</h3><p>' . esc_html( $section['text'] ) . '</p></div>';
	}
	$html .= '</div><nav aria-label="Related school programmes"><ul>';
	foreach ( $item['links'] as $link ) {
		$html .= '<li><a href="' . esc_url( home_url( $link['url'] ) ) . '">' . esc_html( $link['label'] ) . '</a></li>';
	}
	$html .= '<li><a href="' . esc_url( home_url( '/planning-a-school-trip-to-italy/' ) ) . '">Teacher checklist: planning a school trip to Italy</a></li><li><a href="' . esc_url( home_url( '/school-travel-partners/' ) ) . '">School-travel operator partnerships</a></li>';
	return $html . '</ul></nav></section>';
}

function ecowise_school_conversion_routes() {
	return array(
		'/for-schools/',
		'/for-schools/day-programs/',
		'/for-schools/residential-field-trips/',
		'/for-schools/science-ecology-environment-field-trips/',
		'/for-schools/science-field-work-data-collection-trips/',
		'/for-schools/outdoor-service-education-projects/',
		'/for-schools/storytelling-drama-experiences-in-nature/',
		'/for-schools/team-building-wild-rites-of-passage/',
		'/for-schools/mindfulness-and-nature-awareness-workshops/',
		'/for-schools/wilderness-encounter-groups-ecoliteracy-camps/',
	);
}

function ecowise_enhance_school_snapshot( $document, $route ) {
	if ( ! in_array( $route, ecowise_school_conversion_routes(), true ) ) {
		return ecowise_enhance_customer_snapshot( $document, $route );
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
		$document = preg_replace( '/(<(?:footer\b|div\b(?=[^>]*\brole=["\']contentinfo["\'])))/i', ecowise_search_content( $route ) . $proof . $banner . '$1', $document, 1 );
	}

	return $document;
}

function ecowise_enhance_customer_snapshot( $document, $route ) {
	$offers = array(
		'/family-ecoadventures/' => array( 'Plan time outdoors for your family', 'Tell Adam your children\'s ages, interests and preferred season. Explore an eco-adventure shaped around your family, with dates and a bespoke quote confirmed individually.', 'family', 'Discuss a family eco-adventure' ),
		'/gateways/' => array( 'Find your EcoWise Italy getaway', 'Explore a family eco-adventure or an outdoor experience for your group. Start with your interests and let Adam discuss the possibilities with you.', 'family', 'Talk to Adam about a getaway' ),
		'/corporate-team-building-vacation/' => array( 'Bring your team into the landscape', 'Share your group size, aims and preferred dates. Adam can discuss a tailored outdoor team-building experience in Piemonte and prepare a bespoke proposal.', 'corporate', 'Discuss your team-building plans' ),
		'/what-is-ecowise/' => array( 'Turn an idea into an outdoor learning experience', 'Explore the school programmes, teacher planning checklist and practical arrangements, then tell Adam what you have in mind.', 'school', 'Explore school-trip planning' ),
		'/what-they-say-about-us/' => array( 'Explore an experience for your school', 'See programme options, a five-day example and the teacher planning guide. Adam shapes each proposal around the group\'s learning aims.', 'school', 'Plan your school trip' ),
		'/news/' => array( 'Bring these learning experiences to your school', 'Explore the field-science example, five-day programme and teacher planning resources, then start a conversation with Adam.', 'school', 'Explore the school programme' ),
	);
	if ( empty( $offers[ $route ] ) || str_contains( $document, 'ecowise-customer-cta' ) ) { return $document; }
	$item = $offers[ $route ];
	$target = 'school' === $item[2] ? home_url( '/school-trips-italy/' ) : add_query_arg( 'interest', $item[2], home_url( '/contact-us/' ) );
	$html = '<aside class="ecowise-school-cta ecowise-customer-cta" aria-label="Plan your experience"><div class="ecowise-school-cta__inner"><p><strong>' . esc_html( $item[0] ) . '</strong><span>' . esc_html( $item[1] ) . '</span></p><div class="ecowise-school-cta__actions"><a href="' . esc_url( $target ) . '" data-eco-event="proposal_cta" data-eco-location="' . esc_attr( trim( $route, '/' ) ) . '">' . esc_html( $item[3] ) . '</a><a class="ecowise-school-cta__download" href="https://wa.me/393421363274" data-eco-event="contact_click" data-eco-channel="whatsapp">Or WhatsApp Adam</a></div></div></aside>';
	$css = '<link rel="stylesheet" href="' . esc_url( get_theme_file_uri( '/assets/css/school-conversion.css' ) . '?ver=' . wp_get_theme()->get( 'Version' ) ) . '">';
	$document = str_replace( '</head>', $css . '</head>', $document );
	return preg_replace( '/(<(?:footer\b|div\b(?=[^>]*\brole=["\']contentinfo["\'])))/i', $html . '$1', $document, 1 );
}
