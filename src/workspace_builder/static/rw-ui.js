/** Shared RunWhen Local UI helpers (theme + nav). */
(function () {
  'use strict';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('rwl-theme', theme); } catch (e) { /* private mode */ }
    updateThemeButtons();
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function toggleTheme() {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  }

  function updateThemeButtons() {
    var dark = currentTheme() === 'dark';
    var label = dark ? 'Switch to light mode' : 'Switch to dark mode';
    ['themeToggle', 'themeBtn'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (!btn) return;
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      if (btn.textContent.trim().length <= 2) {
        btn.textContent = dark ? '☀' : '☾';
      }
    });
  }

  function setActiveNav() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('[data-nav]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var normalized = href.replace(/\/$/, '') || '/';
      var active = normalized === '/'
        ? path === '/'
        : path === normalized || path.indexOf(normalized + '/') === 0;
      link.classList.toggle('active', active);
    });
  }

  function init() {
    var saved = 'light';
    try { saved = localStorage.getItem('rwl-theme') || 'light'; } catch (e) { /* ignore */ }
    applyTheme(saved === 'dark' ? 'dark' : 'light');
    setActiveNav();
    ['themeToggle', 'themeBtn'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', toggleTheme);
    });
  }

  window.RWUI = { applyTheme: applyTheme, toggleTheme: toggleTheme, setActiveNav: setActiveNav };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
