// Live release data for the three tools: the site's own copy of GitHub's answer (/gh/, shared by
// every visitor) first, then GitHub. Fills versions, downloads, dates and download links.
var LIVE = (function () {
  "use strict";
  var REPO = { zy: "ifoknr/NexTZygisk", wh: "ifoknr/NextWheel", su: "ifoknr/NextSUSFS" };
  var ASSET = { zy: /release\.zip$/i, wh: /\.zip$/i, su: /\.zip$/i };
  var data = {}, waiters = [];
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  function ask(url, h) {
    return fetch(url, h ? { headers: h } : undefined).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (l) { if (!Array.isArray(l)) throw new Error("not a list"); return l; });
  }
  function summarize(id, list) {
    var total = 0, rel = null;
    list.forEach(function (r) { (r.assets || []).forEach(function (a) { total += a.download_count || 0; }); if (!rel && !r.draft && !r.prerelease) rel = r; });
    rel = rel || list[0]; if (!rel) return null;
    var asset = (rel.assets || []).filter(function (a) { return ASSET[id].test(a.name); })[0];
    return { tag: rel.tag_name, date: rel.published_at, url: rel.html_url, asset: asset ? asset.browser_download_url : null, size: asset ? asset.size : 0,
      sha: asset && asset.digest ? String(asset.digest).replace(/^sha256:/, "") : "", downloads: total,
      history: list.filter(function (r) { return !r.draft; }).slice(0, 6).map(function (r) {
        var n = 0; (r.assets || []).forEach(function (a) { n += a.download_count || 0; });
        return { tag: r.tag_name, date: r.published_at, body: r.body || "", url: r.html_url, downloads: n };
      }) };
  }
  // Release notes: Arabic bullets, a line "**English**", then English bullets.
  function notes(body, lang) {
    var parts = String(body).split(/^\s*\*\*English\*\*\s*$/m), text = lang === "en" ? (parts[1] || parts[0]) : parts[0];
    return text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(function (l) { return /^[-*•]\s+/.test(l); })
      .map(function (l) { return l.replace(/^[-*•]\s+/, "").replace(/\*\*|`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); });
  }
  function short(t) { return String(t || "").replace(/-\d+$/, ""); }
  function date(iso, lang) {
    var d = new Date(iso); if (!iso || isNaN(d)) return "";
    var m = lang === "en" ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] : ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
    return d.getDate() + " " + m[d.getMonth()] + " " + d.getFullYear();
  }
  function num(n) { return Number(n || 0).toLocaleString("en-US"); }
  function lang() { return window.IF && IF.lang ? IF.lang() : "ar"; }
  function fill() {
    var total = 0, last = null, got = 0;
    Object.keys(REPO).forEach(function (id) {
      var r = data[id]; if (!r) return; got++;
      total += r.downloads;
      if (!last || r.date > last.date) last = r;
      document.querySelectorAll('[data-ver="' + id + '"]').forEach(function (n) { n.textContent = short(r.tag); });
      document.querySelectorAll('[data-dls="' + id + '"]').forEach(function (n) { n.textContent = num(r.downloads); });
      document.querySelectorAll('[data-dl="' + id + '"]').forEach(function (n) { n.href = r.asset || r.url; });
    });
    if (got) {
      document.querySelectorAll("[data-total]").forEach(function (n) { n.textContent = num(total); });
      document.querySelectorAll("[data-last]").forEach(function (n) { n.textContent = date(last.date, lang()); });
    }
    waiters.forEach(function (f) { f(); });
  }
  function load() {
    Object.keys(REPO).forEach(function (id) {
      ask("/gh/repos/" + REPO[id] + "/releases")
        .catch(function () { return ask("https://api.github.com/repos/" + REPO[id] + "/releases?per_page=100", { Accept: "application/vnd.github+json" }); })
        .then(function (l) { data[id] = summarize(id, l); fill(); })
        .catch(function () {
          // No answer (offline, or a preview that cannot reach GitHub): say so instead of a dot.
          document.querySelectorAll('[data-dls="' + id + '"]').forEach(function (n) { if (n.textContent === "…") n.textContent = "—"; });
          document.querySelectorAll("[data-total],[data-last]").forEach(function (n) { if (n.textContent === "…") n.textContent = "—"; });
        });
    });
  }
  if (window.IF && IF.onLang) IF.onLang(fill);
  load();
  return { data: data, notes: notes, date: date, num: num, short: short, esc: esc, onData: function (f) { waiters.push(f); }, REPO: REPO };
})();
