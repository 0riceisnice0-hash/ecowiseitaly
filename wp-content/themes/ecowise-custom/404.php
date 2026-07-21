<?php
/**
 * Not-found template.
 *
 * @package Ecowise
 */

get_header();
?>
<main id="main" class="site-main shell shell--article error-page">
	<p class="eyebrow"><?php esc_html_e( '404', 'ecowise' ); ?></p>
	<h1><?php esc_html_e( 'This trail ends here.', 'ecowise' ); ?></h1>
	<p><?php esc_html_e( 'The page may have moved. Search the site or return to the homepage.', 'ecowise' ); ?></p>
	<?php get_search_form(); ?>
	<p><a class="button" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Back to home', 'ecowise' ); ?></a></p>
</main>
<?php
get_footer();

