// Applies the visitor's saved theme before first paint. Loaded as a blocking
// external file (not inline) so it satisfies both the public and admin CSPs.
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
