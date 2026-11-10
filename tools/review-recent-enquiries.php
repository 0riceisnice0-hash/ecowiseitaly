<?php
/** Read-only private enquiry review; never place its output in the public repository. */
$posts = get_posts( array( 'post_type' => 'ecowise_enquiry', 'post_status' => 'private', 'numberposts' => 30, 'date_query' => array( array( 'after' => '2026-10-19', 'inclusive' => true ) ), 'orderby' => 'date', 'order' => 'ASC' ) );
foreach ( $posts as $post ) {
    echo wp_json_encode( array( 'id' => $post->ID, 'date' => $post->post_date, 'type' => get_post_meta( $post->ID, '_ecowise_enquiry_type', true ), 'delivery' => get_post_meta( $post->ID, '_ecowise_email_delivery', true ), 'content' => mb_substr( $post->post_content, 0, 2400 ) ), JSON_UNESCAPED_SLASHES ) . "\n";
}
