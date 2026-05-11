(function () {
  function readUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
      return null;
    }
  }

  function authHeaders() {
    var t = localStorage.getItem('token');
    return t ? { Authorization: 'Bearer ' + t } : {};
  }

  function mountGuest() {
    var el = document.getElementById('home-dynamic');
    if (!el) return;
    el.innerHTML =
      '<p class="muted" style="max-width:38rem;font-size:1.02rem;margin:0 0 1rem">' +
      'Every seat count comes from real registrations. Sign in to book, or create an account to keep ' +
      'all your confirmation references in one place.</p>' +
      '<div class="btn-row" style="margin-top:0">' +
      '<a class="btn" href="events.html">Browse events</a>' +
      '<a class="btn btn-secondary" href="register.html">Create account</a>' +
      '<a class="btn btn-ghost" href="login.html">Sign in</a>' +
      '</div>' +
      '<p class="hint">Demo: <code>demo@test.com</code> / <code>demo123</code> · Admin: <code>admin@test.com</code> / <code>admin123</code></p>';
  }

  async function mountUser(user) {
    var el = document.getElementById('home-dynamic');
    if (!el) return;

    var isAdmin = user.role === 'admin';
    var regs = 0;
    try {
      var res = await fetch(getApiBase() + '/registrations/mine', { headers: authHeaders() });
      var rows = await res.json().catch(function () {
        return [];
      });
      if (res.ok && Array.isArray(rows)) regs = rows.length;
    } catch (e) {
      /* ignore */
    }

    var adminBtn = isAdmin
      ? '<a class="btn btn-secondary" href="admin-dashboard.html">Open admin</a>'
      : '';

    el.innerHTML =
      '<div class="home-user-strip">' +
      '<div class="user-chip">' +
      '<span class="user-chip-name">' +
      escapeHtml(user.name) +
      '</span>' +
      '<span class="user-chip-meta">' +
      escapeHtml(user.email) +
      ' · ' +
      escapeHtml(user.role) +
      '</span></div></div>' +
      '<p class="muted" style="max-width:38rem;margin:1rem 0">' +
      (regs === 0
        ? 'You have no registrations yet. Pick an event and lock in your seats.'
        : 'You have <strong>' +
          regs +
          '</strong> registration' +
          (regs === 1 ? '' : 's') +
          ' on file — open your account anytime for references.') +
      '</p>' +
      '<div class="btn-row" style="margin-top:0">' +
      '<a class="btn" href="events.html">Browse events</a>' +
      '<a class="btn btn-secondary" href="account.html">My registrations</a>' +
      adminBtn +
      '<button type="button" class="btn btn-ghost" onclick="homeSignOut()">Sign out</button>' +
      '</div>';
  }

  window.homeSignOut = function () {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.reload();
  };

  window.addEventListener('DOMContentLoaded', function () {
    var user = readUser();
    var token = localStorage.getItem('token');
    var title = document.getElementById('home-hero-title');
    var kicker = document.getElementById('home-kicker');

    if (token && user) {
      var first = (user.name || user.email || 'there').split(' ')[0];
      if (title) title.textContent = 'Welcome back, ' + first + '.';
      if (kicker) kicker.textContent = 'Signed in · Event registration';
      mountUser(user);
    } else {
      if (title) title.textContent = 'Honest capacity. One flow from browse to confirmation.';
      if (kicker) kicker.textContent = 'Event registration';
      mountGuest();
    }
  });
})();
