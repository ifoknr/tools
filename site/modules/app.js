(function () {
  "use strict";
  // The modules, from the site's tools.json (versions and texts as released).
  var MODS = [
    { id: "nextzygisk", v: "v1.0.8", layer: "zygote", needs: ["KernelSU", "ReSukiSU", "Magisk", "APatch", "Android 7.1+"],
      ar: ["Zygisk مستقل لكل مدراء الروت.", ["فتح أسرع للتطبيقات: الإجابة تجي من الذاكرة بدل قاعدة البيانات", "أكثر من 12 إصلاح في الخدمة والمراقبة والكود داخل Zygote", "لوحة تحكم داخل مدير الروت: الحالة والوحدات والإخفاء"]],
      en: ["Standalone Zygisk for every root manager.", ["Faster app launches: answers come from memory, not the database", "More than a dozen fixes in the daemon, monitor and Zygote code", "A dashboard in your root manager: status, modules and hiding"]] },
    { id: "nextwheel", v: "v0.0.19", layer: "apps", needs: ["NextZygisk / ReZygisk", "Magisk", "KernelSU", "APatch", "Android 7.1+"],
      ar: ["طبقة التطبيقات: يخفي Zygisk والروت داخل التطبيقات.", ["لوحة حية: الإخفاء شغّال، انهار، أو Zygisk وقف", "يشتغل مع NextZygisk أو ReZygisk", "واجهة بـ 11 لغة منها العربي، للجوال والتابلت"]],
      en: ["The app layer: hides Zygisk and root inside apps.", ["Live dashboard: working, crashed, or Zygisk stopped", "Works with NextZygisk and ReZygisk", "WebUI in 11 languages including Arabic, for phones and tablets"]] },
    { id: "nextsusfs", v: "v0.0.15", layer: "kernel", needs: ["KernelSU / Next / ReSukiSU / SukiSU", "SuSFS v2"],
      ar: ["إخفاء الروت من مستوى النواة مع SuSFS.", ["يخفي منظومة NEXT لحاله مع كل إقلاع", "أكثر من 40 إعداد في 7 صفحات، وقوائم إخفاء خاصة فيك", "أدوات الفحص داخل الواجهة: Native Detector وغيره"]],
      en: ["Kernel-level root hiding with SuSFS.", ["Hides the NEXT stack automatically at every boot", "40+ settings across 7 pages, plus your own hide lists", "Detector apps one tap away to check the result"]] },
    { id: "nextcore", v: "v2.0.1", layer: "perf", wide: true, needs: ["KernelSU", "APatch", "Magisk", "Android 10+"],
      ar: ["أداء مستدام وملفات ألعاب تلقائية، والحماية الحرارية تبقى شغّالة.", ["دعم كامل لمعالجات MediaTek و Snapdragon و Exynos و Tensor و Unisoc", "ما يقفل ملفات النواة ولا يلمس خدمات الحرارة", "مراقب عائم: 20 قراءة، والإطارات من SurfaceFlinger مباشرة"]],
      en: ["Sustained performance and automatic game profiles, with thermal protection kept on.", ["Full support for MediaTek, Snapdragon, Exynos, Tensor and Unisoc", "Never locks kernel nodes or touches thermal services", "Floating monitor: 20 readings, FPS straight from SurfaceFlinger"]] }
  ];
  // Downloads of every release, from GitHub on 3 Nov 2026: [tag, date, downloads, pre-release].
  // The real site reads these live through its /gh cache.
  var DL = {"nextzygisk":[["v1.0.0-566","2026-10-04",3,1],["v1.0.2-581","2026-10-06",13,0],["v1.0.1-579","2026-10-06",2,0],["v1.0.3-595","2026-10-07",7,0],["v1.0.5-601","2026-10-08",18,0],["v1.0.4-598","2026-10-08",9,0],["v1.0.6-612","2026-10-12",58,0],["v1.0.7-614","2026-10-30",25,0],["v1.0.8-616","2026-11-02",13,0]],"nextwheel":[["v0.0.14","2026-10-06",5,0],["v0.0.13","2026-10-06",3,0],["v0.0.12","2026-10-06",2,0],["v0.0.15","2026-10-07",15,0],["v0.0.16","2026-10-12",23,0],["v0.0.15-test.9","2026-10-12",1,1],["v0.0.17","2026-10-16",51,0],["v0.0.18","2026-10-30",21,0],["v0.0.19","2026-11-02",11,0]],"nextsusfs":[["v0.0.5","2026-10-06",10,0],["v0.0.4","2026-10-06",5,0],["v0.0.6","2026-10-07",6,0],["v0.0.7","2026-10-08",36,0],["v0.0.10","2026-10-12",16,0],["v0.0.9","2026-10-12",5,0],["v0.0.9-test.12","2026-10-12",4,1],["v0.0.8","2026-10-12",7,0],["v0.0.12","2026-10-15",14,0],["v0.0.11","2026-10-15",6,0],["v0.0.13","2026-10-16",86,0],["v0.0.14","2026-10-30",37,0],["v0.0.15","2026-11-02",12,0]],"nextcore":[["v2.0.0","2026-10-11",417,0],["v2.0.1","2026-10-30",60,0]]};
  var REPOS = { nextzygisk: "ifoknr/NexTZygisk", nextwheel: "ifoknr/NextWheel", nextsusfs: "ifoknr/NextSUSFS", nextcore: "ifoknr/NEXTCORE" };
  var NAMES = { nextzygisk: "NextZygisk", nextwheel: "NextWheel", nextsusfs: "NextSUSFS", nextcore: "NextCore" };
  var T = {
    ar: {
      n1: "الموديولات", n2: "المنظومة", n3: "القروب", lang: "English", group: "قروب تلقرام", browse: "تصفّح الموديولات",
      tag: "موديولات روت · KernelSU و Magisk و APatch", h1a: "اخفِ الروت في كل طبقة،", h1b: "وخلّ جوالك ثابت",
      lead: "منظومة NEXT تخفي الروت في التطبيقات و Zygote والنواة، و NextCore يعطيك أداء ثابت بدون ما يلمس الحماية الحرارية.",
      c1: "2 من 2 Zygote", c2: "9/9 ميزات النواة", c3: "الإخفاء شغّال", c4: "متوازن",
      m_tag: "الموديولات", m_h1: "أربع موديولات،", m_h2: "مفتوحة المصدر",
      m_d: "تتركّب من مدير الروت، وتتحدث منه بعد.",
      details: "التفاصيل", download: "تحميل",
      layer: { apps: "طبقة التطبيقات", zygote: "طبقة Zygote", kernel: "طبقة النواة", perf: "الأداء" },
      s_tag: "المنظومة", s_h1: "طبقة طبقة مع", s_d: "كل موديول يشتغل لحاله، ومع بعض يخفون الروت في الطبقات الثلاث، وكل واحد يوريك حالة الباقي.",
      d_tag: "الأرقام", d_h1: "التحميلات من", d_h2: "GitHub", d_d: "مجموع تحميلات كل الإصدارات، وكم نزّل الناس من كل إصدار. الأرقام من GitHub مباشرة، وتتحدث كل كم دقيقة.",
      total: "كل التحميلات", mods: "4 موديولات، كل الإصدارات", n_dl: "تحميل", latest: "آخر إصدار", releases: "إصدار", per: "التحميلات لكل إصدار", test: "تجريبي",
      table: "كل الأرقام في جدول", c_ver: "الإصدار", c_date: "التاريخ", c_dl: "التحميلات", months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
      j_h1: "عندك سؤال أو فكرة؟", j_h2: "تعال القروب", j_d: "الإصدارات الجديدة والتجريبية تنزل في القروب أول، ومعها الشرح.",
      to_home: "كل الأدوات", fine: "© 2026 IFOKNR · مفتوحة المصدر"
    },
    en: {
      n1: "Modules", n2: "The stack", n3: "Group", lang: "عربي", group: "Telegram group", browse: "Browse the modules",
      tag: "Root modules · KernelSU, Magisk and APatch", h1a: "Hide root at every layer,", h1b: "and keep your phone steady",
      lead: "The NEXT stack hides root in apps, in Zygote and in the kernel, and NextCore gives steady performance without touching thermal protection.",
      c1: "2 of 2 Zygotes", c2: "9/9 kernel features", c3: "Hiding is on", c4: "Balanced",
      m_tag: "Modules", m_h1: "Four modules,", m_h2: "all open source",
      m_d: "They install from your root manager, and update from it too.",
      details: "Details", download: "Download",
      layer: { apps: "App layer", zygote: "Zygote layer", kernel: "Kernel layer", perf: "Performance" },
      s_tag: "The stack", s_h1: "Layer by layer with", s_d: "Each module works on its own; together they hide root at all three layers, and each shows the others' status.",
      d_tag: "Numbers", d_h1: "Downloads from", d_h2: "GitHub", d_d: "All releases added up, and how many people took each one. The numbers come straight from GitHub and refresh every few minutes.",
      total: "All downloads", mods: "4 modules, every release", n_dl: "downloads", latest: "Latest", releases: "releases", per: "Downloads per release", test: "test",
      table: "All the numbers in a table", c_ver: "Version", c_date: "Date", c_dl: "Downloads", months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      j_h1: "A question or an idea?", j_h2: "Come to the group", j_d: "New releases and test builds land in the group first, with how to use them.",
      to_home: "All tools", fine: "© 2026 IFOKNR · open source"
    }
  };
  var qs = new URLSearchParams(location.search), root = document.documentElement;
  var L = qs.get("lang") === "en" ? "en" : "ar";
  function e(s) { return String(s).replace(/[&<>"]/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  var MORE = '<svg viewBox="0 0 24 24"><path d="M8 5l8 7-8 7z"/></svg>';

  function render() {
    var t = T[L];
    root.lang = L; root.dir = L === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-t]").forEach(function (n) { n.textContent = t[n.getAttribute("data-t")]; });
    document.getElementById("cards").innerHTML = MODS.map(function (m) {
      return '<article class="notch"><div class="in"><div class="mod-top"><img class="icon" src="img/' + m.id + '.svg" alt=""><div><img class="nm" src="img/' + m.id + '-dark.svg" alt="' + NAMES[m.id] + '"><small dir="ltr">' + m.v + '</small></div><span class="layer-tag">' + e(t.layer[m.layer]) + "</span></div>" +
        "<p>" + e(m[L][0]) + '</p><div class="needs">' + m.needs.map(function (n) { return '<span dir="ltr">' + e(n) + "</span>"; }).join("") + "</div>" +
        '<a class="more" href="/#' + m.id + '">' + e(t.details) + " " + MORE + "</a></div></article>";
    }).join("");
    // The three hiding layers from the top down (apps, Zygote, kernel), then performance.
    var order = ["nextwheel", "nextzygisk", "nextsusfs", "nextcore"];
    document.getElementById("panels").innerHTML = order.map(function (id, i) {
      var m = MODS.filter(function (x) { return x.id === id; })[0];
      return '<article class="panel k' + (i % 3) + '"><div class="steps"><img class="nm" src="img/' + id + '-dark.svg" alt="' + NAMES[id] + '"><h3><b class="dot">' + (i < 3 ? i + 1 : "⚡") + "</b>" + e(t.layer[m.layer]) + "</h3><ul>" +
        m[L][1].map(function (x) { return "<li>" + e(x) + "</li>"; }).join("") + '</ul></div><div class="pv' + (m.wide ? " wide" : "") + '"><video src="/assets/media/' + id + '.mp4" poster="/assets/media/' + id + '.jpg" muted loop playsinline autoplay></video></div></article>';
    }).join("");
    document.getElementById("dash").innerHTML = dash();
  }
  function num(n) { return Number(n).toLocaleString("en-US"); }
  function day(iso) { var p = iso.split("-"); return +p[2] + " " + T[L].months[+p[1] - 1] + " " + p[0]; }
  function short(tag) { return tag.replace(/^v/, "").replace(/-\d+$/, ""); }
  function dayShort(iso) { var p = iso.split("-"); return +p[2] + " " + T[L].months[+p[1] - 1]; }
  // Releases in version order (1.0.1 before 1.0.2, whatever day each went up); a test build after its version.
  function byVersion(a, b) {
    var x = a[0].match(/\d+/g).map(Number), y = b[0].match(/\d+/g).map(Number);
    for (var i = 0; i < Math.max(x.length, y.length); i++) { var d = (x[i] || 0) - (y[i] || 0); if (d) return d; }
    return 0;
  }
  // Build numbers (v1.0.7-614) are not part of the version.
  function SORT() { Object.keys(DL).forEach(function (id) { DL[id].sort(function (a, b) { return byVersion([a[0].replace(/-\d+$/, "")], [b[0].replace(/-\d+$/, "")]); }); }); }
  SORT();

  // One small bar chart per module: one bar per release, oldest first; the latest is lit and labelled.
  function bars(id) {
    var rows = DL[id], W = 520, H = 190, padL = 34, padB = 26, padT = 18;
    var max = Math.max.apply(null, rows.map(function (r) { return r[2]; }));
    var step = max > 200 ? 100 : max > 60 ? 25 : 10, top = Math.ceil(max / step) * step;
    var bw = Math.min(64, (W - padL - 8) / rows.length), x0 = padL + 4 + ((W - padL - 8) - bw * rows.length) / 2, gap = Math.min(10, bw * 0.28), y = function (v) { return padT + (H - padT - padB) * (1 - v / top); };
    var g = "";
    for (var t = 0; t <= top; t += step)
      g += '<line class="grid" x1="' + padL + '" x2="' + W + '" y1="' + y(t) + '" y2="' + y(t) + '"/><text class="tick" x="' + (padL - 6) + '" y="' + (y(t) + 3.5) + '" text-anchor="end">' + t + "</text>";
    var last = rows.length - 1;
    rows.forEach(function (r, i) {
      var x = x0 + i * bw + gap / 2, w = bw - gap, h = Math.max(2, y(0) - y(r[2]));
      var cls = "bar" + (i === last ? " now" : "") + (r[3] ? " pre" : "");
      var tip = "v" + short(r[0]) + (r[3] ? " (" + T[L].test + ")" : "") + "|" + day(r[1]) + "|" + num(r[2]) + " " + T[L].n_dl;
      g += '<g class="hit" tabindex="0" data-tip="' + e(tip) + '"><rect class="hitbox" x="' + (x - gap / 2) + '" y="' + padT + '" width="' + bw + '" height="' + (H - padT - padB) + '"/>' +
        '<path class="' + cls + '" d="M' + x + "," + y(0) + "V" + (y(0) - h + 4) + "q0,-4 4,-4h" + (w - 8) + "q4,0 4,4V" + y(0) + 'Z"/></g>';
      if (i === last) g += '<text class="val" x="' + (x + w / 2) + '" y="' + (y(r[2]) - 6) + '" text-anchor="middle">' + num(r[2]) + "</text>";
      if (rows.length <= 9 || i % 2 === last % 2)
        g += '<text class="lab" x="' + (x + w / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + e(short(r[0]).split("-")[0] + (r[3] ? "β" : "")) + "</text>";
    });
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + e(T[L].per + " " + NAMES[id]) + '">' + g + "</svg>";
  }

  function dash() {
    var t = T[L], ids = ["nextzygisk", "nextwheel", "nextsusfs", "nextcore"];
    var sum = function (id) { return DL[id].reduce(function (a, r) { return a + r[2]; }, 0); };
    var all = ids.reduce(function (a, id) { return a + sum(id); }, 0);
    var tiles = '<div class="kpi big"><small>' + e(t.total) + '</small><b>' + num(all) + '</b><span>' + e(t.mods) + "</span></div>" +
      ids.map(function (id) {
        var rows = DL[id], lr = rows[rows.length - 1];
        return '<div class="kpi"><img src="img/' + id + '.svg" alt=""><small>' + NAMES[id] + '</small><b>' + num(sum(id)) + '</b><span>' + e(t.latest) + ' <bdi dir="ltr">v' + short(lr[0]) + "</bdi> · " + dayShort(lr[1]) + "</span></div>";
      }).join("");
    var charts = ids.map(function (id) {
      return '<figure class="chart"><figcaption><img src="img/' + id + '.svg" alt="">' + NAMES[id] + '<span>' + DL[id].length + " " + e(t.releases) + "</span></figcaption>" + bars(id) + "</figure>";
    }).join("");
    var table = '<details class="dtable"><summary>' + e(t.table) + '</summary><div class="tscroll"><table><thead><tr><th></th><th>' + e(t.c_ver) + "</th><th>" + e(t.c_date) + "</th><th>" + e(t.c_dl) + "</th></tr></thead><tbody>" +
      ids.map(function (id) { return DL[id].slice().reverse().map(function (r) { return "<tr><td>" + NAMES[id] + '</td><td dir="ltr">' + e(r[0]) + (r[3] ? " (" + e(t.test) + ")" : "") + "</td><td>" + day(r[1]) + '</td><td class="n">' + num(r[2]) + "</td></tr>"; }).join(""); }).join("") +
      "</tbody></table></div></details>";
    return '<div class="kpis">' + tiles + '</div><div class="charts">' + charts + "</div>" + table;
  }

  // Hover and keyboard focus show a bar's version, date and downloads.
  var tip = document.createElement("div");
  tip.className = "tip"; tip.hidden = true; document.body.appendChild(tip);
  function showTip(el) {
    var r = el.getBoundingClientRect();
    tip.textContent = "";
    el.getAttribute("data-tip").split("|").forEach(function (line, i) { var d = document.createElement(i ? "span" : "b"); d.textContent = line; tip.appendChild(d); });
    tip.hidden = false;
    tip.style.left = Math.min(innerWidth - tip.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - tip.offsetWidth / 2)) + "px";
    tip.style.top = (r.top + scrollY - tip.offsetHeight - 6) + "px";
  }
  document.addEventListener("mouseover", function (ev) { var h = ev.target.closest(".hit"); if (h) showTip(h); else tip.hidden = true; });
  document.addEventListener("focusin", function (ev) { var h = ev.target.closest(".hit"); if (h) showTip(h); });
  document.addEventListener("focusout", function () { tip.hidden = true; });

  document.addEventListener("click", function (ev) {
    if (ev.target.closest("[data-act=lang]")) { L = L === "ar" ? "en" : "ar"; render(); }
  });

  // Live numbers from the server's GitHub cache; the numbers above stay if it does not answer.
  function live() {
    var ids = Object.keys(REPOS);
    Promise.all(ids.map(function (id) {
      return fetch("/gh/repos/" + REPOS[id] + "/releases", { cache: "no-cache" })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (list) {
          if (!Array.isArray(list) || !list.length) return;
          DL[id] = list.filter(function (x) { return !x.draft; }).map(function (x) {
            var n = (x.assets || []).reduce(function (a, b) { return a + (b.download_count || 0); }, 0);
            return [x.tag_name, (x.published_at || x.created_at || "").slice(0, 10), n, x.prerelease ? 1 : 0];
          });
        }).catch(function () {});
    })).then(function () { SORT(); render(); });
  }
  render();
  live();
})();
