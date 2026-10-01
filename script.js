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
     Static-site friendly: validates the fields, then opens the visitor's
     email app with a prefilled message to ata3958@sdsu.edu (no backend). */
  var form = document.getElementById('contact-form');
  if (form) {
    var note = form.querySelector('.form-note');

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.reportValidity()) return;

      var name = document.getElementById('cf-name').value.trim();
      var company = document.getElementById('cf-company').value.trim();
      var email = document.getElementById('cf-email').value.trim();
      var phone = document.getElementById('cf-phone').value.trim();
      var message = document.getElementById('cf-message').value.trim();

      var subject = 'Website contact from ' + name + (company ? ' (' + company + ')' : '');
      var lines = [message, '', '— ' + name];
      if (company) lines.push(company);
      lines.push('Email: ' + email);
      if (phone) lines.push('Phone: ' + phone);

      if (note) note.textContent = 'Opening your email app…';
      location.href = 'mailto:ata3958@sdsu.edu'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }
})();
