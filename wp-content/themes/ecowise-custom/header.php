<?php
/**
 * Native page header.
 *
 * @package Ecowise
 */
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main"><?php esc_html_e( 'Skip to content', 'ecowise' ); ?></a>
<header class="site-header" data-site-header>
	<div class="site-header__inner shell">
		<div class="site-brand"><?php ecowise_site_logo(); ?></div>
		<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu" data-nav-toggle>
			<span class="nav-toggle__label"><?php esc_html_e( 'Menu', 'ecowise' ); ?></span>
			<span aria-hidden="true">☰</span>
		</button>
		<nav class="primary-nav" aria-label="<?php esc_attr_e( 'Primary navigation', 'ecowise' ); ?>" data-primary-nav>
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'menu_id'        => 'primary-menu',
					'container'      => false,
					'fallback_cb'    => false,
				)
			);
			?>
		</nav>
	</div>
</header>

