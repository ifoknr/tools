(function () {
  "use strict";
  var CACHE_KEY = "releases-v2";
  var CACHE_MS = 60 * 60 * 1000; // GitHub allows 60 unauthenticated requests an hour per visitor.
  var root = document.documentElement;
  var TOOLS = []; // from tools.json, shared with the Telegram bot
  var byId = {};
  var releases = {}; // repo -> { tag, date, url, asset, downloads }
  var apiFailed = false;

  var ORDER = ["fastbootstudio", "mobile", "companion", "nextzygisk", "nextwheel", "nextsusfs", "nextcore"];
  var WIDE = { fastbootstudio: "laptop", nextcore: "banner" };
  var KIND = { fastbootstudio: "win", mobile: "apk" };
  var GROUPS = [["pc", "g_pc"], ["hide", "g_hide"], ["perf", "g_perf"]];
  var LAYERS = [["nextwheel", "layer_apps"], ["nextzygisk", "layer_zygote"], ["nextsusfs", "layer_kernel"]];

  var S = {
    ar: {
      home: "الرئيسية", g_pc: "Fastboot Studio", g_hide: "إخفاء الروت", g_perf: "الأداء", links: "روابط", menu: "القائمة", theme: "الوضع الفاتح أو الداكن",
      skip: "تخطَّ إلى المحتوى",
      eyebrow: "مجانية ومفتوحة المصدر",
      h1: "أدوات أندرويد للفلاش، وإخفاء الروت، والأداء",
      lead: "تطبيق ويندوز وتطبيق جوال يفلّشون جوالك ويحمونه من الأخطاء، وموديولات تخفي الروت من الطبقات الثلاث، وموديول أداء آمن لأي معالج.",
      browse: "تصفّح الأدوات", tools: "الأدوات", downloads: "التحميلات", updated: "آخر تحديث", latest: "أحدث إصدار",
      sec_pc: "الفلاش والجوال", sec_pc_d: "على الكمبيوتر، على الجوال، ومن داخل الروت",
      sec_hide: "منظومة NEXT", sec_hide_d: "ثلاث طبقات تخفي الروت، كل وحدة تعرض حالة الباقي",
      sec_perf: "الأداء", sec_perf_d: "أداء ثابت بدون ما تلمس الحماية الحرارية",
      details: "التفاصيل", download: "تحميل", download_v: "تحميل {v}", source: "المصدر", changes: "التغييرات",
      version: "الإصدار", date: "التاريخ", dls: "التحميلات", license: "الترخيص", n_dls: "تحميل",
      what: "وش يسوي", needs: "يحتاج", install: "التثبيت", built: "مبني على {n} من {b}.", uses: "يستخدم {n} من {b}.",
      layer_apps: "التطبيقات", layer_zygote: "Zygote", layer_kernel: "النواة",
      st_mod: ["حمّل ملف zip من زر التحميل", "ركّبه من مدير الروت: KernelSU أو Magisk أو APatch", "أعد تشغيل الجوال، وافتح الواجهة من مدير الروت"],
      st_win: ["ثبّته بأمر واحد من winget، أو حمّل ملف zip", "شغّل Fastboot Studio ووصّل جوالك", "اتبع صفحة الترحيب: اللغة، الصفحات، والفحص"],
      st_apk: ["حمّل ملف APK، أو تابع التحديثات من Obtainium", "اسمح بصلاحية الروت أول ما تفتحه", "للجوال الثاني: وصّله بكيبل OTG"],
      copy: "نسخ", copied: "تم النسخ", prev: "السابق", next: "التالي", back: "كل الأدوات",
      dev: "المطوّر", telegram: "قروب تلقرام",
      lang: "English",
      months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    },
    en: {
      home: "Home", g_pc: "Fastboot Studio", g_hide: "Root hiding", g_perf: "Performance", links: "Links", menu: "Menu", theme: "Light or dark theme",
      skip: "Skip to content",
      eyebrow: "Free and open source",
      h1: "Android tools for flashing, root hiding and performance",
      lead: "A Windows app and a phone app that flash your phone and guard it against mistakes, modules that hide root at all three layers, and a performance module that is safe on any SoC.",
      browse: "Browse the tools", tools: "Tools", downloads: "Downloads", updated: "Last update", latest: "Newest release",
      sec_pc: "Flashing and the phone", sec_pc_d: "On the PC, on the phone, and from inside root",
      sec_hide: "The NEXT stack", sec_hide_d: "Three layers of root hiding; each shows the others' status",
      sec_perf: "Performance", sec_perf_d: "Steady performance without touching thermal protection",
      details: "Details", download: "Download", download_v: "Download {v}", source: "Source", changes: "Changelog",
      version: "Version", date: "Date", dls: "Downloads", license: "License", n_dls: "downloads",
      what: "What it does", needs: "Needs", install: "Install", built: "Based on {n} by {b}.", uses: "Uses {n} by {b}.",
      layer_apps: "Apps", layer_zygote: "Zygote", layer_kernel: "Kernel",
      st_mod: ["Download the zip with the button above", "Install it in your root manager: KernelSU, Magisk or APatch", "Restart, then open its WebUI from the root manager"],
      st_win: ["Install with one winget command, or download the zip", "Run Fastboot Studio and connect your phone", "Follow the welcome steps: language, pages, check"],
      st_apk: ["Download the APK, or follow updates with Obtainium", "Allow root when it first opens", "For a second phone: connect it with an OTG cable"],
      copy: "Copy", copied: "Copied", prev: "Previous", next: "Next", back: "All tools",
      dev: "Developer", telegram: "Telegram group",
      lang: "عربي",
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    }
  };

  var SV = {
    home: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 4-18 7.2 6 2.1L19 7l-8 8 .5 5 3-3.5 4 3z"/></svg>',
    gh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1.3-4-2-6-2.5m12 5v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.4 4.4 0 0 0-.1-3.2s-1-.3-3.3 1.3a11.3 11.3 0 0 0-6 0C6.7 2.6 5.7 2.9 5.7 2.9a4.4 4.4 0 0 0-.1 3.2A4.7 4.7 0 0 0 4.3 9.3c0 4.7 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21"/></svg>',
    dl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    ck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h9"/></svg>'
  };

  function store(key, value) {
    try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); } catch (e) { return null; }
  }
  function lang() { return root.lang === "en" ? "en" : "ar"; }
  function s(k) { return S[lang()][k]; }
  function fill(str, o) { return str.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  function txt(t) { return t[lang()] || t.en; }
  function num(n) { return Number(n || 0).toLocaleString("en-US"); }
  function date(iso) {
    var d = new Date(iso);
    if (!iso || isNaN(d)) return "—";
    return d.getDate() + " " + s("months")[d.getMonth()] + " " + d.getFullYear();
  }
  function short(tag) { return String(tag || "").replace(/-\d+$/, ""); }

  // True when version a is newer than b ("v2.5.1" > "v2.5.0", "v1.0.5-601" > "v1.0.5").
  function newer(a, b) {
    var x = String(a || "").match(/\d+/g) || [], y = String(b || "").match(/\d+/g) || [];
    for (var i = 0; i < Math.max(x.length, y.length); i++) {
      var d = (+x[i] || 0) - (+y[i] || 0);
      if (d) return d > 0;
    }
    return false;
  }
  // Release data saved by an earlier visit, or GitHub's answer when its rate limit is hit
  // (phones on mobile data often share one address), can be older than tools.json.
  function outdated(data) {
    return TOOLS.some(function (tool) { var r = data[tool.repo]; return r && newer(tool.version, r.tag); });
  }

  // Before GitHub answers, a tool shows the version tools.json names.
  function rel(t) {
    var r = releases[t.repo];
    if (r && !newer(t.version, r.tag)) return r;
    return { tag: t.version, date: "", downloads: r ? r.downloads : 0, url: "https://github.com/" + t.repo + "/releases/latest", asset: null };
  }
  function icon(t) { return esc(t.icon); }
  function nm(t, cls) {
    return '<img class="' + cls + " " + cls + '-dark" src="assets/img/names/' + t.id + '-dark.svg" alt="' + esc(t.name.join("")) + '">' +
      '<img class="' + cls + " " + cls + '-light" src="assets/img/names/' + t.id + '-light.svg" alt="">';
  }
  function vid(t) {
    return '<video src="assets/media/' + t.id + '.mp4" poster="assets/media/' + t.id + '.jpg" muted loop playsinline preload="metadata" aria-hidden="true"></video>';
  }
  function ext(href, cls, body) { return '<a class="' + cls + '" href="' + esc(href) + '" target="_blank" rel="noopener">' + body + "</a>"; }

  function menu(cur) {
    var h = '<a class="nav' + (cur === "home" ? " on" : "") + '" href="#home"' + (cur === "home" ? ' aria-current="page"' : "") + ">" + SV.home + "<span>" + s("home") + "</span></a>";
    GROUPS.forEach(function (g) {
      h += '<div class="label">' + s(g[1]) + "</div>";
      TOOLS.filter(function (x) { return x.group === g[0]; }).forEach(function (t) {
        var on = cur === t.id;
        h += '<a class="nav' + (on ? " on" : "") + '" href="#' + t.id + '"' + (on ? ' aria-current="page"' : "") + '><img class="ic" src="' + icon(t) + '" alt="">' + nm(t, "nm") + '<span class="ver">' + esc(short(rel(t).tag)) + "</span></a>";
      });
    });
    h += '<div class="label">' + s("links") + "</div>" +
      ext("https://t.me/BeNeXTBrO", "nav", SV.tg.replace("<svg", '<svg class="ic"') + "<span>" + s("telegram") + "</span>") +
      ext("https://github.com/ifoknr", "nav", SV.gh.replace("<svg", '<svg class="ic"') + "<span>GitHub</span>");
    return h;
  }

  function card(t) {
    var r = rel(t), wide = WIDE[t.id];
    var media = wide ? '<div class="' + wide + '">' + vid(t) + "</div>" : vid(t);
    return '<article class="tcard' + (wide ? " feature" : "") + '">' +
      '<a class="tmedia ' + (wide || "portrait") + '" href="#' + t.id + '" tabindex="-1" aria-hidden="true">' + media + "</a>" +
      '<div class="tbody">' +
        '<div class="thead"><img class="ic" src="' + icon(t) + '" alt=""><div>' + nm(t, "tname") + "<small>" + esc(short(r.tag)) + " · " + num(r.downloads) + " " + s("n_dls") + "</small></div></div>" +
        '<p class="ttag">' + esc(txt(t).tagline) + "</p>" +
        (wide ? '<p class="tab">' + esc(txt(t).about) + "</p>" : "") +
        '<div class="tfoot"><a class="pill-btn tonal small" href="#' + t.id + '">' + s("details") + "</a>" + ext(r.asset || r.url, "pill-btn filled small", SV.dl + s("download")) + "</div>" +
      "</div></article>";
  }

  function stack(cur) {
    return '<div class="stack">' + LAYERS.map(function (l, i) {
      var t = byId[l[0]];
      if (!t) return "";
      return '<a class="layer' + (cur === t.id ? " on" : "") + '" href="#' + t.id + '"><span class="n">' + (i + 1) + "</span><div><b>" + esc(t.name.join("")) + "</b><small>" + s(l[1]) + '</small></div><span class="ver">' + esc(short(rel(t).tag)) + "</span></a>";
    }).join("") + "</div>";
  }

  function foot() {
    return '<footer class="foot"><div class="dev"><img class="mark sig-dark" src="assets/img/ifoknr-mark.svg?v=4" alt=""><img class="mark sig-light" src="assets/img/ifoknr-mark-light.svg?v=4" alt="">' +
      '<div><img class="sig sig-dark" src="assets/img/ifoknr-dark.svg?v=4" alt="IFOKNR"><img class="sig sig-light" src="assets/img/ifoknr-light.svg?v=4" alt=""><small>' + s("dev") + "</small></div></div>" +
      '<div class="links">' + ext("https://t.me/IFOKNR1", "pill-btn tonal small", SV.tg + "@IFOKNR1") + ext("https://t.me/BeNeXTBrO", "pill-btn outlined small", s("telegram")) + ext("https://github.com/ifoknr", "pill-btn outlined small", SV.gh + "GitHub") + "</div></footer>";
  }

  function home() {
    var total = 0, last = null;
    TOOLS.forEach(function (t) {
      var r = rel(t);
      total += r.downloads || 0;
      if (r.date && (!last || r.date > last.r.date)) last = { t: t, r: r };
    });
    var sec = function (g, h, d) {
      return '<section class="section" id="' + (g === "hide" ? "stack" : "sec-" + g) + '"><div class="sec-head"><div><h2>' + s(h) + "</h2><p>" + s(d) + "</p></div></div>" +
        (g === "hide" ? stack() : "") +
        '<div class="grid g-' + g + '">' + TOOLS.filter(function (t) { return t.group === g; }).map(card).join("") + "</div></section>";
    };
    var fbs = byId.fastbootstudio, mob = byId.mobile;
    return '<section class="hero"><div>' +
        '<div class="eyebrow"><span class="chip blue">' + s("eyebrow") + '</span><span class="chip">' + TOOLS.length + " " + s("tools") + "</span></div>" +
        "<h1>" + s("h1") + '</h1><p class="lead">' + s("lead") + "</p>" +
        '<div class="cta"><a class="pill-btn filled" href="#tools">' + SV.list + s("browse") + "</a>" + ext("https://t.me/BeNeXTBrO", "pill-btn tonal", SV.tg + "Telegram") + ext("https://github.com/ifoknr", "pill-btn outlined", SV.gh + "GitHub") + "</div></div>" +
        '<div class="reel" aria-hidden="true">' + (fbs ? '<div class="laptop">' + vid(fbs) + "</div>" : "") + (mob ? '<div class="phone">' + vid(mob) + "</div>" : "") + "</div>" +
      "</section>" +
      '<div class="strips"><div class="strip"><span>' + s("tools") + "</span><b>" + TOOLS.length + '</b></div><div class="strip"><span>' + s("downloads") + "</span><b>" + num(total) + "</b></div>" +
        '<div class="strip"><span>' + s("updated") + "</span><b>" + (last ? date(last.r.date) : "—") + '</b></div><div class="strip"><span>' + s("latest") + "</span><b>" + (last ? esc(last.t.name.join("") + " " + short(last.r.tag)) : "—") + "</b></div></div>" +
      '<div id="tools"></div>' +
      sec("pc", "sec_pc", "sec_pc_d") + sec("hide", "sec_hide", "sec_hide_d") + sec("perf", "sec_perf", "sec_perf_d") + foot();
  }

  function tool(t) {
    var r = rel(t), x = txt(t), i = TOOLS.indexOf(t), kind = KIND[t.id] || "mod";
    var prev = TOOLS[(i - 1 + TOOLS.length) % TOOLS.length], next = TOOLS[(i + 1) % TOOLS.length];
    var link = function (o) { return '<a href="' + esc(o.url) + '" target="_blank" rel="noopener">' + esc(o.name) + "</a>"; };
    var credit = t.base ? fill(s("built"), { n: link(t.base), b: esc(t.base.by) }) : t.uses ? fill(s("uses"), { n: link(t.uses), b: esc(t.uses.by) }) : "";
    if (t.base && t.uses) credit += " " + fill(s("uses"), { n: link(t.uses), b: esc(t.uses.by) });
    var shape = WIDE[t.id] || "phone";
    return '<a class="back" href="#home">' + SV.arrow + s("back") + "</a>" +
      '<section class="thero' + (WIDE[t.id] ? "" : " portrait") + '">' +
        '<div><div class="cookie"><img src="' + icon(t) + '" alt=""></div><h1 class="bigname-h">' + nm(t, "bigname") + "</h1>" +
          '<p class="tl">' + esc(x.tagline) + '</p><p class="ab">' + esc(x.about) + "</p>" +
          '<div class="cta">' + ext(r.asset || r.url, "pill-btn filled", SV.dl + fill(s("download_v"), { v: esc(short(r.tag)) })) +
            ext("https://github.com/" + t.repo + "/releases", "pill-btn tonal", s("changes")) +
            ext("https://github.com/" + t.repo, "pill-btn outlined", SV.gh + s("source")) +
            (t.xda ? ext(t.xda, "pill-btn outlined", "XDA") : "") + "</div></div>" +
        '<div class="media" aria-hidden="true"><div class="' + shape + '">' + vid(t) + "</div></div>" +
      "</section>" +
      '<div class="strips"><div class="strip"><span>' + s("version") + "</span><b>" + esc(r.tag) + '</b></div><div class="strip"><span>' + s("date") + "</span><b>" + date(r.date) + "</b></div>" +
        '<div class="strip"><span>' + s("dls") + "</span><b>" + num(r.downloads) + '</b></div><div class="strip"><span>' + s("license") + "</span><b>" + esc(t.license) + "</b></div></div>" +
      '<div class="cols">' +
        '<div class="card"><h2>' + s("what") + "</h2>" + x.points.map(function (p) { return '<div class="feat"><span class="ck">' + SV.ck + "</span><span>" + esc(p) + "</span></div>"; }).join("") + "</div>" +
        '<div class="stackc">' +
          '<div class="card"><h2>' + s("install") + "</h2>" + s("st_" + kind).map(function (st, k) { return '<div class="step"><span class="n">' + (k + 1) + "</span><span>" + st + "</span></div>"; }).join("") +
            (t.winget ? '<div class="code"><code>' + esc(t.winget) + '</code><button class="pill-btn tonal small" type="button" data-act="copy" data-copy="' + esc(t.winget) + '">' + s("copy") + "</button></div>" : "") + "</div>" +
          '<div class="card"><h2>' + s("needs") + '</h2><div class="chips">' + (t.needs || []).map(function (n) { return '<span class="chip">' + esc(n) + "</span>"; }).join("") + "</div>" +
            (credit ? '<p class="muted credit">' + credit + "</p>" : "") + "</div>" +
        "</div>" +
      "</div>" +
      (t.group === "hide" ? '<section class="section"><div class="sec-head"><div><h2>' + s("sec_hide") + "</h2><p>" + s("sec_hide_d") + "</p></div></div>" + stack(t.id) + "</section>" : "") +
      '<nav class="pager" aria-label="' + s("tools") + '"><a href="#' + prev.id + '"><img class="i" src="' + icon(prev) + '" alt=""><div><small>' + s("prev") + "</small>" + esc(prev.name.join("")) + "</div></a>" +
        '<a class="next" href="#' + next.id + '"><div><small>' + s("next") + "</small>" + esc(next.name.join("")) + '</div><img class="i" src="' + icon(next) + '" alt=""></a></nav>' +
      foot();
  }

  // Videos play only while on screen; with reduced motion they stay on their poster.
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { var p = e.target.play(); if (p) p.catch(function () {}); } else e.target.pause(); });
  }, { threshold: 0.2 }) : null;

  var shown = null;
  function render(fresh) {
    var id = location.hash.slice(1).replace(/^tool-/, ""); // old links: #tool-nextcore
    var t = byId[id];
    var cur = t ? id : "home";
    document.querySelectorAll("[data-i18n]").forEach(function (n) { n.textContent = s(n.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-label]").forEach(function (n) { n.setAttribute("aria-label", s(n.getAttribute("data-i18n-label"))); });
    document.getElementById("menu").innerHTML = menu(cur);
    document.getElementById("menu-sheet").innerHTML = menu(cur);
    document.querySelectorAll("[data-act=lang]").forEach(function (b) { b.textContent = s("lang"); });
    document.title = t ? t.name.join("") + " · IFOKNR Tools" : "IFOKNR Tools";
    var page = document.getElementById("page");
    var y = window.scrollY;
    page.innerHTML = t ? tool(t) : home();
    if (fresh) window.scrollTo(0, y); // new release data: stay where the reader is
    else if (id && document.getElementById(id) && !t) document.getElementById(id).scrollIntoView();
    else if (shown !== null) window.scrollTo(0, 0);
    shown = cur;
    document.body.classList.remove("open");
    if (io && !still) document.querySelectorAll("video").forEach(function (v) { io.observe(v); });
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-act]");
    if (!a) {
      if (e.target.closest(".sheet a")) document.body.classList.remove("open");
      return;
    }
    var act = a.getAttribute("data-act");
    if (act === "lang") {
      var next = lang() === "ar" ? "en" : "ar";
      root.lang = next; root.dir = next === "ar" ? "rtl" : "ltr";
      store("lang", next);
      render(true);
    } else if (act === "theme") {
      var theme = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", theme);
      store("theme", theme);
    } else if (act === "menu") {
      document.body.classList.add("open");
    } else if (act === "close") {
      document.body.classList.remove("open");
    } else if (act === "copy") {
      var done = function () { a.textContent = s("copied"); setTimeout(function () { a.textContent = s("copy"); }, 1500); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(a.getAttribute("data-copy")).then(done, function () {});
    }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") document.body.classList.remove("open"); });
  window.addEventListener("hashchange", function () { render(false); });

  // Releases from GitHub: all releases of each repo, to count downloads across versions.
  function summarize(tool, list) {
    var total = 0, latest = null;
    list.forEach(function (r) {
      (r.assets || []).forEach(function (a) { total += a.download_count || 0; });
      if (!latest && !r.draft && !r.prerelease) latest = r;
    });
    latest = latest || list[0];
    if (!latest) return null;
    var asset = (latest.assets || []).filter(function (a) { return new RegExp(tool.asset, "i").test(a.name); })[0];
    return { tag: latest.tag_name, pre: !!latest.prerelease, date: latest.published_at, url: latest.html_url, asset: asset ? asset.browser_download_url : null, downloads: total };
  }

  function load() {
    var cached = null;
    try { cached = JSON.parse(store(CACHE_KEY) || "null"); } catch (e) {}
    if (cached && Date.now() - cached.at < CACHE_MS && !outdated(cached.data)) {
      releases = cached.data;
      render(false);
      return;
    }
    if (cached) releases = cached.data;
    render(false);

    Promise.all(TOOLS.filter(function (x) { return x.repo; }).map(function (tool) {
      // The site's own copy first (shared by every visitor, so GitHub's hourly limit is never
      // reached), then GitHub itself, for a server that does not have it.
      function ask(url, headers) {
        return fetch(url, headers ? { headers: headers } : undefined)
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (list) { if (!Array.isArray(list)) throw new Error("not a list"); return list; });
      }
      return ask("/gh/repos/" + tool.repo + "/releases")
        .catch(function () { return ask("https://api.github.com/repos/" + tool.repo + "/releases?per_page=100", { Accept: "application/vnd.github+json" }); })
        .then(function (list) { return [tool.repo, summarize(tool, list)]; })
        .catch(function () { apiFailed = true; return [tool.repo, releases[tool.repo] || null]; });
    })).then(function (pairs) {
      var fresh = {};
      pairs.forEach(function (p) { if (p[1]) fresh[p[0]] = p[1]; });
      releases = fresh;
      if (!apiFailed) store(CACHE_KEY, JSON.stringify({ at: Date.now(), data: fresh }));
      render(true);
    });
  }

  function start(list) {
    TOOLS = list.slice().sort(function (a, b) { return ORDER.indexOf(a.id) - ORDER.indexOf(b.id); });
    TOOLS.forEach(function (t) { byId[t.id] = t; });
    load();
  }

  // tools.json inside the page when the image put it there (one request less), otherwise fetched.
  var inline = null;
  try { inline = JSON.parse(document.getElementById("tools-data").textContent); } catch (e) {}
  if (Array.isArray(inline) && inline.length) start(inline);
  else fetch("assets/tools.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(start);
})();
