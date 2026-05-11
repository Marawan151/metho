function qs(name) {
  var p = new URLSearchParams(location.search);
  return p.get(name);
}

function authHeaders() {
  var t = localStorage.getItem('token');
  return t ? { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function mountError(msg) {
  var el = document.getElementById('event-root');
  if (!el) return;
  el.innerHTML = '<p class="alert">' + escapeHtml(msg) + '</p>';
}

async function loadEvent() {
  var slug = qs('s');
  var id = qs('id');
  var url;
  if (slug) url = getApiBase() + '/events/s/' + encodeURIComponent(slug);
  else if (id) url = getApiBase() + '/events/' + encodeURIComponent(id);
  else {
    mountError('Open an event from the catalog (missing link).');
    return null;
  }

  var res = await fetch(url);
  var data = await res.json().catch(function () {
    return {};
  });
  if (!res.ok) {
    mountError(data.message || 'Event not found');
    return null;
  }
  return data;
}

function renderEvent(ev) {
  var root = document.getElementById('event-root');
  var spots = Number(ev.spots_remaining);
  var full = !Number.isFinite(spots) || spots <= 0;

  document.getElementById('event-page-title').textContent = ev.title || 'Event';

  root.innerHTML =
    '<div class="card">' +
    '<p class="muted" style="margin-top:0">' +
    escapeHtml(formatDateTime(ev.starts_at)) +
    (ev.ends_at ? ' — ' + escapeHtml(formatDateTime(ev.ends_at)) : '') +
    '</p>' +
    '<p class="muted">' +
    escapeHtml(ev.location || '') +
    '</p>' +
    '<div class="stat-grid">' +
    '<div class="stat"><span class="l">Price</span><span class="v">' +
    formatMoney(ev.price_cents) +
    '</span></div>' +
    '<div class="stat"><span class="l">Seats left</span><span class="v">' +
    (full ? '0' : String(spots)) +
    '</span></div>' +
    '<div class="stat"><span class="l">Capacity</span><span class="v">' +
    escapeHtml(String(ev.capacity)) +
    '</span></div></div>' +
    (ev.description
      ? '<div style="margin-top:1rem"><h2 style="font-size:1rem;margin:0 0 0.5rem">About</h2><p class="lead" style="white-space:pre-wrap;margin:0">' +
        escapeHtml(ev.description) +
        '</p></div>'
      : '') +
    '<div class="split split-2" style="margin-top:1.25rem;align-items:start">' +
    '<div>' +
    '<h2 style="font-size:1rem;margin:0 0 0.5rem">Register</h2>' +
    '<p class="muted" style="font-size:0.85rem">Signed-in users only. You will get a confirmation reference.</p>' +
    '<label for="reg-qty">Tickets</label>' +
    '<input id="reg-qty" type="number" min="1" max="50" value="1" ' +
    (full ? 'disabled' : '') +
    ' />' +
    '<div class="btn-row">' +
    '<button type="button" id="reg-btn" ' +
    (full ? 'disabled' : '') +
    '>Confirm registration</button>' +
    '<a class="btn btn-secondary" href="events.html">All events</a></div>' +
    '<p id="reg-msg" class="hint"></p></div>' +
    '<div class="card" style="background:rgba(0,0,0,.2);padding:1rem">' +
    '<p class="muted" style="margin:0;font-size:0.85rem">Public link</p>' +
    '<p style="margin:0.35rem 0 0;word-break:break-all;font-size:0.85rem"><code>' +
    escapeHtml(location.origin + '/frontend/pages/event.html?s=' + encodeURIComponent(ev.slug)) +
    '</code></p></div></div></div>';

  var btn = document.getElementById('reg-btn');
  if (btn && !full) {
    btn.addEventListener('click', function () {
      submitReg(ev.id);
    });
  }
}

async function submitReg(eventId) {
  var msg = document.getElementById('reg-msg');
  var qtyEl = document.getElementById('reg-qty');
  var token = localStorage.getItem('token');
  if (!token) {
    location.href = 'login.html?next=' + encodeURIComponent(location.pathname + location.search);
    return;
  }
  var qty = qtyEl ? Number(qtyEl.value) : 1;
  if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
    msg.textContent = 'Choose a whole number of tickets between 1 and 50.';
    return;
  }

  msg.textContent = 'Submitting…';
  try {
    var res = await fetch(getApiBase() + '/registrations', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ eventId: eventId, quantity: qty }),
    });
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    if (data.reference) {
      location.href = 'confirmation.html?ref=' + encodeURIComponent(data.reference);
      return;
    }
    msg.textContent = 'Saved — no reference returned.';
  } catch (e) {
    msg.textContent = e.message || 'Error';
  }
}

window.addEventListener('DOMContentLoaded', function () {
  loadEvent().then(function (ev) {
    if (ev) renderEvent(ev);
  });
});
