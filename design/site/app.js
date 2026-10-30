(async function () {
  "use strict";
  const T = await (await fetch("tools.json")).json();
  const R = await (await fetch("releases.json")).json();
  const ORDER = ["fastbootstudio", "mobile", "companion", "nextzygisk", "nextwheel", "nextsusfs", "nextcore"];
  T.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  const byId = Object.fromEntries(T.map(t => [t.id, t]));
  const ICON = { fastbootstudio: "img/tools/fastbootstudio.png", mobile: "img/tools/mobile.png", companion: "img/tools/companion-grey.svg" };
  const WIDE = { fastbootstudio: "laptop", nextcore: "banner" };
  const KIND = { fastbootstudio: "win", mobile: "apk" };

  const S = {
    ar: {
      home: "الرئيسية", g_pc: "Fastboot Studio", g_hide: "إخفاء الروت", g_perf: "الأداء", links: "روابط",
      eyebrow: "مجانية ومفتوحة المصدر",
      h1: "أدوات أندرويد للفلاش، وإخفاء الروت، والأداء",
      lead: "تطبيق ويندوز وتطبيق جوال يفلّشون جوالك ويحمونه من الأخطاء، وموديولات تخفي الروت من الطبقات الثلاث، وموديول أداء آمن لأي معالج.",
      browse: "تصفّح الأدوات", tools: "الأدوات", downloads: "التحميلات", updated: "آخر تحديث", latest: "أحدث إصدار",
      sec_pc: "الفلاش والجوال", sec_pc_d: "على الكمبيوتر، على الجوال، ومن داخل الروت",
      sec_hide: "منظومة NEXT", sec_hide_d: "ثلاث طبقات تخفي الروت، كل وحدة تعرض حالة الباقي",
      sec_perf: "الأداء", sec_perf_d: "أداء ثابت بدون ما تلمس الحماية الحرارية",
      details: "التفاصيل", download: "تحميل", download_v: "تحميل {v}", source: "المصدر", changes: "التغييرات",
      version: "الإصدار", date: "التاريخ", dls: "التحميلات", license: "الترخيص",
      what: "وش يسوي", needs: "يحتاج", install: "التثبيت", built: "مبني على {n} من {b}.", uses: "يستخدم {n} من {b}.",
      layer_apps: "التطبيقات", layer_zygote: "Zygote", layer_kernel: "النواة",
      st_mod: ["حمّل ملف zip من زر التحميل", "ركّبه من مدير الروت: KernelSU أو Magisk أو APatch", "أعد تشغيل الجوال، وافتح الواجهة من مدير الروت"],
      st_win: ["ثبّته بأمر واحد من winget، أو حمّل ملف zip", "شغّل Fastboot Studio ووصّل جوالك", "اتبع صفحة الترحيب: اللغة، الصفحات، والفحص"],
      st_apk: ["حمّل ملف APK، أو تابع التحديثات من Obtainium", "اسمح بصلاحية الروت أول ما تفتحه", "للجوال الثاني: وصّله بكيبل OTG"],
      copy: "نسخ", prev: "السابق", next: "التالي", back: "كل الأدوات",
      dev: "المطوّر", telegram: "قروب تلقرام", contact: "تواصل",
      lang: "English",
      months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    },
    en: {
      home: "Home", g_pc: "Fastboot Studio", g_hide: "Root hiding", g_perf: "Performance", links: "Links",
      eyebrow: "Free and open source",
      h1: "Android tools for flashing, root hiding and performance",
      lead: "A Windows app and a phone app that flash your phone and guard it against mistakes, modules that hide root at all three layers, and a performance module that is safe on any SoC.",
      browse: "Browse the tools", tools: "Tools", downloads: "Downloads", updated: "Last update", latest: "Newest release",
      sec_pc: "Flashing and the phone", sec_pc_d: "On the PC, on the phone, and from inside root",
      sec_hide: "The NEXT stack", sec_hide_d: "Three layers of root hiding; each shows the others' status",
      sec_perf: "Performance", sec_perf_d: "Steady performance without touching thermal protection",
      details: "Details", download: "Download", download_v: "Download {v}", source: "Source", changes: "Changelog",
      version: "Version", date: "Date", dls: "Downloads", license: "License",
      what: "What it does", needs: "Needs", install: "Install", built: "Based on {n} by {b}.", uses: "Uses {n} by {b}.",
      layer_apps: "Apps", layer_zygote: "Zygote", layer_kernel: "Kernel",
      st_mod: ["Download the zip with the button above", "Install it in your root manager: KernelSU, Magisk or APatch", "Restart, then open its WebUI from the root manager"],
      st_win: ["Install with one winget command, or download the zip", "Run Fastboot Studio and connect your phone", "Follow the welcome steps: language, pages, check"],
      st_apk: ["Download the APK, or follow updates with Obtainium", "Allow root when it first opens", "For a second phone: connect it with an OTG cable"],
      copy: "Copy", prev: "Previous", next: "Next", back: "All tools",
      dev: "Developer", telegram: "Telegram group", contact: "Contact",
      lang: "عربي",
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    },
  };
  const root = document.documentElement;
  const qs = new URLSearchParams(location.search);
  let L = qs.get("lang") || "ar";
  if (qs.get("theme")) root.dataset.theme = qs.get("theme");
  const s = k => S[L][k];
  const f = (str, o) => str.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const txt = t => t[L] || t.en;
  const date = d => { const x = new Date(d + "T00:00:00Z"); return x.getUTCDate() + " " + s("months")[x.getUTCMonth()] + " " + x.getUTCFullYear(); };
  const num = n => n.toLocaleString("en-US");
  const icon = t => ICON[t.id] || t.icon.replace("assets/", "").replace(/\?.*/, "");
  const nm = (t, cls) => `<img class="${cls} ${cls}-dark" src="img/names/${t.id}-dark.svg" alt="${t.name.join("")}"><img class="${cls} ${cls}-light" src="img/names/${t.id}-light.svg" alt="">`;
  const rel = t => R[t.id] || { tag: t.version, date: "", downloads: 0, url: "https://github.com/" + t.repo + "/releases" };
  const vid = (t, cls) => `<video class="${cls || ""}" src="media/${t.id}.mp4" poster="media/${t.id}.jpg" autoplay muted loop playsinline preload="metadata"></video>`;
  const SV = {
    home: '<svg class="ic" viewBox="0 0 24 24"><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z"/></svg>',
    tg: '<svg viewBox="0 0 24 24"><path d="m21 4-18 7.2 6 2.1L19 7l-8 8 .5 5 3-3.5 4 3z"/></svg>',
    gh: '<svg viewBox="0 0 24 24"><path d="M9 19c-4 1.3-4-2-6-2.5m12 5v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.4 4.4 0 0 0-.1-3.2s-1-.3-3.3 1.3a11.3 11.3 0 0 0-6 0C6.7 2.6 5.7 2.9 5.7 2.9a4.4 4.4 0 0 0-.1 3.2A4.7 4.7 0 0 0 4.3 9.3c0 4.7 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21"/></svg>',
    dl: '<svg viewBox="0 0 24 24"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
    ck: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M5 6h14M5 12h14M5 18h9"/></svg>',
  };
  const GROUPS = [["pc", "g_pc"], ["hide", "g_hide"], ["perf", "g_perf"]];

  function menu(cur) {
    let h = `<a class="nav ${cur === "home" ? "on" : ""}" href="#home">${SV.home}<span>${s("home")}</span></a>`;
    for (const [g, k] of GROUPS) {
      h += `<div class="label">${s(k)}</div>`;
      for (const t of T.filter(x => x.group === g))
        h += `<a class="nav ${cur === t.id ? "on" : ""}" href="#${t.id}"><img class="ic" src="${icon(t)}" alt="">${nm(t, "nm")}<span class="ver">${rel(t).tag.replace(/-\d+$/, "")}</span></a>`;
    }
    h += `<div class="label">${s("links")}</div>
      <a class="nav" href="https://t.me/BeNeXTBrO">${SV.tg.replace("<svg", '<svg class="ic"')}<span>${s("telegram")}</span></a>
      <a class="nav" href="https://github.com/ifoknr">${SV.gh.replace("<svg", '<svg class="ic"')}<span>GitHub</span></a>`;
    return h;
  }

  function card(t) {
    const r = rel(t), wide = WIDE[t.id];
    const media = wide === "laptop" ? `<div class="laptop">${vid(t)}</div>` : wide === "banner" ? `<div class="banner">${vid(t)}</div>` : vid(t);
    return `<article class="tcard ${wide ? "feature" : ""}">
      <a class="tmedia ${wide || "portrait"}" href="#${t.id}">${media}</a>
      <div class="tbody">
        <div class="thead"><img class="ic" src="${icon(t)}" alt=""><div>${nm(t, "tname")}<small>${r.tag.replace(/-\d+$/, "")} · ${num(r.downloads)} ${L === "ar" ? "تحميل" : "downloads"}</small></div></div>
        <p class="ttag">${txt(t).tagline}</p>
        ${wide ? `<p class="tab">${txt(t).about}</p>` : ""}
        <div class="tfoot"><a class="pill-btn tonal small" href="#${t.id}">${s("details")}</a><a class="pill-btn filled small" href="${r.url}">${SV.dl}${s("download")}</a></div>
      </div></article>`;
  }

  function stack(cur) {
    return `<div class="stack">${[["nextwheel", "layer_apps"], ["nextzygisk", "layer_zygote"], ["nextsusfs", "layer_kernel"]].map(([id, k], i) =>
      `<a class="layer ${cur === id ? "on" : ""}" href="#${id}"><span class="n">${i + 1}</span><div><b>${byId[id].name.join("")}</b><small>${s(k)}</small></div><span class="chip" style="margin-inline-start:auto"><i class="dot"></i>${L === "ar" ? "يشتغل" : "Working"}</span></a>`).join("")}</div>`;
  }

  function foot() {
    return `<footer class="foot"><div class="dev"><img class="mark sig-dark" src="img/ifoknr-mark.svg" alt=""><img class="mark sig-light" src="img/ifoknr-mark-light.svg" alt=""><div><img class="sig sig-dark" src="img/ifoknr-dark.svg" alt="IFOKNR"><img class="sig sig-light" src="img/ifoknr-light.svg" alt=""><small>${s("dev")}</small></div></div>
      <div class="links"><a class="pill-btn tonal small" href="https://t.me/IFOKNR1">${SV.tg}@IFOKNR1</a><a class="pill-btn outlined small" href="https://t.me/BeNeXTBrO">${s("telegram")}</a><a class="pill-btn outlined small" href="https://github.com/ifoknr">${SV.gh}GitHub</a></div></footer>`;
  }

  function home() {
    const total = Object.values(R).reduce((a, r) => a + (r ? r.downloads : 0), 0);
    const last = Object.values(R).filter(Boolean).sort((a, b) => b.date.localeCompare(a.date))[0];
    const fbs = byId.fastbootstudio, mob = byId.mobile;
    const sec = (g, h, d) => `<section class="section"><div class="sec-head"><div><h2>${s(h)}</h2><p>${s(d)}</p></div></div>${g === "hide" ? stack() : ""}<div class="grid g-${g}">${T.filter(t => t.group === g).map(card).join("")}</div></section>`;
    return `<section class="hero">
        <div><div class="eyebrow"><span class="chip blue">${s("eyebrow")}</span><span class="chip">${T.length} ${s("tools")}</span></div>
        <h1>${s("h1")}</h1><p class="lead">${s("lead")}</p>
        <div class="cta"><a class="pill-btn filled" href="#tools-list">${SV.list}${s("browse")}</a><a class="pill-btn tonal" href="https://t.me/BeNeXTBrO">${SV.tg}Telegram</a><a class="pill-btn outlined" href="https://github.com/ifoknr">${SV.gh}GitHub</a></div></div>
        <div class="reel"><div class="laptop">${vid(fbs)}</div><div class="phone">${vid(mob)}</div></div>
      </section>
      <div class="strips"><div class="strip"><span>${s("tools")}</span><b>${T.length}</b></div><div class="strip"><span>${s("downloads")}</span><b>${num(total)}</b></div><div class="strip"><span>${s("updated")}</span><b>${date(last.date)}</b></div><div class="strip"><span>${s("latest")}</span><b>Mobile ${R.mobile.tag}</b></div></div>
      <div id="tools-list"></div>
      ${sec("pc", "sec_pc", "sec_pc_d")}${sec("hide", "sec_hide", "sec_hide_d")}${sec("perf", "sec_perf", "sec_perf_d")}${foot()}`;
  }

  function tool(t) {
    const r = rel(t), x = txt(t), i = T.indexOf(t), kind = KIND[t.id] || "mod";
    const prev = T[(i - 1 + T.length) % T.length], next = T[(i + 1) % T.length];
    const steps = s("st_" + kind);
    const credit = t.base ? f(s("built"), { n: `<a href="${t.base.url}">${t.base.name}</a>`, b: t.base.by }) : t.uses ? f(s("uses"), { n: `<a href="${t.uses.url}">${t.uses.name}</a>`, b: t.uses.by }) : "";
    const portrait = !WIDE[t.id];
    return `<a class="back" href="#home">${SV.arrow}${s("back")}</a>
      <section class="thero ${portrait ? "portrait" : ""}">
        <div><div class="cookie"><img src="${icon(t)}" alt=""></div>${nm(t, "bigname")}
          <p class="tl">${x.tagline}</p><p class="ab">${x.about}</p>
          <div class="cta"><a class="pill-btn filled" href="${r.url}">${SV.dl}${f(s("download_v"), { v: r.tag.replace(/-\d+$/, "") })}</a><a class="pill-btn tonal" href="https://github.com/${t.repo}/blob/main/CHANGELOG.md">${s("changes")}</a><a class="pill-btn outlined" href="https://github.com/${t.repo}">${SV.gh}${s("source")}</a></div></div>
        <div class="media"><div class="${portrait ? "phone" : WIDE[t.id]}">${vid(t)}</div></div>
      </section>
      <div class="strips"><div class="strip"><span>${s("version")}</span><b>${r.tag}</b></div><div class="strip"><span>${s("date")}</span><b>${r.date ? date(r.date) : "—"}</b></div><div class="strip"><span>${s("dls")}</span><b>${num(r.downloads)}</b></div><div class="strip"><span>${s("license")}</span><b>${t.license}</b></div></div>
      <div class="cols">
        <div class="card"><h2>${s("what")}</h2>${x.points.map(p => `<div class="feat"><span class="ck">${SV.ck}</span><span>${p}</span></div>`).join("")}</div>
        <div class="stackc">
          <div class="card"><h2>${s("install")}</h2>${steps.map((st, k) => `<div class="step"><span class="n">${k + 1}</span><span>${st}</span></div>`).join("")}
            ${t.winget ? `<div class="code"><code>${t.winget}</code><button class="pill-btn tonal small">${s("copy")}</button></div>` : ""}</div>
          <div class="card"><h2>${s("needs")}</h2><div class="chips">${t.needs.map(n => `<span class="chip">${n}</span>`).join("")}</div>${credit ? `<p class="muted credit" style="margin-top:12px">${credit}</p>` : ""}</div>
        </div>
      </div>
      ${t.group === "hide" ? `<section class="section"><div class="sec-head"><div><h2>${s("sec_hide")}</h2><p>${s("sec_hide_d")}</p></div></div>${stack(t.id)}</section>` : ""}
      <nav class="pager"><a href="#${prev.id}"><img class="i" src="${icon(prev)}" alt=""><div><small>${s("prev")}</small>${prev.name.join("")}</div></a><a class="next" href="#${next.id}"><div><small>${s("next")}</small>${next.name.join("")}</div><img class="i" src="${icon(next)}" alt=""></a></nav>
      ${foot()}`;
  }

  function render() {
    root.lang = L; root.dir = L === "ar" ? "rtl" : "ltr";
    const id = location.hash.slice(1);
    const t = byId[id];
    const cur = t ? id : "home";
    document.getElementById("menu").innerHTML = menu(cur);
    document.getElementById("menu-sheet").innerHTML = menu(cur);
    document.querySelectorAll("[data-act=lang]").forEach(b => b.textContent = s("lang"));
    document.getElementById("page").innerHTML = t ? tool(t) : home();
    if (id === "tools-list") document.getElementById("tools-list").scrollIntoView();
    else window.scrollTo(0, 0);
    document.body.classList.remove("open");
    // Videos play only while on screen; with reduced motion they stay on their first frame.
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(es => es.forEach(e => { if (still) return; e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause(); }), { threshold: .2 });
    document.querySelectorAll("video").forEach(v => { if (still) v.removeAttribute("autoplay"); io.observe(v); });
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-act]"); if (!a) return;
    const act = a.dataset.act;
    if (act === "lang") { L = L === "ar" ? "en" : "ar"; render(); }
    if (act === "theme") root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    if (act === "menu") document.body.classList.add("open");
    if (act === "close") document.body.classList.remove("open");
  });
  addEventListener("hashchange", render);
  render();
})();
