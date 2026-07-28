<?php
/**
 * Code-owned school-trip acquisition page.
 *
 * @package Ecowise
 */

defined( 'ABSPATH' ) || exit;

$enquiry_status = isset( $_GET['school_enquiry'] ) ? sanitize_key( wp_unslash( $_GET['school_enquiry'] ) ) : '';
$status_messages = array(
	'success'    => array( 'success', __( 'Thank you — your school-trip enquiry has been received. Adam will reply within 24 hours.', 'ecowise' ) ),
	'saved'      => array( 'notice', __( 'Your enquiry is safely recorded, but the email notification was delayed. Adam can see it in the enquiry ledger; for an urgent reply, call or WhatsApp him.', 'ecowise' ) ),
	'incomplete' => array( 'error', __( 'Please complete every required field and confirm the data-use notice.', 'ecowise' ) ),
	'expired'    => array( 'error', __( 'The form expired. Refresh the page and try again.', 'ecowise' ) ),
	'rate'       => array( 'error', __( 'Too many enquiries were submitted. Please wait 15 minutes or contact Adam directly.', 'ecowise' ) ),
	'error'      => array( 'error', __( 'The enquiry could not be recorded. Please email or WhatsApp Adam directly.', 'ecowise' ) ),
);
$query_value = static function ( $key ) {
	return isset( $_GET[ $key ] ) ? sanitize_text_field( wp_unslash( $_GET[ $key ] ) ) : '';
};

get_header();
?>
<main id="main" class="school-funnel">
	<section class="school-hero">
		<div class="shell school-hero__grid">
			<div class="school-hero__copy">
				<p class="school-kicker">For UK and international schools</p>
				<h1>Tailored outdoor education and residential school trips in Piemonte, Italy</h1>
				<p class="school-hero__lead">Hands-on ecology, environmental fieldwork and nature-based learning, designed around your pupils, curriculum and trip objectives.</p>
				<div class="school-actions">
					<a class="school-button" href="#school-enquiry" data-eco-event="proposal_cta" data-eco-location="hero">Request a tailored proposal</a>
					<a class="school-button school-button--ghost" href="#sample-trip" data-eco-event="sample_itinerary" data-eco-location="hero">See an illustrative 3-day trip</a>
				</div>
				<p class="school-response">Adam Rose personally replies within 24 hours.</p>
			</div>
			<aside class="school-hero__card" aria-label="Typical trip fit">
				<p class="school-card__label">A useful starting point</p>
				<dl>
					<div><dt>Typical class</dt><dd>20–30 pupils</dd></div>
					<div><dt>Group range</dt><dd>Approximately 15–80</dd></div>
					<div><dt>Common residential</dt><dd>3 days / 2 nights</dd></div>
					<div><dt>Programme language</dt><dd>English</dd></div>
				</dl>
				<p>Every programme and quote is tailored. Dates are confirmed only after Adam checks the live calendar.</p>
			</aside>
		</div>
	</section>

	<section class="school-trust" aria-label="EcoWise Italy school trip strengths">
		<div class="shell school-trust__grid">
			<p><strong>Established school relationships</strong><span>Long-running work with international schools</span></p>
			<p><strong>Curriculum connected</strong><span>Real environments, fieldwork and reflection</span></p>
			<p><strong>Tailored locally</strong><span>A programme built around your group</span></p>
			<p><strong>Clear next step</strong><span>A bespoke response within 24 hours</span></p>
		</div>
	</section>

	<section class="school-section">
		<div class="shell">
			<div class="school-heading">
				<p class="school-kicker">Learning with the landscape</p>
				<h2>A school trip designed around the outcomes that matter to you</h2>
				<p>EcoWise Italy connects classroom learning with living systems, practical challenges and memorable experiences in Piemonte’s varied landscapes.</p>
			</div>
			<div class="school-card-grid">
				<article class="school-card">
					<span class="school-card__number">01</span>
					<h3>Science, ecology and fieldwork</h3>
					<p>Investigate habitats, ecosystems and environmental processes through practical observation, data collection and discussion.</p>
					<a href="<?php echo esc_url( home_url( '/for-schools/science-ecology-environment-field-trips/' ) ); ?>">Explore ecology field trips</a>
				</article>
				<article class="school-card">
					<span class="school-card__number">02</span>
					<h3>Residential outdoor learning</h3>
					<p>Combine a tailored educational programme with the shared challenge, independence and connection of time away as a group.</p>
					<a href="<?php echo esc_url( home_url( '/for-schools/residential-field-trips/' ) ); ?>">Explore residential trips</a>
				</article>
				<article class="school-card">
					<span class="school-card__number">03</span>
					<h3>Service and conservation</h3>
					<p>Turn environmental responsibility into practical action through carefully chosen habitat, community and conservation work.</p>
					<a href="<?php echo esc_url( home_url( '/for-schools/outdoor-service-education-projects/' ) ); ?>">Explore service learning</a>
				</article>
				<article class="school-card">
					<span class="school-card__number">04</span>
					<h3>Teamwork, creativity and wellbeing</h3>
					<p>Use nature, group challenges, storytelling and reflective activities to support cooperation, confidence and connection.</p>
					<a href="<?php echo esc_url( home_url( '/for-schools/team-building-wild-rites-of-passage/' ) ); ?>">Explore group development</a>
				</article>
			</div>
		</div>
	</section>

	<section id="sample-trip" class="school-section school-section--tint">
		<div class="shell school-split">
			<div>
				<p class="school-kicker">An illustrative journey</p>
				<h2>What a three-day residential programme could feel like</h2>
				<p>This is a planning example, not a fixed package. Activities, locations, challenge level and learning outcomes are shaped around your group.</p>
			</div>
			<ol class="school-timeline">
				<li><span>Day 1</span><div><h3>Arrive, orientate and connect</h3><p>Meet the landscape, establish group expectations and begin a guided ecological investigation.</p></div></li>
				<li><span>Day 2</span><div><h3>Go deeper through fieldwork</h3><p>A full day of practical ecology, conservation or curriculum-linked challenges, followed by reflection.</p></div></li>
				<li><span>Day 3</span><div><h3>Make meaning and carry it home</h3><p>Synthesise observations, share learning and connect the experience back to school projects and objectives.</p></div></li>
			</ol>
		</div>
	</section>

	<section class="school-section">
		<div class="shell">
			<div class="school-heading">
				<p class="school-kicker">Clear responsibilities</p>
				<h2>Specialist local delivery without pretending to be a tour operator</h2>
				<p>EcoWise Italy designs and delivers the educational programme and helps coordinate suitable local arrangements. The trip is not sold as one combined travel package.</p>
			</div>
			<div class="school-responsibilities">
				<article><h3>EcoWise Italy</h3><ul><li>Designs and quotes the outdoor programme</li><li>Delivers and risk-assesses its activities</li><li>Safeguards during the programme it delivers</li><li>Helps coordinate suitable accommodation</li></ul></article>
				<article><h3>Accommodation and food providers</h3><ul><li>Contract and invoice their services separately</li><li>Confirm their facilities and operating terms</li><li>Retain responsibility for their service</li></ul></article>
				<article><h3>Your school and travel provider</h3><ul><li>Arrange and contract travel</li><li>Retain school safeguarding responsibilities</li><li>Hold the school’s required insurance</li><li>Approve the final plan and suppliers</li></ul></article>
			</div>
			<p class="school-note">EcoWise Italy holds public-liability insurance. Adam will confirm which current documents can be supplied and the detailed responsibility wording during planning. Programme, accommodation/food and travel are separately contracted or invoiced.</p>
		</div>
	</section>

	<section class="school-section school-section--dark">
		<div class="shell">
			<div class="school-heading">
				<p class="school-kicker">Trusted by educators</p>
				<h2>Long relationships, not anonymous package tourism</h2>
			</div>
			<div class="school-quotes">
				<blockquote>
					<p>“Adam and Yenka have always invested a lot of time and effort in creating tailor-made programs which support and enhance our school curriculum.”</p>
					<cite>Laura Haines, Inclusive Learning Coordinator, International School of Milan — November 2024</cite>
				</blockquote>
				<blockquote>
					<p>“They skillfully support our students in fostering connections with nature while also helping our teachers draw meaningful curricular links.”</p>
					<cite>Victoria Corkhill, Primary Principal &amp; PYP Coordinator, WINS Turin — November 2024</cite>
				</blockquote>
			</div>
			<a class="school-text-link" href="<?php echo esc_url( home_url( '/what-they-say-about-us/' ) ); ?>">Read more educator feedback</a>
		</div>
	</section>

	<section class="school-section">
		<div class="shell school-split">
			<div>
				<p class="school-kicker">How planning works</p>
				<h2>From first question to a workable proposal</h2>
			</div>
			<ol class="school-steps">
				<li><strong>Tell us the essentials.</strong><span>Group, possible dates, duration and what pupils should gain.</span></li>
				<li><strong>Adam checks fit and feasibility.</strong><span>You receive a personal reply within 24 hours; dates remain provisional until checked.</span></li>
				<li><strong>EcoWise Italy shapes the programme.</strong><span>Adam proposes suitable learning, locations and a bespoke programme quote.</span></li>
				<li><strong>Each provider confirms its part.</strong><span>EcoWise Italy helps coordinate accommodation; your school arranges travel; suppliers contract separately.</span></li>
			</ol>
		</div>
	</section>

	<section class="school-season">
		<div class="shell school-season__inner">
			<div>
				<p class="school-kicker">Plan beyond the obvious dates</p>
				<h2>Ask about November–March</h2>
				<p>EcoWise Italy has historically had more capacity from November through March, while April and May often fill earlier. Adam will check your preferred dates against the live calendar.</p>
			</div>
			<a class="school-button school-button--light" href="#school-enquiry" data-eco-event="winter_cta" data-eco-location="season">Ask about your dates</a>
		</div>
	</section>

	<section class="school-section">
		<div class="shell school-faq">
			<div class="school-heading"><p class="school-kicker">Practical questions</p><h2>What teachers usually need to know</h2></div>
			<details><summary>Can the programme connect to our curriculum?</summary><p>Yes. EcoWise Italy builds programmes around the group’s learning objectives and has experience connecting outdoor work to science, ecology, interdisciplinary learning and IB contexts. Tell Adam the exact outcomes you need so he can confirm fit.</p></details>
			<details><summary>What group sizes work?</summary><p>Approximately 15–80 pupils can be considered. A single class of around 20–30 is typical. Final feasibility depends on ages, programme, location and staffing.</p></details>
			<details><summary>Do you offer day and residential trips?</summary><p>Yes. A common residential format is three days and two nights, while day programmes and longer tailored formats can also be discussed.</p></details>
			<details><summary>Who books travel and accommodation?</summary><p>Your school arranges travel. Adam can identify and coordinate suitable accommodation, but the programme, accommodation/food and travel are contracted or invoiced separately.</p></details>
			<details><summary>How is pricing calculated?</summary><p>EcoWise Italy provides a bespoke per-person quote. Group size, duration, programme and location affect the price; larger groups will generally have a lower per-person programme cost.</p></details>
			<details><summary>What happens after we enquire?</summary><p>Adam replies within 24 hours, checks your dates and requirements, then discusses a tailored programme and the separate practical arrangements.</p></details>
		</div>
	</section>

	<section id="school-enquiry" class="school-section school-section--form">
		<div class="shell school-form-layout">
			<div>
				<p class="school-kicker">Start a real conversation</p>
				<h2>Request a tailored school-trip proposal</h2>
				<p>Give Adam enough detail to assess fit and suggest a useful next step. You do not need to have every date or activity decided.</p>
				<div class="school-direct">
					<a href="mailto:adamecorose@gmail.com" data-eco-event="contact_click" data-eco-channel="email">adamecorose@gmail.com</a>
					<a href="tel:+393421363274" data-eco-event="contact_click" data-eco-channel="phone">+39 342 136 3274</a>
					<a href="https://wa.me/393421363274" data-eco-event="contact_click" data-eco-channel="whatsapp">WhatsApp Adam</a>
				</div>
			</div>
			<div class="school-form-card">
				<?php if ( isset( $status_messages[ $enquiry_status ] ) ) : ?>
					<div class="school-form-status school-form-status--<?php echo esc_attr( $status_messages[ $enquiry_status ][0] ); ?>" role="<?php echo 'error' === $status_messages[ $enquiry_status ][0] ? 'alert' : 'status'; ?>">
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
					<div class="school-honeypot" aria-hidden="true"><label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>

					<div class="school-field-grid">
						<label>School name <span>*</span><input type="text" name="school_name" required autocomplete="organization"></label>
						<label>Country <span>*</span><input type="text" name="country" required autocomplete="country-name"></label>
						<label>Your name <span>*</span><input type="text" name="contact_name" required autocomplete="name"></label>
						<label>Your role <span>*</span><input type="text" name="role" required autocomplete="organization-title"></label>
						<label>Email <span>*</span><input type="email" name="email" required autocomplete="email"></label>
						<label>Phone / WhatsApp<input type="tel" name="phone" autocomplete="tel"></label>
						<label>Pupil ages or year groups <span>*</span><input type="text" name="pupil_ages" required placeholder="e.g. Year 6, ages 10–11"></label>
						<label>Estimated pupils <span>*</span><input type="number" name="students" required min="1" max="200" inputmode="numeric"></label>
						<label>Estimated accompanying adults<input type="number" name="adults" min="0" max="50" inputmode="numeric"></label>
						<label>Preferred dates or season <span>*</span><input type="text" name="preferred_dates" required placeholder="Exact dates or a flexible period"></label>
						<label>Date flexibility<select name="date_flexibility"><option value="">Please choose</option><option>Exact dates required</option><option>Flexible by a few days</option><option>Flexible within the term</option><option>Open to November–March</option></select></label>
						<label>Trip format <span>*</span><select name="trip_format" required><option value="">Please choose</option><option>Day programme</option><option>Residential trip</option><option>Not sure yet</option></select></label>
						<label>Preferred duration<input type="text" name="duration" placeholder="e.g. 3 days / 2 nights"></label>
					</div>
					<label>Learning priorities or outcomes <span>*</span><textarea name="objectives" required rows="5" placeholder="Curriculum links, ecology topics, fieldwork, service learning, teamwork…"></textarea></label>
					<label>High-level access or dietary planning notes<textarea name="requirements" rows="3" placeholder="Do not include pupil names or medical information."></textarea></label>
					<label>Anything else Adam should know<textarea name="message" rows="4"></textarea></label>
					<label class="school-consent"><input type="checkbox" name="privacy_consent" value="1" required><span>I understand EcoWise Italy will use these details to respond to this school-trip enquiry and keep an owner-controlled enquiry record. I have not included pupil names or sensitive personal information. <strong>*</strong></span></label>
					<button class="school-button" type="submit" data-eco-event="proposal_submit">Request my tailored proposal</button>
					<p class="school-form-note">No booking is created by this form. Adam will personally reply within 24 hours and confirm whether your dates and requirements are feasible.</p>
				</form>
			</div>
		</div>
	</section>
</main>
<?php
get_footer();
