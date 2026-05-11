(function () {
  function esc(s) {
    return typeof escapeHtml === 'function' ? escapeHtml(s) : String(s);
  }

  function when(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
      }
    } catch (e) {
      /* ignore */
    }
    return esc(String(iso).slice(0, 19));
  }

  function authJson() {
    var t = localStorage.getItem('token');
    return {
      Authorization: 'Bearer ' + t,
      'Content-Type': 'application/json',
    };
  }

  function auth() {
    var t = localStorage.getItem('token');
    return t ? { Authorization: 'Bearer ' + t } : {};
  }

  function staleApiHelp() {
    var devPort =
      typeof globalThis !== 'undefined' && globalThis.__DEV_PORT__ != null ? String(globalThis.__DEV_PORT__) : '';
    var p =
      typeof location !== 'undefined' && location.port
        ? location.port
        : devPort || '5001';
    return (
      'The Node server on port ' +
      p +
      ' is an old process (no /api/admin). Stop every Node process using that port (Task Manager → Node.js, or: Get-NetTCPConnection -LocalPort ' +
      p +
      ' | Select OwningProcess), then run npm start from this project folder and reload.'
    );
  }

  async function fetchJson(url, options) {
    var res = await fetch(url, options || {});
    var text = await res.text();
    var data = null;
    try {
      data = JSON.parse(text);
    } catch (ignore) {
      data = null;
    }
    return { res: res, data: data, text: text };
  }

  async function backendHasAdminRoutes() {
    try {
      var pack = await fetchJson(getApiBase() + '/health');
      if (!pack.res.ok) return true;
      var routes = pack.data && pack.data.routes;
      return Array.isArray(routes) && routes.indexOf('admin') !== -1;
    } catch (e) {
      return true;
    }
  }

  function showGate(html) {
    var gate = document.getElementById('admin-gate');
    var app = document.getElementById('admin-app');
    if (app) app.classList.add('hidden');
    if (gate) {
      gate.classList.remove('hidden');
      gate.innerHTML = html;
    }
  }

  var editingId = null;

  function toLocalInput(mysqlDt) {
    if (!mysqlDt) return '';
    var d = new Date(mysqlDt);
    if (isNaN(d.getTime())) return '';
    var pad = function (n) {
      return String(n).padStart(2, '0');
    };
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes())
    );
  }

  function clearEventForm() {
    editingId = null;
    var ids = [
      'ev-slug',
      'ev-title',
      'ev-summary',
      'ev-description',
      'ev-location',
      'ev-starts',
      'ev-ends',
      'ev-capacity',
      'ev-price',
    ];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) el.value = '';
    }
    var pub = document.getElementById('ev-published');
    if (pub) pub.checked = true;
    var lab = document.getElementById('ev-form-title');
    if (lab) lab.textContent = 'Create event';
  }

  function fillEventForm(ev) {
    editingId = ev.id;
    document.getElementById('ev-slug').value = ev.slug || '';
    document.getElementById('ev-title').value = ev.title || '';
    document.getElementById('ev-summary').value = ev.summary || '';
    document.getElementById('ev-description').value = ev.description || '';
    document.getElementById('ev-location').value = ev.location || '';
    document.getElementById('ev-starts').value = toLocalInput(ev.starts_at);
    document.getElementById('ev-ends').value = toLocalInput(ev.ends_at);
    document.getElementById('ev-capacity').value = String(ev.capacity != null ? ev.capacity : '');
    document.getElementById('ev-price').value =
      ev.price_cents != null ? String((Number(ev.price_cents) / 100).toFixed(2)) : '0';
    document.getElementById('ev-published').checked = !!Number(ev.published);
    document.getElementById('ev-form-title').textContent = 'Edit event #' + ev.id;
    window.scrollTo({ top: document.getElementById('event-editor').offsetTop - 80, behavior: 'smooth' });
  }

  async function refreshEventRows() {
    var res = await fetch(getApiBase() + '/admin/events', { headers: auth() });
    var rows = await res.json().catch(function () {
      return [];
    });
    if (!res.ok) return;

    var tbody = document.querySelector('#admin-event-rows tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    for (var i = 0; i < rows.length; i++) {
      var e = rows[i];
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' +
        esc(String(e.id)) +
        '</td><td>' +
        esc(e.slug) +
        '</td><td>' +
        esc(e.title) +
        '</td><td>' +
        when(e.starts_at) +
        '</td><td>' +
        esc(String(e.published ? 'live' : 'draft')) +
        '</td><td><button type="button" class="btn btn-ghost" data-edit="' +
        esc(String(e.id)) +
        '">Edit</button> <button type="button" class="btn btn-danger" data-del="' +
        esc(String(e.id)) +
        '">Delete</button></td>';
      tbody.appendChild(tr);
    }

    var editBtns = tbody.querySelectorAll('[data-edit]');
    for (var a = 0; a < editBtns.length; a++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var id = Number(btn.getAttribute('data-edit'));
          var ev = null;
          for (var z = 0; z < rows.length; z++) {
            if (rows[z].id === id) {
              ev = rows[z];
              break;
            }
          }
          if (ev) fillEventForm(ev);
        });
      })(editBtns[a]);
    }

    var delBtns = tbody.querySelectorAll('[data-del]');
    for (var b = 0; b < delBtns.length; b++) {
      (function (btn) {
        btn.addEventListener('click', async function () {
          var id = btn.getAttribute('data-del');
          if (!confirm('Delete this event? Only allowed if there are zero registrations.')) return;
          var r = await fetch(getApiBase() + '/admin/events/' + id, { method: 'DELETE', headers: auth() });
          var d = await r.json().catch(function () {
            return {};
          });
          if (!r.ok) {
            alert(d.message || 'Delete failed');
            return;
          }
          if (editingId === Number(id)) clearEventForm();
          refreshEventRows();
          loadOverview();
        });
      })(delBtns[b]);
    }
  }

  async function saveEvent(ev) {
    ev.preventDefault();
    var dollars = Number(document.getElementById('ev-price').value);
    if (!Number.isFinite(dollars) || dollars < 0) {
      alert('Enter a valid price in dollars');
      return;
    }
    var payload = {
      slug: document.getElementById('ev-slug').value.trim(),
      title: document.getElementById('ev-title').value.trim(),
      summary: document.getElementById('ev-summary').value.trim(),
      description: document.getElementById('ev-description').value,
      location: document.getElementById('ev-location').value.trim(),
      starts_at: document.getElementById('ev-starts').value,
      ends_at: document.getElementById('ev-ends').value || null,
      capacity: Number(document.getElementById('ev-capacity').value),
      price_cents: Math.round(dollars * 100),
      published: document.getElementById('ev-published').checked,
    };

    try {
      var url = getApiBase() + '/admin/events';
      var method = 'POST';
      if (editingId) {
        url += '/' + editingId;
        method = 'PUT';
      }
      var pack = await fetchJson(url, { method: method, headers: authJson(), body: JSON.stringify(payload) });
      var res = pack.res;
      var data = pack.data || {};
      if (!res.ok) {
        if (res.status === 404) throw new Error(staleApiHelp());
        if (res.status === 401) {
          throw new Error((data.message || 'Unauthorized') + ' — sign in again (Admin account required).');
        }
        if (res.status === 403) {
          throw new Error(data.message || 'You need an administrator account to manage events.');
        }
        throw new Error(data.message || 'Save failed (' + res.status + ')');
      }
      clearEventForm();
      await refreshEventRows();
      await loadOverview();
      alert(method === 'POST' ? 'Event created' : 'Event updated');
    } catch (err) {
      alert(err.message || 'Error');
    }
  }

  function renderOverview(data) {
    document.getElementById('stat-users').textContent = String(data.counts.users);
    document.getElementById('stat-events').textContent = String(data.counts.events);
    document.getElementById('stat-regs').textContent = String(data.counts.registrations);
    document.getElementById('stat-sold').textContent = String(data.counts.ticketsSold);

    var users = data.users || [];
    var tbody = document.querySelector('#admin-users tbody');
    tbody.innerHTML = '';
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      var role = String(u.role || '').replace(/[^a-z]/gi, '');
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' +
        esc(String(u.id)) +
        '</td><td>' +
        esc(u.name) +
        '</td><td>' +
        esc(u.email) +
        '</td><td><span class="role-pill role-' +
        esc(role) +
        '">' +
        esc(u.role) +
        '</span></td><td>' +
        when(u.created_at) +
        '</td>';
      tbody.appendChild(tr);
    }

    var events = data.events || [];
    var et = document.querySelector('#admin-events tbody');
    et.innerHTML = '';
    for (var j = 0; j < events.length; j++) {
      var e = events[j];
      var spots = Number(e.spots_remaining);
      var low = Number.isFinite(spots) && spots > 0 && spots <= 10;
      var tr2 = document.createElement('tr');
      tr2.innerHTML =
        '<td>' +
        esc(String(e.id)) +
        '</td><td>' +
        esc(e.slug) +
        '</td><td>' +
        esc(e.title) +
        '</td><td>' +
        when(e.starts_at) +
        '</td><td>' +
        esc(String(e.sold != null ? e.sold : '0')) +
        ' / ' +
        esc(String(e.capacity)) +
        '</td><td class="' +
        (low ? 'cell-warn' : '') +
        '">' +
        esc(String(Number.isFinite(spots) ? spots : '—')) +
        '</td><td>' +
        esc(e.published ? 'yes' : 'no') +
        '</td>';
      et.appendChild(tr2);
    }

    var rows = data.recentBookings || [];
    var bt = document.querySelector('#admin-bookings tbody');
    bt.innerHTML = '';
    if (!rows.length) {
      bt.innerHTML = '<tr><td colspan="6" class="muted">No registrations yet.</td></tr>';
      return;
    }
    for (var k = 0; k < rows.length; k++) {
      var r = rows[k];
      var tr3 = document.createElement('tr');
      tr3.innerHTML =
        '<td>' +
        when(r.created_at) +
        '</td><td><code>' +
        esc(r.public_ref) +
        '</code></td><td>' +
        esc(r.user_name) +
        '<br><span class="muted" style="font-size:0.8rem">' +
        esc(r.user_email) +
        '</span></td><td>' +
        esc(r.event_title) +
        '</td><td>' +
        esc(String(r.quantity)) +
        '</td><td>' +
        (typeof formatMoney === 'function' ? formatMoney(r.total_cents) : esc(String(r.total_cents))) +
        '</td>';
      bt.appendChild(tr3);
    }
  }

  async function loadOverview() {
    var pack = await fetchJson(getApiBase() + '/admin/overview', { headers: auth() });
    var res = pack.res;
    var data = pack.data;
    if (res.status === 404) throw new Error(staleApiHelp());
    if (!data) throw new Error(staleApiHelp());
    if (!res.ok) {
      if (res.status === 401) throw new Error((data.message || 'Unauthorized') + ' — sign in again.');
      throw new Error(data.message || 'Overview failed (' + res.status + ')');
    }
    renderOverview(data);
  }

  async function init() {
    var user = null;
    try {
      user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
      user = null;
    }
    var token = localStorage.getItem('token');

    if (!token || !user) {
      showGate(
        '<div class="card"><h2 style="margin-top:0">Sign in</h2><p class="muted">Administrator access required.</p>' +
          '<div class="btn-row"><a class="btn" href="login.html">Sign in</a><a class="btn btn-secondary" href="index.html">Home</a></div></div>'
      );
      return;
    }

    if (user.role !== 'admin') {
      showGate(
        '<div class="card"><h2 style="margin-top:0">Staff only</h2><p class="muted">Signed in as ' +
          esc(user.email) +
          '.</p><div class="btn-row"><a class="btn" href="account.html">Account</a><a class="btn btn-secondary" href="login.html">Switch user</a></div></div>'
      );
      return;
    }

    document.getElementById('admin-gate').classList.add('hidden');
    document.getElementById('admin-app').classList.remove('hidden');

    var err = document.getElementById('admin-load-error');
    if (err) {
      err.textContent = '';
      err.style.display = 'none';
    }

    try {
      var routesOk = await backendHasAdminRoutes();
      if (!routesOk) {
        throw new Error(staleApiHelp());
      }
      await loadOverview();
      await refreshEventRows();
    } catch (e) {
      if (err) {
        err.textContent = e.message || 'Error';
        err.style.display = 'block';
      }
    }

    var form = document.getElementById('event-form');
    if (form) form.addEventListener('submit', saveEvent);
    var nw = document.getElementById('ev-new');
    if (nw) nw.addEventListener('click', clearEventForm);
  }

  window.addEventListener('DOMContentLoaded', init);
})();
