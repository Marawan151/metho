(function (global) {
  global.getApiBase = function getApiBase() {
    var fromWindow =
      typeof global.__API_BASE__ === 'string' && global.__API_BASE__.replace(/\s/g, '').length
        ? String(global.__API_BASE__).trim().replace(/\/+$/, '')
        : '';
    if (fromWindow) return fromWindow;
    if (typeof document !== 'undefined') {
      var meta = document.querySelector('meta[name="api-base"]');
      var c = meta && meta.getAttribute('content');
      if (c && String(c).trim()) return String(c).trim().replace(/\/+$/, '');
    }
    if (typeof location !== 'undefined' && location.protocol && location.protocol !== 'file:') {
      return location.origin.replace(/\/$/, '') + '/api';
    }
    return 'http://127.0.0.1:' + (global.__DEV_PORT__ || '5001') + '/api';
  };

  global.escapeHtml = function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  global.formatMoney = function formatMoney(cents) {
    var n = Number(cents) || 0;
    return n === 0 ? 'Free' : '$' + (n / 100).toFixed(2);
  };

  global.formatDateTime = function formatDateTime(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }
    } catch (e) {
      /* ignore */
    }
    return String(iso).slice(0, 16);
  };
})(typeof window !== 'undefined' ? window : globalThis);
