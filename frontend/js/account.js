function authHeaders() {
  var t = localStorage.getItem('token');
  return t ? { Authorization: 'Bearer ' + t } : {};
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (e) {
    return null;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = 'login.html';
}

async function loadRegs() {
  var box = document.getElementById('reg-list');
  var token = localStorage.getItem('token');
  if (!token) {
    box.innerHTML =
      '<p class="muted">Please <a href="login.html">sign in</a> to see your registrations.</p>';
    return;
  }

  try {
    var res = await fetch(getApiBase() + '/registrations/mine', { headers: authHeaders() });
    var rows = await res.json().catch(function () {
      return [];
    });
    if (!res.ok) throw new Error(rows.message || 'Could not load');
    if (!Array.isArray(rows)) rows = [];

    if (!rows.length) {
      box.innerHTML = '<p class="muted">You have no registrations yet. <a href="events.html">Browse events</a></p>';
      return;
    }

    var html =
      '<div class="table-wrap"><table class="data"><thead><tr><th>Reference</th><th>Event</th><th>When</th><th>Qty</th><th>Total</th></tr></thead><tbody>';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      html +=
        '<tr><td><a href="confirmation.html?ref=' +
        encodeURIComponent(r.public_ref) +
        '"><code>' +
        escapeHtml(r.public_ref) +
        '</code></a></td><td>' +
        escapeHtml(r.event_title || '') +
        '</td><td>' +
        escapeHtml(formatDateTime(r.starts_at)) +
        '</td><td>' +
        escapeHtml(String(r.quantity)) +
        '</td><td>' +
        formatMoney(Number(r.total_cents || 0)) +
        '</td></tr>';
    }
    html += '</tbody></table></div>';
    box.innerHTML = html;
  } catch (e) {
    box.innerHTML = '<p class="alert">' + escapeHtml(e.message || 'Error') + '</p>';
  }
}

window.addEventListener('DOMContentLoaded', function () {
  var u = readUser();
  var token = localStorage.getItem('token');
  var el = document.getElementById('account-summary');
  if (el) {
    if (!token || !u) {
      el.innerHTML =
        '<p class="muted">You are not signed in. <a href="login.html">Sign in</a> or <a href="register.html">create an account</a>.</p>';
    } else {
      el.innerHTML =
        '<p class="lead" style="margin:0">' +
        escapeHtml(u.name) +
        '</p><p class="muted" style="margin:0.25rem 0 0">' +
        escapeHtml(u.email) +
        ' · role <strong>' +
        escapeHtml(u.role) +
        '</strong></p>';
    }
  }
  loadRegs();
});

window.logout = logout;
