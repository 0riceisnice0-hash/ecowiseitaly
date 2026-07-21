(function () {
  'use strict';

  const config = window.ecowiseFidelity;
  if (!config) return;

  document.querySelectorAll('form.elementor-form').forEach(function (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

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
      data.set('website', '');

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
        form.reset();
      } catch (error) {
        message.textContent = error.message || config.messages.error;
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = originalLabel;
        }
      }
    });
  });
})();

