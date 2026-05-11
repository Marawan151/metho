async function loadEvents() {
  var res = await fetch(getApiBase() + '/events', { method: 'GET' });
  var data = await res.json().catch(function () {
    return null;
  });
  if (!res.ok) {
    var msg = (data && data.message) || 'Could not load events (' + res.status + ')';
    throw new Error(msg);
  }
  if (!Array.isArray(data)) {
    throw new Error('Unexpected response from server');
  }
  return data;
}

function card(ev) {
  var spots = Number(ev.spots_remaining);
  var full = !Number.isFinite(spots) || spots <= 0;
  var low = !full && spots <= 15;
  var badge = full
    ? '<span class="badge badge-bad">Full</span>'
    : low
      ? '<span class="badge badge-warn">' + spots + ' left</span>'
      : '<span class="badge">' + spots + ' open</span>';

  var sum = ev.summary ? '<p class="summary">' + escapeHtml(ev.summary) + '</p>' : '';

  return (
    '<a class="event-card" href="event.html?s=' +
    encodeURIComponent(ev.slug) +
    '">' +
    '<h3>' +
    escapeHtml(ev.title) +
    '</h3>' +
    '<p class="meta">' +
    escapeHtml(formatDateTime(ev.starts_at)) +
    ' · ' +
    escapeHtml(ev.location || '') +
    '</p>' +
    sum +
    '<div class="event-card-footer">' +
    '<span class="price">' +
    formatMoney(ev.price_cents) +
    '</span>' +
    badge +
    '</div></a>'
  );
}

window.addEventListener('DOMContentLoaded', function () {
  var grid = document.getElementById('event-grid');
  if (!grid) return;

  loadEvents()
    .then(function (rows) {
      if (!rows.length) {
        grid.className = 'event-empty';
        grid.innerHTML =
          '<div class="empty-card">' +
          '<h3>No events published yet</h3>' +
          '<p class="muted">Sign in as an administrator, open <strong>Admin</strong>, and create your first event. ' +
          'Turn on <em>Published</em> so it appears here.</p>' +
          '<div class="btn-row">' +
          '<a class="btn" href="index.html">Home</a>' +
          '<a class="btn btn-secondary" href="admin-dashboard.html">Admin</a>' +
          '</div></div>';
        return;
      }
      grid.className = 'event-grid';
      grid.innerHTML = rows.map(card).join('');
    })
    .catch(function (err) {
      grid.className = 'event-empty';
      grid.innerHTML =
        '<div class="empty-card">' +
        '<h3>Could not load events</h3>' +
        '<p class="alert" style="margin:0 0 0.75rem">' +
        escapeHtml(err.message || 'Error') +
        '</p>' +
        '<p class="muted" style="font-size:0.88rem;margin:0">If you upgraded the app, re-import <code>database/schema.sql</code> into MySQL if tables changed. Always open this site from ' +
        '<code>http://localhost:5001/frontend/pages/…</code> (not a file:// path).</p>' +
        '<div class="btn-row"><a class="btn" href="events.html">Retry</a></div>' +
        '</div>';
    });
});
