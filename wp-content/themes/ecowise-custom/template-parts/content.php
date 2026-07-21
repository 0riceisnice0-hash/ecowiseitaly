<?php
/**
 * Card in a native archive.
 *
 * @package Ecowise
 */
?>
<article <?php post_class( 'post-card' ); ?>>
	<a class="post-card__media" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true">
		<?php if ( has_post_thumbnail() ) : the_post_thumbnail( 'large' ); endif; ?>
	</a>
	<div class="post-card__body">
		<p class="eyebrow"><?php ecowise_posted_on(); ?></p>
		<h2 class="post-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
		<?php the_excerpt(); ?>
	</div>
</article>

