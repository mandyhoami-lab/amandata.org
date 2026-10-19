/* ==========================================================================
   amandata.org — rebuilt behavior
   Vanilla JS replacing the Carrd runtime: hash-routed views, entrance
   animations, and contact-form submission. No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- hash-routed views ---------- */
  var views = Array.prototype.slice.call(document.querySelectorAll('.view'));
  var viewNames = views.map(function (v) { return v.getAttribute('data-view'); });

  function currentViewName() {
    var hash = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return viewNames.indexOf(hash) !== -1 ? hash : 'homepage';
  }

  function showView(name) {
    views.forEach(function (v) {
      var active = v.getAttribute('data-view') === name;
      if (active) {
        v.removeAttribute('hidden');
      } else {
        v.setAttribute('hidden', '');
      }
    });
    // Instant return to top on view change, like the original.
    window.scrollTo(0, 0);
    // Restart heading entrance animation for the newly shown view.
    var active = document.querySelector('.view[data-view="' + name + '"]');
    if (active) {
      var titles = active.querySelectorAll('.sec-title');
      titles.forEach(function (t) {
        t.classList.remove('anim-in');
        void t.offsetWidth; // reflow so the animation replays
        t.classList.add('anim-in');
      });
    }
  }

  function syncView() {
    var name = currentViewName();
    // Normalize unknown/empty hashes to #homepage without adding history noise.
    var want = '#' + name;
    if ((location.hash || '') !== want && name === 'homepage' && !location.hash) {
      showView(name);
      return;
    }
    showView(name);
  }

  window.addEventListener('hashchange', syncView);

  /* ---------- entrance animations ---------- */
  function playEntrance() {
    var social = document.querySelector('.social');
    if (social) social.classList.add('anim-in');
    syncView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', playEntrance);
  } else {
    playEntrance();
  }

  /* ---------- contact form ----------
     Posts to the send-contact edge function on Supabase, which stores the
     message and emails it to ata3958@sdsu.edu via Resend. */
  var CONTACT_ENDPOINT = 'https://latblgczhvpmvhuewczt.supabase.co/functions/v1/send-contact';
  var CONTACT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdGJsZ2N6aHZwbXZodWV3Y3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDAzNjYsImV4cCI6MjEwNjMxNjM2Nn0.0kEZgPkqQWmeW6fJ7k5uV2afDy-PsHrj_7WFpEOlELY';
  var form = document.getElementById('contact-form');
  if (form) {
    form.removeAttribute('action');
    var note = form.querySelector('.form-note');
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.reportValidity()) return;

      var payload = {
        name: document.getElementById('cf-name').value.trim(),
        company: document.getElementById('cf-company').value.trim(),
        email: document.getElementById('cf-email').value.trim(),
        phone: document.getElementById('cf-phone').value.trim(),
        message: document.getElementById('cf-message').value.trim()
      };

      if (note) note.textContent = 'Sending…';
      if (submitBtn) submitBtn.disabled = true;

      fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONTACT_ANON_KEY,
          'Authorization': 'Bearer ' + CONTACT_ANON_KEY
        },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('bad status ' + res.status);
        return res.json();
      }).then(function () {
        if (note) note.textContent = 'Thanks — your message is on its way.';
        form.reset();
      }).catch(function () {
        if (note) note.textContent = 'Something went wrong sending that. Please try again in a bit.';
      }).then(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }
})();

/* ---------- dark mode toggle ---------- */
(function () {
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  // restore saved preference
  if (localStorage.getItem('amandata-theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
  btn.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('amandata-theme',
      document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  });
})();
