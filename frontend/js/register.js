async function register() {
  var nameEl = document.getElementById('reg-name');
  var emailEl = document.getElementById('reg-email');
  var passwordEl = document.getElementById('reg-password');
  var msgEl = document.getElementById('register-msg');

  if (!nameEl || !emailEl || !passwordEl) return;

  var name = nameEl.value.trim();
  var email = emailEl.value.trim();
  var password = passwordEl.value;

  if (name.length < 2) {
    alert('Enter your name');
    return;
  }
  if (!email || email.indexOf('@') === -1) {
    alert('Enter a valid email');
    return;
  }
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  try {
    var res = await fetch(getApiBase() + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, password: password }),
    });
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    if (data.token) localStorage.setItem('token', data.token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    location.href = 'account.html';
  } catch (e) {
    alert(e.message || 'Error');
  }
}

window.register = register;
