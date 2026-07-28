<?php
/**
 * Code-owned school-trip acquisition page inside the captured site shell.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

$enquiry_status = isset( $_GET['school_enquiry'] ) ? sanitize_key( wp_unslash( $_GET['school_enquiry'] ) ) : '';
$status_messages = array(
	'success'    => array( 'success', __( 'Thank you — your school-trip enquiry has been received. Adam will reply within 24 hours.', 'ecowise' ) ),
	'saved'      => array( 'notice', __( 'Your enquiry is safely recorded, but the email notification was delayed. Adam can still see it; for an urgent reply, call or WhatsApp him.', 'ecowise' ) ),
	'incomplete' => array( 'error', __( 'Please complete every required field and confirm the data-use notice.', 'ecowise' ) ),
	'expired'    => array( 'error', __( 'The form expired. Refresh the page and try again.', 'ecowise' ) ),
	'rate'       => array( 'error', __( 'Too many enquiries were submitted. Please wait 15 minutes or contact Adam directly.', 'ecowise' ) ),
	'error'      => array( 'error', __( 'The enquiry could not be recorded. Please email or WhatsApp Adam directly.', 'ecowise' ) ),
);
$query_value = static function ( $key ) {
	return isset( $_GET[ $key ] ) ? sanitize_text_field( wp_unslash( $_GET[ $key ] ) ) : '';
};

ob_start();
?>
<main id="content" class="eco-school-page" role="main" tabindex="-1">
	<section class="eco-school-hero">
		<div class="eco-school-hero__shade"></div>
		<div class="eco-school-wrap eco-school-hero__content">
			<p class="eco-school-eyebrow">For UK and international schools</p>
			<h1>School Trips to Italy</h1>
			<p>Tailored outdoor education, ecology and residential experiences in the landscapes of Piemonte.</p>
			<div class="eco-school-actions">
				<a class="eco-school-button eco-school-button--yellow" href="#school-enquiry" data-eco-event="proposal_cta" data-eco-location="hero">Plan your school trip</a>
				<a class="eco-school-button eco-school-button--outline" href="#school-programmes" data-eco-event="programme_explore" data-eco-location="hero">Explore the experience</a>
			</div>
		</div>
		<div class="eco-school-hero__shape" aria-hidden="true">
			<svg preserveAspectRatio="none" viewBox="0 0 1000 100" xmlns="http://www.w3.org/2000/svg"><path d="M761.9,44.1L643.1,27.2L333.8,98L0,3.8V100H1000V3.9Z"></path></svg>
		</div>
	</section>

	<section class="eco-school-intro eco-school-map">
		<div class="eco-school-wrap eco-school-intro__grid">
			<div class="eco-school-collage" aria-label="EcoWise Italy school experiences">
				<img src="/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-22-at-11.13.48-PM.jpeg" alt="Pupils exploring a river with EcoWise Italy">
				<img src="/wp-content/uploads/2024/11/ecowisely-tour-9.jpg" alt="A pupil taking part in outdoor fieldwork">
				<img src="/wp-content/uploads/2024/11/ecowisely-tour-10.jpg" alt="Outdoor learning activity in Piemonte">
				<img src="/wp-content/uploads/2024/11/ecowisely-tour-1.jpg" alt="Pupils learning together outdoors">
			</div>
			<div class="eco-school-intro__copy">
				<p class="eco-school-eyebrow eco-school-eyebrow--red">Bringing learning to life</p>
				<h2>An exceptional experience, built around your school</h2>
				<p>EcoWise Italy creates personal, hands-on school trips that connect classroom learning with real landscapes, ecosystems and challenges.</p>
				<p>Based in north-west Italy, we work with schools to shape a programme around their pupils, learning goals and preferred style of adventure — from focused fieldwork to a multi-day residential experience.</p>
				<ul class="eco-school-ticks">
					<li>Typical class groups of 20–30 pupils</li>
					<li>Groups of approximately 15–80 considered</li>
					<li>Day visits, 3-day residentials and longer programmes</li>
					<li>Personal reply from Adam within 24 hours</li>
				</ul>
			</div>
		</div>
	</section>

	<section id="school-programmes" class="eco-school-section">
		<div class="eco-school-wrap">
			<div class="eco-school-heading">
				<p class="eco-school-eyebrow eco-school-eyebrow--green">Choose your direction</p>
				<h2>Learning experiences with purpose</h2>
				<p>Start with a programme area, then Adam will adapt the content, pace and challenge to your group.</p>
			</div>
			<div class="eco-school-programmes">
				<article class="eco-school-programme">
					<img src="/wp-content/uploads/2024/11/Ecowise-Italy-211.jpg" alt="Students taking part in river fieldwork">
					<div><h3>Science, ecology and fieldwork</h3><p>Investigate habitats, biodiversity and environmental processes through observation, practical enquiry and data collection.</p><a href="<?php echo esc_url( home_url( '/for-schools/science-ecology-environment-field-trips/' ) ); ?>">Explore science and ecology trips</a></div>
				</article>
				<article class="eco-school-programme">
					<img src="/wp-content/uploads/2024/11/mindfulll.jpg" alt="Students connecting with nature during an EcoWise Italy programme">
					<div><h3>Residential outdoor learning</h3><p>Give pupils time to grow in confidence, independence and connection through a shared experience away from school.</p><a href="<?php echo esc_url( home_url( '/for-schools/residential-field-trips/' ) ); ?>">Explore residential trips</a></div>
				</article>
				<article class="eco-school-programme">
					<img src="/wp-content/uploads/2024/11/Ecowise-Italy-254.jpg" alt="A group working together during an outdoor activity">
					<div><h3>Service, teamwork and wellbeing</h3><p>Combine meaningful environmental action with collaboration, creativity, reflection and memorable group challenges.</p><a href="<?php echo esc_url( home_url( '/for-schools/outdoor-service-education-projects/' ) ); ?>">Explore service learning</a></div>
				</article>
			</div>
		</div>
	</section>

	<section class="eco-school-section eco-school-section--yellow">
		<div class="eco-school-wrap">
			<div class="eco-school-heading">
				<p class="eco-school-eyebrow eco-school-eyebrow--red">A flexible starting point</p>
				<h2>What could a three-day trip look like?</h2>
				<p>This is an example journey. Your final programme is designed around your pupils, objectives, season and chosen location.</p>
			</div>
			<div class="eco-school-days">
				<article><span>Day 1</span><h3>Arrive and connect</h3><p>Meet the landscape, settle into the group and begin with a guided ecological exploration.</p></article>
				<article><span>Day 2</span><h3>Explore and investigate</h3><p>A full day of practical fieldwork, conservation or curriculum-linked challenges, with time to reflect together.</p></article>
				<article><span>Day 3</span><h3>Make meaning</h3><p>Bring observations together, share discoveries and connect the experience back to learning at school.</p></article>
			</div>
		</div>
	</section>

	<section id="school-planning" class="eco-school-section">
		<div class="eco-school-wrap eco-school-story">
			<div class="eco-school-story__image">
				<img src="/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-23-at-1.08.39-AM.jpeg" alt="A school group enjoying the mountains of Piemonte">
			</div>
			<div class="eco-school-story__copy">
				<p class="eco-school-eyebrow eco-school-eyebrow--green">Easy to begin</p>
				<h2>From first conversation to a trip shaped around you</h2>
				<div class="eco-school-planning">
					<div><span>1</span><p><strong>Tell us about your school.</strong> Share your group, possible dates and what you want pupils to gain.</p></div>
					<div><span>2</span><p><strong>Adam explores the possibilities.</strong> He checks the fit, discusses ideas and replies personally within 24 hours.</p></div>
					<div><span>3</span><p><strong>Your programme takes shape.</strong> EcoWise Italy develops the activities, locations and programme quote with you.</p></div>
					<div><span>4</span><p><strong>We help bring the details together.</strong> Adam supports local coordination while your school retains control of travel and final approvals.</p></div>
				</div>
			</div>
		</div>
	</section>

	<section id="school-responsibilities" class="eco-school-section eco-school-map">
		<div class="eco-school-wrap">
			<div class="eco-school-heading">
				<p class="eco-school-eyebrow eco-school-eyebrow--red">Clear and straightforward</p>
				<h2>Who organises what?</h2>
				<p>You will always know who is responsible for each part of the trip.</p>
			</div>
			<div class="eco-school-responsibilities">
				<article>
					<h3>EcoWise Italy</h3>
					<ul>
						<li>Designs and delivers your educational programme</li>
						<li>Provides the programme proposal and quote</li>
						<li>Manages its activities, risk assessment and safeguarding</li>
						<li>Helps you identify and coordinate suitable local accommodation</li>
					</ul>
				</article>
				<article>
					<h3>Your school</h3>
					<ul>
						<li>Chooses the final programme and approves the trip</li>
						<li>Arranges and contracts travel</li>
						<li>Maintains the school’s supervision and insurance arrangements</li>
						<li>Confirms accommodation and food with the relevant provider</li>
					</ul>
				</article>
			</div>
			<p class="eco-school-plain-note">Programme, accommodation/food and travel are arranged as separate elements. Adam helps make the process practical and joined-up, while each provider remains responsible for the service it supplies.</p>
		</div>
	</section>

	<section class="eco-school-season">
		<div class="eco-school-wrap eco-school-season__grid">
			<div>
				<p class="eco-school-eyebrow">More space to explore</p>
				<h2>Consider November to March</h2>
				<p>These quieter months often offer more flexibility for schools. Tell Adam the period you are considering and he will check the live calendar and suitable programme options.</p>
			</div>
			<a class="eco-school-button eco-school-button--yellow" href="#school-enquiry" data-eco-event="winter_cta" data-eco-location="season">Ask about your dates</a>
		</div>
	</section>

	<section class="eco-school-section eco-school-testimonials">
		<div class="eco-school-wrap">
			<div class="eco-school-heading">
				<p class="eco-school-eyebrow eco-school-eyebrow--green">What educators say</p>
				<h2>Personal programmes. Lasting relationships.</h2>
			</div>
			<div class="eco-school-quotes">
				<blockquote>
					<p>“Adam and Yenka have always invested a lot of time and effort in creating tailor-made programs which support and enhance our school curriculum.”</p>
					<cite>Laura Haines, Inclusive Learning Coordinator, International School of Milan</cite>
				</blockquote>
				<blockquote>
					<p>“They skillfully support our students in fostering connections with nature while also helping our teachers draw meaningful curricular links.”</p>
					<cite>Victoria Corkhill, Primary Principal &amp; PYP Coordinator, WINS Turin</cite>
				</blockquote>
			</div>
			<p class="eco-school-centre"><a class="eco-school-text-link" href="<?php echo esc_url( home_url( '/what-they-say-about-us/' ) ); ?>">Read more feedback from educators</a></p>
		</div>
	</section>

	<section class="eco-school-section eco-school-section--soft">
		<div class="eco-school-wrap eco-school-faq">
			<div class="eco-school-heading">
				<p class="eco-school-eyebrow eco-school-eyebrow--red">Practical questions</p>
				<h2>Before you enquire</h2>
			</div>
			<details><summary>What group sizes work?</summary><p>Groups of approximately 15–80 can be considered, with a single class of around 20–30 pupils being typical. The final fit depends on ages, programme, location and staffing.</p></details>
			<details><summary>Can the trip connect to our curriculum?</summary><p>Yes. Programmes can be shaped around science, ecology, fieldwork, interdisciplinary learning and wider group objectives. Tell Adam the outcomes you need and he will discuss what is feasible.</p></details>
			<details><summary>Do you offer day and residential trips?</summary><p>Yes. A common residential format is three days and two nights, while day programmes and longer tailored trips can also be discussed.</p></details>
			<details><summary>How is pricing worked out?</summary><p>Every programme receives a bespoke per-person quote based on the group size, duration, activities and location.</p></details>
			<details><summary>Who arranges travel and accommodation?</summary><p>Your school arranges travel. Adam can help identify and coordinate suitable accommodation, with programme, accommodation/food and travel arranged separately.</p></details>
		</div>
	</section>

	<section id="school-enquiry" class="eco-school-section eco-school-enquiry">
		<div class="eco-school-wrap eco-school-enquiry__grid">
			<div class="eco-school-enquiry__intro">
				<p class="eco-school-eyebrow">Start a conversation</p>
				<h2>Tell Adam what your school is looking for</h2>
				<p>You do not need to have everything decided. Share the essentials and Adam will reply personally within 24 hours.</p>
				<div class="eco-school-direct">
					<a href="mailto:adamecorose@gmail.com" data-eco-event="contact_click" data-eco-channel="email">adamecorose@gmail.com</a>
					<a href="tel:+393421363274" data-eco-event="contact_click" data-eco-channel="phone">+39 342 136 3274</a>
					<a href="https://wa.me/393421363274" data-eco-event="contact_click" data-eco-channel="whatsapp">WhatsApp Adam</a>
				</div>
			</div>
			<div class="eco-school-form-card">
				<?php if ( isset( $status_messages[ $enquiry_status ] ) ) : ?>
					<div class="eco-school-form-status eco-school-form-status--<?php echo esc_attr( $status_messages[ $enquiry_status ][0] ); ?>" role="<?php echo 'error' === $status_messages[ $enquiry_status ][0] ? 'alert' : 'status'; ?>">
						<?php echo esc_html( $status_messages[ $enquiry_status ][1] ); ?>
					</div>
				<?php endif; ?>
				<form action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post" data-school-enquiry>
					<input type="hidden" name="action" value="ecowise_school_enquiry">
					<?php wp_nonce_field( 'ecowise_school_enquiry', 'ecowise_school_nonce' ); ?>
					<input type="hidden" name="source_page" value="<?php echo esc_url( home_url( '/school-trips-italy/' ) ); ?>">
					<input type="hidden" name="referrer" value="<?php echo esc_url( wp_get_referer() ); ?>">
					<?php foreach ( array( 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term' ) as $utm_key ) : ?>
						<input type="hidden" name="<?php echo esc_attr( $utm_key ); ?>" value="<?php echo esc_attr( $query_value( $utm_key ) ); ?>">
					<?php endforeach; ?>
					<div class="eco-school-honeypot" aria-hidden="true"><label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>

					<div class="eco-school-field-grid">
						<label>School name <span>*</span><input type="text" name="school_name" required autocomplete="organization"></label>
						<label>Country <span>*</span><input type="text" name="country" required autocomplete="country-name"></label>
						<label>Your name <span>*</span><input type="text" name="contact_name" required autocomplete="name"></label>
						<label>Your role <span>*</span><input type="text" name="role" required autocomplete="organization-title"></label>
						<label>Email <span>*</span><input type="email" name="email" required autocomplete="email"></label>
						<label>Phone / WhatsApp<input type="tel" name="phone" autocomplete="tel"></label>
						<label>Pupil ages or year groups <span>*</span><input type="text" name="pupil_ages" required placeholder="e.g. Year 6, ages 10–11"></label>
						<label>Estimated pupils <span>*</span><input type="number" name="students" required min="1" max="200" inputmode="numeric"></label>
						<label>Preferred dates or season <span>*</span><input type="text" name="preferred_dates" required placeholder="Exact dates or a flexible period"></label>
						<label>Trip format <span>*</span><select name="trip_format" required><option value="">Please choose</option><option>Day programme</option><option>Residential trip</option><option>Not sure yet</option></select></label>
					</div>
					<label>Learning priorities or outcomes <span>*</span><textarea name="objectives" required rows="4" placeholder="Curriculum links, ecology, fieldwork, service learning, teamwork…"></textarea></label>
					<details class="eco-school-form-more">
						<summary>Add more planning detail <span>(optional)</span></summary>
						<div class="eco-school-field-grid">
							<label>Estimated accompanying adults<input type="number" name="adults" min="0" max="50" inputmode="numeric"></label>
							<label>Date flexibility<select name="date_flexibility"><option value="">Please choose</option><option>Exact dates required</option><option>Flexible by a few days</option><option>Flexible within the term</option><option>Open to November–March</option></select></label>
							<label>Preferred duration<input type="text" name="duration" placeholder="e.g. 3 days / 2 nights"></label>
						</div>
						<label>Access or dietary planning notes<textarea name="requirements" rows="3" placeholder="Please do not include pupil names or medical information."></textarea></label>
						<label>Anything else Adam should know<textarea name="message" rows="3"></textarea></label>
					</details>
					<label class="eco-school-consent"><input type="checkbox" name="privacy_consent" value="1" required><span>EcoWise Italy may use these details to respond to this enquiry and keep a private enquiry record. I have not included pupil names or sensitive personal information. <strong>*</strong></span></label>
					<button class="eco-school-button eco-school-button--red" type="submit" data-eco-event="proposal_submit">Send my school-trip enquiry</button>
					<p class="eco-school-form-note">This form starts a conversation; it does not create a booking.</p>
				</form>
			</div>
		</div>
	</section>
</main>
<?php
$page_content = ob_get_clean();
$shell_file   = get_theme_file_path( '/snapshots/html/for-schools/index.html' );

if ( is_readable( $shell_file ) ) {
	$document = file_get_contents( $shell_file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$start    = strpos( $document, '<div id="content"' );
	$end      = strpos( $document, '<div role="contentinfo"' );

	if ( false !== $start && false !== $end && $end > $start ) {
		$document = substr( $document, 0, $start ) . $page_content . substr( $document, $end );
		$document = preg_replace(
			'/<link\b[^>]*\brel=(["\'])canonical\1[^>]*>/i',
			'<link rel="canonical" href="https://ecowiseitaly.com/school-trips-italy/">',
			$document,
			1
		);
		$document = ecowise_enhance_snapshot_metadata( $document, '/school-trips-italy/' );
		$version  = wp_get_theme()->get( 'Version' );
		$assets   = sprintf(
			'<link id="ecowise-school-funnel-css" rel="stylesheet" href="%1$s"><script>window.ecowiseSchoolFunnel=true;</script>',
			esc_url( get_theme_file_uri( '/assets/css/school-funnel.css' ) . '?ver=' . $version )
		);
		$script   = sprintf(
			'<script src="%s" defer></script>',
			esc_url( get_theme_file_uri( '/assets/js/site.js' ) . '?ver=' . $version )
		);
		$document = str_replace( '</head>', $assets . '</head>', $document );
		$document = str_replace( '</body>', $script . '</body>', $document );
		$document = ecowise_rewrite_snapshot_links( $document );
		echo $document; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		return;
	}
}

get_header();
echo $page_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
get_footer();
