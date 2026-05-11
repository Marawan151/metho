function validateEmail(email) {
  return typeof email === 'string' && email.includes('@');
}

function nextUrl() {
  try {
    var p = new URLSearchParams(location.search);
    var n = p.get('next');
    if (n && n.indexOf('http') !== 0 && n.indexOf('//') !== 0) return n;
  } catch (e) {
    /* ignore */
  }
  return 'account.html';
}

async function login() {
  var emailEl = document.getElementById('email');
  var passwordEl = document.getElementById('password');
  if (!emailEl || !passwordEl) return;

  var email = emailEl.value.trim();
  var password = passwordEl.value;

  if (!validateEmail(email)) {
    alert('Enter a valid email');
    return;
  }
  if (!password) {
    alert('Enter your password');
    return;
  }

  try {
    var res = await fetch(getApiBase() + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password }),
    });
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) throw new Error(data.message || 'Login failed');
    if (!data.token) throw new Error('No token');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user || null));

    location.href = nextUrl();
  } catch (e) {
    alert(e.message || 'Login error');
  }
}

window.login = login;
