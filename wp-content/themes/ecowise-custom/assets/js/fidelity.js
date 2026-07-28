(function () {
  'use strict';

  const config = window.ecowiseFidelity;
  if (!config) return;

  function emitConversion(name, details) {
    const payload = Object.assign({ event: name, page_path: window.location.pathname }, details || {});
    window.dispatchEvent(new CustomEvent('ecowise:conversion', { detail: payload }));
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
  }

  document.addEventListener('click', function (event) {
    const action = event.target.closest('[data-eco-event], a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me/"]');
    if (!action) return;
    const href = action.getAttribute('href') || '';
    const channel = href.startsWith('tel:') ? 'phone' : href.startsWith('mailto:') ? 'email' : href.includes('wa.me/') ? 'whatsapp' : '';
    emitConversion(action.dataset.ecoEvent || 'contact_click', {
      event_location: action.dataset.ecoLocation || '',
      contact_channel: action.dataset.ecoChannel || channel,
      destination: href,
    });
  });

  document.querySelectorAll('form.elementor-form').forEach(function (form) {
    let started = false;
    form.addEventListener('focusin', function () {
      if (started) return;
      started = true;
      emitConversion('form_start', { form_id: form.querySelector('[name="form_id"]')?.value || '' });
    });
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      const submit = form.querySelector('[type="submit"]');
      const originalLabel = submit ? submit.textContent : '';
      let message = form.querySelector('.ecowise-form-message');
      if (!message) {
        message = document.createElement('div');
        message.className = 'ecowise-form-message';
        message.setAttribute('role', 'status');
        form.appendChild(message);
      }

      const data = new FormData(form);
      data.set('action', config.action);
      data.set('nonce', config.nonce);
      data.set('source_page', window.location.href);
      data.set('form_name', form.getAttribute('name') || document.title);
      if (submit) {
        submit.disabled = true;
        submit.textContent = config.messages.sending;
      }
      message.textContent = config.messages.sending;

      try {
        const response = await fetch(config.endpoint, {
          method: 'POST',
          body: data,
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.data && payload.data.message);
        message.textContent = (payload.data && payload.data.message) || config.messages.success;
        emitConversion('generate_lead', { form_id: form.querySelector('[name="form_id"]')?.value || '' });
        form.reset();
      } catch (error) {
        message.textContent = error.message || config.messages.error;
        emitConversion('form_error', { form_id: form.querySelector('[name="form_id"]')?.value || '' });
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = originalLabel;
        }
      }
    }, { capture: true });
  });
})();
