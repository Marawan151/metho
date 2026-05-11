(function () {
  function currentPage() {
    var path = (location.pathname || '').replace(/\\/g, '/');
    var parts = path.split('/').filter(Boolean);
    var file = parts.length ? parts[parts.length - 1] : 'index.html';
    if (!file || file.indexOf('.') === -1) file = 'index.html';
    return file.split('?')[0].split('#')[0] || 'index.html';
  }

  function readUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
      return null;
    }
  }

  function render() {
    var mount = document.getElementById('app-nav');
    if (!mount) return;

    var user = readUser();
    var token = localStorage.getItem('token');
    var logged = !!(user && token);
    var isAdmin = user && user.role === 'admin';

    var links = [{ href: 'events.html', label: 'Events', match: ['events.html'] }];

    if (logged) {
      links.push({ href: 'account.html', label: 'My registrations', match: ['account.html', 'profile.html'] });
    } else {
      links.push({ href: 'login.html', label: 'Sign in', match: ['login.html'] });
      links.push({ href: 'register.html', label: 'Register', match: ['register.html'] });
    }

    if (isAdmin) {
      links.push({ href: 'admin-dashboard.html', label: 'Admin', match: ['admin-dashboard.html'] });
    }

    var cur = currentPage();
    mount.innerHTML = '';
    for (var i = 0; i < links.length; i++) {
      var L = links[i];
      var a = document.createElement('a');
      a.href = L.href;
      a.textContent = L.label;
      if (L.match.indexOf(cur) !== -1) a.className = 'is-active';
      mount.appendChild(a);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
