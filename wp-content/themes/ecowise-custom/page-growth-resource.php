<?php
/** Useful, code-owned acquisition resources in the established site shell. */
defined( 'ABSPATH' ) || exit;
$route = ecowise_current_route_key();
$resources = json_decode( file_get_contents( get_theme_file_path( '/config/growth-resources.json' ) ), true );
$resource = $resources[ $route ] ?? null;
if ( ! $resource ) { get_header(); get_template_part( 'template-parts/content', 'none' ); get_footer(); return; }
ob_start();
?>
<main id="content" class="eco-school-page eco-resource-page" role="main" tabindex="-1">
  <section class="eco-resource-hero"><div class="eco-school-wrap">
    <p class="eco-resource-eyebrow"><?php echo esc_html( $resource['eyebrow'] ); ?></p>
    <h1><?php echo esc_html( $resource['heading'] ); ?></h1>
    <p><?php echo esc_html( $resource['intro'] ); ?></p>
    <a class="eco-school-button eco-school-button--yellow" href="<?php echo esc_url( str_starts_with( $resource['ctaUrl'], '/' ) ? home_url( $resource['ctaUrl'] ) : $resource['ctaUrl'] ); ?>" data-eco-event="proposal_cta"><?php echo esc_html( $resource['ctaLabel'] ); ?></a>
  </div></section>
  <div class="eco-school-wrap eco-resource-body">
    <nav aria-label="Breadcrumb"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a> / <a href="<?php echo esc_url( home_url( '/for-schools/' ) ); ?>">For schools</a> / <?php echo esc_html( $resource['heading'] ); ?></nav>
    <div class="eco-resource-layout"><article>
      <?php foreach ( $resource['sections'] as $section ) : ?>
        <section><h2><?php echo esc_html( $section['heading'] ); ?></h2>
        <?php foreach ( $section['paragraphs'] as $paragraph ) : ?><p><?php echo esc_html( $paragraph ); ?></p><?php endforeach; ?>
        </section>
      <?php endforeach; ?>
    </article><aside class="eco-resource-sidebar" aria-label="Planning resources">
      <img src="<?php echo esc_url( get_theme_file_uri( $resource['image'] ) ); ?>" alt="<?php echo esc_attr( $resource['imageAlt'] ); ?>" width="1200" height="900" loading="lazy">
      <h2>Take the next step</h2><p>Useful programme details, learning experiences and practical arrangements for your colleagues.</p>
      <a href="<?php echo esc_url( home_url( '/school-trips-italy/#teacher-resources' ) ); ?>">Download the planning resources</a>
      <h2>Explore the programme</h2><ul><?php foreach ( $resource['links'] as $link ) : ?><li><a href="<?php echo esc_url( home_url( $link['url'] ) ); ?>"><?php echo esc_html( $link['label'] ); ?></a></li><?php endforeach; ?></ul>
      <p>Programme planning with Adam Rose, EcoWise Italy. <a href="<?php echo esc_url( home_url( '/what-is-ecowise/' ) ); ?>">About EcoWise Italy</a>.</p>
    </aside></div>
    <section class="eco-resource-final"><h2><?php echo esc_html( $resource['ctaHeading'] ); ?></h2><p><?php echo esc_html( $resource['ctaText'] ); ?></p><a class="eco-school-button eco-school-button--yellow" href="<?php echo esc_url( str_starts_with( $resource['ctaUrl'], '/' ) ? home_url( $resource['ctaUrl'] ) : $resource['ctaUrl'] ); ?>" data-eco-event="proposal_cta"><?php echo esc_html( $resource['ctaLabel'] ); ?></a></section>
  </div>
</main>
<?php
$content = ob_get_clean();
$shell = file_get_contents( get_theme_file_path( '/snapshots/html/for-schools/index.html' ) );
$start = strpos( $shell, '<div id="content"' );
$end = strpos( $shell, '<div role="contentinfo"' );
if ( false === $start || false === $end || $end <= $start ) { get_header(); echo $content; get_footer(); return; }
$document = substr( $shell, 0, $start ) . $content . substr( $shell, $end );
$document = preg_replace( '/<link\b[^>]*\brel=(["\'])canonical\1[^>]*>/i', '<link rel="canonical" href="' . esc_url( 'https://ecowiseitaly.com' . $route ) . '">', $document, 1 );
$document = ecowise_enhance_snapshot_metadata( $document, $route );
$styles = '<link id="ecowise-school-funnel-css" rel="stylesheet" href="' . esc_url( get_theme_file_uri( '/assets/css/school-funnel.css' ) . '?ver=' . wp_get_theme()->get( 'Version' ) ) . '"><link rel="stylesheet" href="' . esc_url( get_theme_file_uri( '/assets/css/growth-resources.css' ) . '?ver=' . wp_get_theme()->get( 'Version' ) ) . '">';
$document = str_replace( '</head>', $styles . '</head>', $document );
$script = '<script defer src="' . esc_url( get_theme_file_uri( '/assets/js/site.js' ) . '?ver=' . wp_get_theme()->get( 'Version' ) ) . '"></script>';
$document = str_replace( '</body>', $script . ecowise_acquisition_markup() . '</body>', $document );
echo ecowise_rewrite_snapshot_links( ecowise_rewrite_theme_asset_urls( $document ) );
