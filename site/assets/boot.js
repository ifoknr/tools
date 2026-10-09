// Applied before the page paints, so a saved theme or language never flashes the other one.
(function () {
  var d = document.documentElement, theme = null, lang = null;
  try { theme = localStorage.getItem("theme"); lang = localStorage.getItem("lang"); } catch (e) {}
  if (theme !== "light" && theme !== "dark")
    theme = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  if (lang !== "ar" && lang !== "en")
    lang = /^ar\b/i.test(navigator.language || "") ? "ar" : "en";
  d.setAttribute("data-theme", theme);
  d.lang = lang;
  d.dir = lang === "ar" ? "rtl" : "ltr";
})();
