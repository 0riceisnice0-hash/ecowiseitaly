<?php
/**
 * Native single post template.
 *
 * @package Ecowise
 */

get_header();
?>
<main id="main" class="site-main site-main--singular">
	<?php
	while ( have_posts() ) :
		the_post();
		?>
		<article <?php post_class( 'entry shell shell--article' ); ?>>
			<header class="entry-header">
				<p class="eyebrow"><?php ecowise_posted_on(); ?></p>
				<h1><?php the_title(); ?></h1>
			</header>
			<?php if ( has_post_thumbnail() ) : ?><figure class="entry-hero"><?php the_post_thumbnail( 'full' ); ?></figure><?php endif; ?>
			<div class="entry-content"><?php the_content(); ?></div>
		</article>
		<?php the_post_navigation(); ?>
	<?php endwhile; ?>
</main>
<?php
get_footer();

