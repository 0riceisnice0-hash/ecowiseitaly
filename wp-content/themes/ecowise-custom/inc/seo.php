<?php
/**
 * Conservative SEO compatibility helpers for native routes.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

function ecowise_has_seo_plugin() {
	return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'SEOPRESS_VERSION' );
}

function ecowise_seo_profiles() {
	static $profiles = null;
	if ( null !== $profiles ) {
		return $profiles;
	}
	$file     = get_theme_file_path( '/config/seo-metadata.json' );
	$profiles = array();
	if ( is_readable( $file ) ) {
		$decoded = json_decode( file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( is_array( $decoded ) ) {
			$profiles = $decoded;
		}
	}
	return $profiles;
}

function ecowise_current_route_key() {
	$path = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/', PHP_URL_PATH );
	$path = '/' . ltrim( rawurldecode( (string) $path ), '/' );
	return '/' === $path ? '/' : trailingslashit( $path );
}

function ecowise_get_route_seo( $route ) {
	$profiles = ecowise_seo_profiles();
	return isset( $profiles[ $route ] ) && is_array( $profiles[ $route ] ) ? $profiles[ $route ] : array();
}

function ecowise_schema_graph( $profile, $route ) {
	$site_url = 'https://ecowiseitaly.com/';
	$org_id   = $site_url . '#organization';
	$graph    = array(
		array(
			'@type'     => 'Organization',
			'@id'       => $org_id,
			'name'      => 'EcoWise Italy',
			'url'       => $site_url,
			'logo'      => array(
				'@type' => 'ImageObject',
				'url'   => $site_url . 'wp-content/uploads/2024/09/ecowise_italy-removebg-preview.png',
			),
			'email'     => 'adamecorose@gmail.com',
			'telephone' => '+39 342 136 3274',
			'address'   => array(
				'@type'           => 'PostalAddress',
				'streetAddress'   => 'Via Mazzini 97',
				'postalCode'      => '14020',
				'addressLocality' => 'Aramengo',
				'addressRegion'   => 'Asti',
				'addressCountry'  => 'IT',
			),
		),
	);
	$page     = array(
		'@type'       => isset( $profile['schemaType'] ) ? $profile['schemaType'] : 'WebPage',
		'@id'         => $profile['canonical'] . '#webpage',
		'url'         => $profile['canonical'],
		'name'        => $profile['title'],
		'description' => $profile['description'],
		'inLanguage'  => 'it_IT' === $profile['locale'] ? 'it-IT' : 'en-GB',
	);
	if ( 'Service' === $page['@type'] ) {
		$page['provider']    = array( '@id' => $org_id );
		$page['serviceType'] = isset( $profile['serviceType'] ) ? $profile['serviceType'] : 'Outdoor education';
		$page['areaServed']  = array(
			array( '@type' => 'Country', 'name' => 'Italy' ),
			array( '@type' => 'AdministrativeArea', 'name' => 'Piemonte' ),
		);
	}
	if ( 'WebSite' === $page['@type'] ) {
		$page['publisher'] = array( '@id' => $org_id );
	}
	if ( 'ContactPage' === $page['@type'] ) {
		$page['about'] = array( '@id' => $org_id );
	}
	$graph[] = $page;
	return array( '@context' => 'https://schema.org', '@graph' => $graph );
}

function ecowise_metadata_markup( $profile, $route ) {
	$image  = 'https://ecowiseitaly.com/wp-content/themes/ecowise-custom/assets/images/homepage/river-fieldwork.jpeg';
	$locale = isset( $profile['locale'] ) ? $profile['locale'] : 'en_GB';
	$schema = ecowise_schema_graph( $profile, $route );
	return sprintf(
		"\n<!-- EcoWise Italy SEO foundation -->\n<meta name=\"description\" content=\"%1\$s\">\n<meta property=\"og:title\" content=\"%2\$s\">\n<meta property=\"og:description\" content=\"%1\$s\">\n<meta property=\"og:url\" content=\"%3\$s\">\n<meta property=\"og:type\" content=\"website\">\n<meta property=\"og:site_name\" content=\"EcoWise Italy\">\n<meta property=\"og:locale\" content=\"%4\$s\">\n<meta property=\"og:image\" content=\"%5\$s\">\n<meta property=\"og:image:width\" content=\"1200\">\n<meta property=\"og:image:height\" content=\"900\">\n<meta name=\"twitter:card\" content=\"summary_large_image\">\n<meta name=\"twitter:title\" content=\"%2\$s\">\n<meta name=\"twitter:description\" content=\"%1\$s\">\n<meta name=\"twitter:image\" content=\"%5\$s\">\n<script id=\"ecowise-schema\" type=\"application/ld+json\">%6\$s</script>\n",
		esc_attr( $profile['description'] ),
		esc_attr( $profile['title'] ),
		esc_url( $profile['canonical'] ),
		esc_attr( $locale ),
		esc_url( $image ),
		wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE )
	);
}

function ecowise_enhance_snapshot_metadata( $document, $route ) {
	if ( ecowise_has_seo_plugin() ) {
		return $document;
	}
	$profile = ecowise_get_route_seo( $route );
	if ( empty( $profile ) ) {
		return $document;
	}
	$document = preg_replace( '/<title\b[^>]*>[\s\S]*?<\/title>/i', '<title>' . esc_html( $profile['title'] ) . '</title>', $document, 1 );
	if ( 'it_IT' === $profile['locale'] ) {
		$document = preg_replace( '/<html\b([^>]*)\blang=(["\'])[^"\']*\2/i', '<html$1lang="it-IT"', $document, 1 );
	}
	if ( false === strpos( $document, 'id="ecowise-schema"' ) ) {
		$document = str_replace( '</head>', ecowise_metadata_markup( $profile, $route ) . '</head>', $document );
	}
	return $document;
}

function ecowise_native_document_title( $title ) {
	if ( ecowise_has_seo_plugin() ) {
		return $title;
	}
	$profile = ecowise_get_route_seo( ecowise_current_route_key() );
	return empty( $profile['title'] ) ? $title : $profile['title'];
}
add_filter( 'pre_get_document_title', 'ecowise_native_document_title' );

function ecowise_native_social_metadata() {
	if ( ecowise_has_seo_plugin() ) {
		return;
	}
	$route   = ecowise_current_route_key();
	$profile = ecowise_get_route_seo( $route );
	if ( $profile ) {
		echo ecowise_metadata_markup( $profile, $route ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
}
add_action( 'wp_head', 'ecowise_native_social_metadata', 2 );

function ecowise_native_canonical() {
	if ( ecowise_has_seo_plugin() || is_404() || is_search() || is_paged() ) {
		return;
	}

	$profile = ecowise_get_route_seo( ecowise_current_route_key() );
	$url     = ! empty( $profile['canonical'] ) ? $profile['canonical'] : '';
	if ( ! $url && is_singular() ) {
		$url = get_permalink();
	} elseif ( ! $url && is_home() ) {
		$posts_page = (int) get_option( 'page_for_posts' );
		$url        = $posts_page ? get_permalink( $posts_page ) : home_url( '/' );
	} elseif ( ! $url && is_day() ) {
		$url = get_day_link( (int) get_query_var( 'year' ), (int) get_query_var( 'monthnum' ), (int) get_query_var( 'day' ) );
	} elseif ( ! $url && is_month() ) {
		$url = get_month_link( (int) get_query_var( 'year' ), (int) get_query_var( 'monthnum' ) );
	} elseif ( ! $url && is_year() ) {
		$url = get_year_link( (int) get_query_var( 'year' ) );
	} elseif ( ! $url && ( is_category() || is_tag() || is_tax() ) ) {
		$url = get_term_link( get_queried_object() );
	} elseif ( ! $url && is_author() ) {
		$url = get_author_posts_url( (int) get_queried_object_id() );
	} elseif ( ! $url && is_post_type_archive() ) {
		$url = get_post_type_archive_link( get_query_var( 'post_type' ) );
	}

	if ( $url && ! is_wp_error( $url ) ) {
		printf( "\n<link rel=\"canonical\" href=\"%s\">\n", esc_url( $url ) );
	}
}
add_action( 'wp_head', 'ecowise_native_canonical', 1 );

function ecowise_legacy_canonical_redirects() {
	if ( is_admin() || wp_doing_ajax() ) {
		return;
	}

	$path = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/', PHP_URL_PATH );
	if ( '/home/' === trailingslashit( (string) $path ) ) {
		wp_safe_redirect( home_url( '/' ), 301, 'Ecowise Custom' );
		exit;
	}

	if ( '/sitemap.xml' === untrailingslashit( (string) $path ) ) {
		wp_safe_redirect( home_url( '/wp-sitemap.xml' ), 301, 'Ecowise Custom' );
		exit;
	}
}
add_action( 'template_redirect', 'ecowise_legacy_canonical_redirects', -10 );
