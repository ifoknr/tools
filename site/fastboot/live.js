// Live release data: the site's own copy of GitHub's answer (/gh/, shared by every visitor),
// then GitHub itself. Fills versions, download links, SHA-256 and the latest notes.
var FB = (function () {
  "use strict";
  var REPO = { win: "ifoknr/FastbootStudio", mob: "ifoknr/FastbootStudio-Mobile", comp: "ifoknr/FastbootStudio-Companion" };
  var ASSET = { win: /\.zip$/i, mob: /\.apk$/i, comp: /\.zip$/i };
  var data = {}, waiters = [];
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  function ask(url, headers) {
    return fetch(url, headers ? { headers: headers } : undefined).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (l) { if (!Array.isArray(l)) throw new Error("not a list"); return l; });
  }
  function summarize(id, list) {
    var total = 0, rel = null;
    list.forEach(function (r) { (r.assets || []).forEach(function (a) { total += a.download_count || 0; }); if (!rel && !r.draft && !r.prerelease) rel = r; });
    rel = rel || list[0]; if (!rel) return null;
    var asset = (rel.assets || []).filter(function (a) { return ASSET[id].test(a.name); })[0];
    return { tag: rel.tag_name, date: rel.published_at, url: rel.html_url, asset: asset ? asset.browser_download_url : null,
      size: asset ? asset.size : 0, sha: asset && asset.digest ? String(asset.digest).replace(/^sha256:/, "") : "", downloads: total,
      history: list.filter(function (r) { return !r.draft; }).slice(0, 6).map(function (r) { return { tag: r.tag_name, date: r.published_at, body: r.body || "", url: r.html_url }; }) };
  }
  // Release notes are Arabic bullets, a line "**English**", then English bullets.
  function notes(body, lang) {
    var parts = String(body).split(/^\s*\*\*English\*\*\s*$/m);
    var text = lang === "en" ? (parts[1] || parts[0]) : parts[0];
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
  function size(b) { return b ? (b / 1048576).toFixed(1) + " MB" : ""; }
  function fill(lang) {
    Object.keys(data).forEach(function (id) {
      var r = data[id]; if (!r) return;
      document.querySelectorAll('[data-ver="' + id + '"]').forEach(function (n) { n.textContent = short(r.tag); });
      document.querySelectorAll('[data-dl="' + id + '"]').forEach(function (n) { n.href = r.asset || r.url; });
      document.querySelectorAll('[data-sha="' + id + '"]').forEach(function (n) { if (r.sha) { n.hidden = false; n.textContent = "SHA-256: " + r.sha; } });
    });
    var rels = document.getElementById("rels");
    if (rels && Object.keys(data).length) {
      var names = { win: "Fastboot Studio", mob: "Fastboot Studio Mobile", comp: "Fastboot Studio Companion" };
      rels.innerHTML = ["win", "mob", "comp"].map(function (id) {
        var r = data[id]; if (!r) return "";
        var h = r.history[0], list = h ? notes(h.body, lang).slice(0, 5) : [];
        return '<div class="rel"><small>' + names[id] + '</small><div class="v ltr">' + esc(short(r.tag)) + "</div><small>" + esc(date(r.date, lang)) + "</small>" +
          (list.length ? "<ul>" + list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
          '<a class="go" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + (lang === "en" ? "Full notes" : "الملاحظات كاملة") + "</a></div>";
      }).join("");
    }
    // The downloads section shows once all three apps have answered, so the total is never short.
    var dl = document.getElementById("dl"), ids = ["win", "mob", "comp"];
    if (dl && ids.every(function (id) { return data[id]; })) {
      var max = Math.max.apply(null, ids.map(function (id) { return data[id].downloads; })) || 1, all = 0;
      ids.forEach(function (id) {
        var n = data[id].downloads; all += n;
        document.querySelectorAll('[data-dlc="' + id + '"]').forEach(function (e) { e.textContent = num(n); });
        document.querySelectorAll('[data-dlbar="' + id + '"]').forEach(function (e) { e.style.width = Math.max(2, Math.round(n / max * 100)) + "%"; });
      });
      document.querySelectorAll('[data-dlc="all"]').forEach(function (e) { e.textContent = num(all); });
      dl.hidden = false;
    }
    waiters.forEach(function (f) { f(); });
  }
  function load(lang) {
    Object.keys(REPO).forEach(function (id) {
      ask("/gh/repos/" + REPO[id] + "/releases")
        .catch(function () { return ask("https://api.github.com/repos/" + REPO[id] + "/releases?per_page=100", { Accept: "application/vnd.github+json" }); })
        .then(function (l) { data[id] = summarize(id, l); fill(FB.lang()); })
        .catch(function () {});
    });
  }
  return { load: load, fill: fill, data: data, notes: notes, date: date, num: num, size: size, short: short, esc: esc,
    lang: function () { return document.getElementById("page").lang === "en" ? "en" : "ar"; },
    onData: function (f) { waiters.push(f); } };
})();
FB.load();
