function authHeaders() {
  var t = localStorage.getItem('token');
  return t ? { Authorization: 'Bearer ' + t } : {};
}

window.addEventListener('DOMContentLoaded', async function () {
  var root = document.getElementById('confirm-root');
  var params = new URLSearchParams(location.search);
  var ref = params.get('ref');

  if (!ref || ref.length !== 10) {
    root.innerHTML =
      '<p class="alert">Missing or invalid reference. Open the link from your confirmation email or account page.</p>';
    return;
  }

  var token = localStorage.getItem('token');
  if (!token) {
    root.innerHTML =
      '<p class="muted">Please <a href="login.html?next=' +
      encodeURIComponent(location.pathname + location.search) +
      '">sign in</a> to view this registration.</p>';
    return;
  }

  try {
    var res = await fetch(getApiBase() + '/registrations/ref/' + encodeURIComponent(ref), {
      headers: authHeaders(),
    });
    var r = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) throw new Error(r.message || 'Not found');

    root.innerHTML =
      '<div class="card">' +
      '<p class="kicker" style="margin:0 0 0.5rem">Registration</p>' +
      '<h2 style="margin:0 0 0.5rem">You are in</h2>' +
      '<p class="muted">Reference <code>' +
      escapeHtml(r.public_ref) +
      '</code> · ' +
      escapeHtml(String(r.quantity)) +
      ' ticket(s) · total ' +
      formatMoney(r.total_cents) +
      '</p>' +
      '<div class="stat-grid">' +
      '<div class="stat"><span class="l">Event</span><span class="v" style="font-size:1rem">' +
      escapeHtml(r.event_title) +
      '</span></div>' +
      '<div class="stat"><span class="l">Starts</span><span class="v" style="font-size:0.95rem">' +
      escapeHtml(formatDateTime(r.starts_at)) +
      '</span></div>' +
      '<div class="stat"><span class="l">Venue</span><span class="v" style="font-size:0.95rem">' +
      escapeHtml(r.location || '') +
      '</span></div></div>' +
      '<div class="btn-row" style="margin-top:1.25rem">' +
      '<a class="btn" href="account.html">My registrations</a>' +
      '<a class="btn btn-secondary" href="events.html">More events</a></div></div>';
  } catch (e) {
    root.innerHTML = '<p class="alert">' + escapeHtml(e.message || 'Error') + '</p>';
  }
});
