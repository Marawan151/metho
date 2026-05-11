// Used when the UI is on static hosting (e.g. Netlify) and the API runs on another host.
// Set to your public API root (must include /api, no trailing slash). Example:
//   window.__API_BASE__ = 'https://event-api.onrender.com/api';
// Leave empty to use same-origin /api (local npm start) or file:// fallback in core.js.
(function (w) {
  if (typeof w === 'undefined') return;

  // TODO BEFORE NETLIFY DEPLOY: 
  // Change the empty string below to your hosted backend URL (e.g., Render, Railway).
  // Example: w.__API_BASE__ = 'https://event-api.onrender.com/api';
  if (typeof w.__API_BASE__ === 'undefined') w.__API_BASE__ = '';
})(typeof window !== 'undefined' ? window : globalThis);
