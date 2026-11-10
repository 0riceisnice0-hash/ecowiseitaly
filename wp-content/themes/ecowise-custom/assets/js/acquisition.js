(function () {
  'use strict';
  const config = window.ecowiseAcquisition;
  if (!config || config.exclude || navigator.doNotTrack === '1' || /bot|crawler|spider|headless/i.test(navigator.userAgent)) return;
  const params = new URLSearchParams(location.search);
  const campaign = config.campaigns.includes(params.get('utm_campaign')) ? params.get('utm_campaign') : 'unattributed';
  const tagged = campaign !== 'unattributed';
  const medium = params.get('utm_medium');
  let source = tagged && medium === 'email' ? 'email' : 'direct-other';
  try {
    const host = document.referrer ? new URL(document.referrer).hostname : '';
    if (source !== 'email') {
      source = /(^|\.)google\./.test(host) ? 'google' : /(^|\.)bing\.com$/.test(host) ? 'bing' : /(^|\.)facebook\.com$/.test(host) ? 'facebook' : /(^|\.)linkedin\.com$/.test(host) ? 'linkedin' : host === location.hostname ? 'internal' : 'direct-other';
      if (tagged && params.get('utm_source') === 'linkedin') source = 'linkedin';
    }
  } catch (_) { /* No full referrer is transmitted. */ }
  const sent = new Set();
  function count(event) {
    if (sent.has(event)) return;
    sent.add(event);
    const body = new URLSearchParams({action:'ecowise_acquisition', event, page:location.pathname, campaign, source});
    fetch(config.endpoint, {method:'POST', body, credentials:'same-origin', keepalive:true, referrerPolicy:'no-referrer'}).catch(function () {});
  }
  count('page_view');
  window.addEventListener('ecowise:conversion', function (event) {
    const name = event.detail && event.detail.event;
    if (['proposal_cta','planning_pack_download','partner_brief_download','proposal_form_start','contact_click','form_start'].includes(name)) count(name);
  });
  // URL-only attribution; no cookie, localStorage, fingerprint or individual recipient tag.
  if (tagged) document.querySelectorAll('a[href]').forEach(function (link) {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || /\/wp-(admin|content|login)/.test(url.pathname)) return;
    ['utm_source','utm_medium','utm_campaign'].forEach(function (key) { if (params.get(key)) url.searchParams.set(key, params.get(key)); });
    link.href = url.href;
  });
  document.querySelectorAll('input[name^="utm_"]').forEach(function (field) {
    field.value = ['utm_source','utm_medium','utm_campaign'].includes(field.name) && tagged ? params.get(field.name) || '' : '';
  });
})();
