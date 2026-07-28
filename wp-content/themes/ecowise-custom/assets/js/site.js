(function () {
  'use strict';

  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-primary-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      nav.toggleAttribute('data-open', !isOpen);
    });
  }

  function emitConversion(name, details) {
    const payload = Object.assign({ event: name, page_path: window.location.pathname }, details || {});
    window.dispatchEvent(new CustomEvent('ecowise:conversion', { detail: payload }));
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    }
  }

  document.addEventListener('click', function (event) {
    const action = event.target.closest('[data-eco-event]');
    if (!action) return;
    emitConversion(action.dataset.ecoEvent, {
      event_location: action.dataset.ecoLocation || '',
      contact_channel: action.dataset.ecoChannel || '',
      destination: action.getAttribute('href') || '',
    });
  });

  const schoolForm = document.querySelector('[data-school-enquiry]');
  if (schoolForm) {
    let started = false;
    schoolForm.addEventListener('focusin', function () {
      if (started) return;
      started = true;
      emitConversion('proposal_form_start', { event_location: 'school_funnel' });
    });
  }

  const enquiryStatus = new URLSearchParams(window.location.search).get('school_enquiry');
  if (enquiryStatus === 'success' || enquiryStatus === 'saved') {
    emitConversion('generate_lead', { lead_type: 'school_proposal', delivery_status: enquiryStatus });
  } else if (enquiryStatus) {
    emitConversion('form_error', { lead_type: 'school_proposal', error_type: enquiryStatus });
  }
})();
