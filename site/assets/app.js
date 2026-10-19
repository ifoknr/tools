(function () {
  "use strict";

  var STRINGS = {
    ar: {
      skip: "انتقل للأدوات",
      nav_tools: "الأدوات",
      nav_stack: "منظومة NEXT",
      nav_contact: "تواصل",
      eyebrow: "أدوات أندرويد مفتوحة المصدر",
      hero_title: "أدوات IFOKNR لإخفاء الروت والأداء والفلاش",
      hero_lead: "موديولات روت لإخفاء الروت من الطبقات الثلاث، وموديول أداء آمن لأي معالج، وتطبيق ويندوز وتطبيق للجوال يفلّشون ويحمون جوالك من الأخطاء. كل أداة هنا مجانية ومفتوحة المصدر.",
      cta_tools: "تصفّح الأدوات",
      stat_tools: "أدوات",
      stat_downloads: "تحميل",
      stat_updated: "آخر تحديث",
      tools_title: "الأدوات",
      f_all: "الكل",
      f_hide: "إخفاء الروت",
      f_perf: "الأداء",
      f_pc: "Fastboot Studio",
      layer_apps: "التطبيقات",
      layer_zygote: "Zygote",
      layer_kernel: "النواة",
      download: "تحميل",
      download_v: "تحميل {v}",
      releases: "الإصدارات",
      source: "المصدر",
      changes: "التغييرات",
      soon: "قريباً",
      beta: "تجريبي",
      soon_btn: "تحت التطوير",
      downloads: "{n} تحميل",
      copy: "نسخ",
      copied: "تم",
      based_on: "مبني على {name} من {by}.",
      uses: "يستخدم {name} من {by}.",
      license: "الترخيص: {l}",
      api_note: "ما قدرنا نوصل لـ GitHub الحين، فالإصدارات المعروضة قد تكون أقدم من الحقيقية.",
      stack_title: "منظومة NEXT",
      stack_lead: "ثلاث موديولات تشتغل مع بعض، كل وحدة تخفي الروت من طبقة. تقدر تركّب وحدة لحالها، لكن الثلاث مع بعض يعطونك أقوى إخفاء، وكل وحدة تعرض حالة الباقي في لوحتها.",
      stack_apps: "يخفي Zygisk وبيئة الروت داخل التطبيقات",
      stack_zygote: "Zygisk مستقل يحمّل NextWheel ووحداتك",
      stack_kernel: "يخفي الآثار من النواة نفسها مع SuSFS",
      stack_warn: "مشاريع شخصية، واستخدامها على مسؤوليتك. قبل التثبيت تأكد إن عندك طريقة تقلع فيها بدون موديولات (الوضع الآمن).",
      foot_by: "تطوير",
      foot_credit: "الأدوات المبنية على مشاريع ثانية تذكر أصحابها وتراخيصهم في صفحاتها.",
      lang_btn: "EN",
      months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    },
    en: {
      skip: "Skip to tools",
      nav_tools: "Tools",
      nav_stack: "NEXT stack",
      nav_contact: "Contact",
      eyebrow: "Open-source Android tools",
      hero_title: "IFOKNR tools for root hiding, performance and flashing",
      hero_lead: "Root modules that hide root at all three layers, a performance module that is safe on any SoC, and a Windows app and a phone app that flash your phone and guard it against mistakes. Every tool here is free and open source.",
      cta_tools: "Browse the tools",
      stat_tools: "Tools",
      stat_downloads: "Downloads",
      stat_updated: "Last update",
      tools_title: "Tools",
      f_all: "All",
      f_hide: "Root hiding",
      f_perf: "Performance",
      f_pc: "Fastboot Studio",
      layer_apps: "Apps",
      layer_zygote: "Zygote",
      layer_kernel: "Kernel",
      download: "Download",
      download_v: "Download {v}",
      releases: "Releases",
      source: "Source",
      changes: "Changelog",
      soon: "Coming soon",
      beta: "Beta",
      soon_btn: "In development",
      downloads: "{n} downloads",
      copy: "Copy",
      copied: "Copied",
      based_on: "Based on {name} by {by}.",
      uses: "Uses {name} by {by}.",
      license: "License: {l}",
      api_note: "GitHub could not be reached right now, so the versions shown may be older than the latest.",
      stack_title: "The NEXT stack",
      stack_lead: "Three modules that work together, each hiding root at one layer. Each installs on its own, but all three give the strongest hiding, and each shows the others' status in its dashboard.",
      stack_apps: "Hides Zygisk and the root environment inside apps",
      stack_zygote: "Standalone Zygisk that loads NextWheel and your modules",
      stack_kernel: "Hides traces from the kernel itself with SuSFS",
      stack_warn: "Personal projects, use at your own risk. Before installing, make sure you have a way to boot without modules (safe mode).",
      foot_by: "Made by",
      foot_credit: "Tools built on other projects credit their authors and licenses on their pages.",
      lang_btn: "ع",
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    },
  };

  var CACHE_KEY = "releases-v3";
  var CACHE_MS = 60 * 60 * 1000; // GitHub allows 60 unauthenticated requests an hour per visitor.
  var root = document.documentElement;
  var releases = {}; // repo -> { tag, date, url, asset, downloads }
  var apiFailed = false;
  var TOOLS = []; // from tools.json, shared with the Telegram bot

  function store(key, value) {
    try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); } catch (e) { return null; }
  }

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

  function lang() { return root.lang === "en" ? "en" : "ar"; }
  function t(key, vars) {
    var s = STRINGS[lang()][key];
    if (vars) for (var k in vars) s = s.replace("{" + k + "}", vars[k]);
    return s;
  }
  function number(n) {
    return new Intl.NumberFormat(lang() === "ar" ? "ar-SA-u-nu-latn" : "en", { notation: n >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n);
  }
  function date(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.getDate() + " " + t("months")[d.getMonth()] + " " + d.getFullYear();
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function render() {
    document.querySelectorAll("[data-i18n]").forEach(function (n) { n.textContent = t(n.getAttribute("data-i18n")); });
    document.querySelector(".lang-label").textContent = t("lang_btn");
    document.getElementById("lang-btn").setAttribute("aria-label", lang() === "ar" ? "English" : "العربية");

    var grid = document.getElementById("grid");
    var tpl = document.getElementById("card-tpl");
    grid.textContent = "";
    var totalDownloads = 0, newest = null, anyLive = false;

    TOOLS.forEach(function (tool) {
      var text = tool[lang()];
      var rel = tool.repo ? releases[tool.repo] : null;
      var card = tpl.content.firstElementChild.cloneNode(true);
      card.id = "tool-" + tool.id;
      card.dataset.group = tool.group;
      card.style.setProperty("--tool", tool.accent);
      if (tool.soon) card.classList.add("soon");

      var logo = card.querySelector(".logo");
      if (tool.icon) {
        var img = el("img");
        img.src = tool.icon; img.alt = ""; img.width = 52; img.height = 52; img.loading = "lazy";
        logo.appendChild(img);
      } else {
        logo.textContent = tool.name[0].charAt(0).toUpperCase() + tool.name[1].charAt(0).toUpperCase();
      }

      var h = card.querySelector("h3");
      h.appendChild(document.createTextNode(tool.name[0]));
      h.appendChild(el("span", "hl", tool.name[1]));
      card.querySelector(".tagline").textContent = text.tagline;
      card.querySelector(".about").textContent = text.about;
      var points = card.querySelector(".points");
      text.points.forEach(function (p) { points.appendChild(el("li", null, p)); });
      var needs = card.querySelector(".needs");
      (tool.needs || []).forEach(function (n) { needs.appendChild(el("li", null, n)); });

      var version = card.querySelector(".version");
      var download = card.querySelector(".download");
      var source = card.querySelector(".source");
      var changes = card.querySelector(".changes");

      if (tool.soon) {
        version.textContent = t("soon");
        download.textContent = t("soon_btn");
        download.setAttribute("aria-disabled", "true");
        download.removeAttribute("href");
        source.remove();
        changes.remove();
      } else {
        var repoUrl = "https://github.com/" + tool.repo;
        // tools.json is updated with every release, so it wins over older release data.
        if (rel && newer(tool.version, rel.tag)) rel = { downloads: rel.downloads };
        var live = !!(rel && rel.tag);
        var v = live ? rel.tag : tool.version;
        // A pre-release (the Companion while it is in beta) says so next to its version.
        version.textContent = v + ((live ? rel.pre : tool.beta) ? " · " + t("beta") : "");
        if (live) { version.classList.add("live"); anyLive = true; }
        if (rel && rel.date) {
          card.querySelector(".date").textContent = date(rel.date);
          if (!newest || rel.date > newest) newest = rel.date;
        }
        if (rel && rel.downloads) {
          card.querySelector(".dl").textContent = t("downloads", { n: number(rel.downloads) });
          totalDownloads += rel.downloads;
        }
        download.href = rel && rel.asset ? rel.asset : repoUrl + "/releases/latest";
        download.textContent = t("download_v", { v: v });
        source.href = repoUrl;
        source.textContent = t("source");
        changes.href = rel && rel.url ? rel.url : repoUrl + "/releases";
        changes.textContent = t("changes");
        if (tool.xda) {
          var xda = el("a", "btn btn-ghost xda", "XDA");
          xda.href = tool.xda; xda.target = "_blank"; xda.rel = "noopener";
          card.querySelector(".actions").appendChild(xda);
        }
      }

      if (tool.winget) {
        var box = card.querySelector(".winget");
        box.hidden = false;
        box.querySelector("code").textContent = tool.winget;
        var copy = box.querySelector(".copy");
        copy.textContent = t("copy");
        copy.addEventListener("click", function () {
          var done = function () { copy.textContent = t("copied"); setTimeout(function () { copy.textContent = t("copy"); }, 1500); };
          if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(tool.winget).then(done, function () {});
          else {
            var range = document.createRange(); range.selectNodeContents(box.querySelector("code"));
            var sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
            try { document.execCommand("copy"); done(); } catch (e) {}
          }
        });
      }

      var credit = [];
      if (tool.base) credit.push(t("based_on", { name: tool.base.name, by: tool.base.by }));
      if (tool.uses) credit.push(t("uses", { name: tool.uses.name, by: tool.uses.by }));
      if (tool.license) credit.push(t("license", { l: tool.license }));
      card.querySelector(".credit").textContent = credit.join(" ");

      grid.appendChild(card);
    });

    document.getElementById("stat-tools").textContent = TOOLS.length;
    document.getElementById("stat-downloads").textContent = totalDownloads ? number(totalDownloads) : "—";
    document.getElementById("stat-updated").textContent = newest ? date(newest) : "—";
    document.getElementById("api-note").hidden = !(apiFailed && !anyLive);
    applyFilter();
  }

  // Filters
  var filter = "all";
  function applyFilter() {
    document.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.filter === filter)); });
    document.querySelectorAll(".card").forEach(function (c) { c.hidden = filter !== "all" && c.dataset.group !== filter; });
  }
  document.querySelectorAll(".chip").forEach(function (c) {
    c.addEventListener("click", function () { filter = c.dataset.filter; applyFilter(); });
  });

  // Language and theme
  document.getElementById("lang-btn").addEventListener("click", function () {
    var next = lang() === "ar" ? "en" : "ar";
    root.lang = next;
    root.dir = next === "ar" ? "rtl" : "ltr";
    store("lang", next);
    render();
  });
  document.getElementById("theme-btn").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store("theme", next);
  });

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
      render();
      return;
    }
    if (cached) releases = cached.data;
    render();

    var tools = TOOLS.filter(function (x) { return x.repo; });
    Promise.all(tools.map(function (tool) {
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
      render();
    });
  }

  // tools.json inside the page when the image put it there (one request less), otherwise fetched.
  var inline = null;
  try { inline = JSON.parse(document.getElementById("tools-data").textContent); } catch (e) {}
  if (Array.isArray(inline) && inline.length) {
    TOOLS = inline;
    load();
  } else {
    fetch("assets/tools.json", { cache: "no-cache" })
      .then(function (r) { return r.json(); })
      .then(function (list) { TOOLS = list; load(); });
  }
})();
