<?php
/**
 * Native page footer.
 *
 * @package Ecowise
 */
?>
<footer class="site-footer">
	<div class="site-footer__inner shell">
		<div>
			<div class="site-footer__brand"><?php ecowise_site_logo(); ?></div>
			<p><?php esc_html_e( 'Bringing nature to learning, bringing learning to life.', 'ecowise' ); ?></p>
		</div>
		<nav aria-label="<?php esc_attr_e( 'Footer navigation', 'ecowise' ); ?>">
			<?php wp_nav_menu( array( 'theme_location' => 'footer', 'container' => false, 'fallback_cb' => false ) ); ?>
		</nav>
		<address>
			<a href="tel:+393421363274">+39 342 136 3274</a><br>
			<a href="mailto:adamecorose@gmail.com">adamecorose@gmail.com</a>
		</address>
	</div>
	<div class="site-footer__legal shell">&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> EcoWise Italy</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
