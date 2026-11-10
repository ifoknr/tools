
window.IF = { listeners: [] };
(function () {
  var page = document.getElementById("page"), lang = "ar";
  try { lang = localStorage.getItem("lang") || ((navigator.language || "").indexOf("ar") === 0 ? "ar" : "en"); } catch (e) {}
  document.querySelectorAll("[data-en]").forEach(function (n) { n.dataset.ar = n.textContent; });
  function apply() {
    page.dir = lang === "en" ? "ltr" : "rtl"; page.lang = lang;
    document.querySelectorAll("[data-en]").forEach(function (n) { n.textContent = lang === "en" ? n.dataset.en : n.dataset.ar; });
    document.getElementById("lang").textContent = lang === "en" ? "عربي" : "English";
    IF.listeners.forEach(function (f) { f(lang); });
  }
  IF.lang = function () { return lang; };
  IF.onLang = function (f) { IF.listeners.push(f); };
  document.getElementById("lang").addEventListener("click", function () { lang = lang === "en" ? "ar" : "en"; try { localStorage.setItem("lang", lang); } catch (e) {} apply(); });
  apply();
  // Night (2) or day (3). The button wins; otherwise follow the page host's data-theme, then the system.
  var picked = null;
  try { picked = localStorage.getItem("theme"); } catch (e) {}
  var root = document.documentElement, mq = matchMedia("(prefers-color-scheme: light)");
  function decide() {
    var t = picked || root.getAttribute("data-theme") || (mq.matches ? "light" : "dark");
    page.dataset.v = t === "light" ? "3" : "2";
  }
  document.getElementById("theme").addEventListener("click", function () {
    picked = page.dataset.v === "3" ? "dark" : "light";
    try { localStorage.setItem("theme", picked); } catch (e) {}
    decide();
  });
  if (mq.addEventListener) mq.addEventListener("change", decide);
  new MutationObserver(decide).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  decide();
})();
