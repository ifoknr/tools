(function () {
  "use strict";
  // Downloads of every release, from GitHub on 3 Nov 2026: [tag, date, downloads, pre-release].
  // The real site reads these live through its /gh cache.
  var DL = {"fastbootstudio":[["v2.8.0","2026-10-30",89,0],["v2.7.1","2026-10-20",175,0],["v2.7.0","2026-10-19",16,0],["v2.6.0","2026-10-19",12,0],["v2.5.2","2026-10-15",257,0],["v2.5.1","2026-10-12",37,0],["v2.5.0","2026-10-11",14,0],["v2.4.0","2026-10-10",3,0],["v2.3.0","2026-10-09",37,0],["v2.2.0","2026-10-09",3,0],["v2.1.0","2026-10-09",3,0],["v2.0.0","2026-10-08",1,0]],"mobile":[["v1.1.0","2026-10-30",6,0],["v1.0.0","2026-10-28",12,0],["v1.0.0-beta.1","2026-10-19",5,1]],"companion":[["v2.5.2","2026-10-30",24,0],["v2.5.1","2026-10-15",41,0],["v2.5.0","2026-10-11",9,1],["v2.4.0","2026-10-11",2,1],["v2.3.0","2026-10-09",5,1]]};
  var IDS = ["fastbootstudio", "mobile", "companion"];
  var REPOS = { fastbootstudio: "ifoknr/FastbootStudio", mobile: "ifoknr/FastbootStudio-Mobile", companion: "ifoknr/FastbootStudio-Companion" };
  var SHORT = { fastbootstudio: "Fastboot Studio", mobile: "Mobile", companion: "Companion" };
  var NAMES = { fastbootstudio: "Fastboot Studio", mobile: "Fastboot Studio Mobile", companion: "Companion" };

  var IC = {
    flash: '<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
    root: '<path d="M12 21V11M12 11c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z"/>',
    backup: '<path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5"/>',
    samsung: '<path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM12 7v7M9 11l3 3 3-3M10 18h4"/>',
    super: '<path d="M4 5h16v4H4zM4 11h7v8H4zM13 11h7v8h-7z"/>',
    help: '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.3 2-2.3 3.6M12 17h.01"/>',
    device: '<path d="M7 3h10v18H7zM10 18h4"/>',
    payload: '<path d="M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8M12 12v8"/>',
    phone: '<path d="M8 3h8v18H8zM3 9v6M21 9v6"/>',
    build: '<path d="M14 6l4 4M4 20l10-10 4 4L8 24M15 3l6 6"/>',
    image: '<path d="M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4"/>',
    gear: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .2-1.3-1.3L17 5l-3-1-1 2h-2l-1-2-3 1 .3 2L6 8.2 4 8 3 11l2 1v0l-2 1 1 3 2-.2 1.3 1.3L7 19l3 1 1-2h2l1 2 3-1-.3-2 1.3-1.3 2 .2 1-3z"/>',
    usb: '<path d="M12 3v14M9 6l3-3 3 3M7 10v3l5 3 5-3v-3M7 10h.01M17 10h.01M12 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>',
    shield: '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/>',
    slot: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
    lock: '<path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5zM12 15v2"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    warn: '<path d="M12 8v5M12 16.5h.01"/>'
  };
  function svg(k) { return '<svg viewBox="0 0 24 24">' + IC[k] + "</svg>"; }

  var T = {
    ar: {
      n1: "الميزات", n2: "أندرويد", n3: "الأرقام", n4: "الأمان", lang: "English", download: "تحميل",
      p_new: "جديد", p_txt: "شرح بكل صفحة في v2.8.0",
      h1a: "فلّش", h1b: "وانت مطمّن",
      lead: "Fastboot Studio لويندوز وأندرويد: يفحص كل ملف قبل ما يلمس جوالك، ويوقفك قبل الغلطة اللي تخرّب الجهاز.",
      win: "تحميل لويندوز", and: "تطبيق الأندرويد", free: "مجاني ومفتوح المصدر",
      b_h: "جديد في v2.8.0", b_d: "شرح بكل صفحة، جولة ترحيب، وتعريف سامسونج بضغطة.", b_go: "شوف الإصدار",
      e_h1: "سهل من أول تشغيل", e_d: "شبّك الجوال، اختر الملف، والباقي عليه: يفحص، ويسألك قبل الشي الخطير، وبعدين يفلّش.",
      e_c_h: "يفحص قبل ما يكتب", e_c_d: "الصورة والسلوت ومساحة super والبارتشنات الحساسة، كلها قبل أول بايت. الشي اللي ممكن يقفل الجوال يطلب تأكيدك، والشي اللي يخرّبه ما يسمح فيه.", e_c_go: "وش يفحص بالضبط",
      ck_title: "فحص قبل الفلاش", ck_n: "5 فحوصات",
      checks: [["ok", "الصورة تناسب البارتشن", "boot_a"], ["ok", "السلوت الشغّال", "a"], ["ok", "مساحة super تكفي", "6.2 / 9.1 GB"], ["ok", "البارتشنات الحساسة ما تنلمس", "EFS · modem"], ["warn", "vbmeta يوقف التحقق", "يطلب تأكيدك"]],
      bk_h: "نسخة احتياطية أول", bk_d: "البارتشنات والملفات عن طريق adb، قبل أي كتابة.",
      pg_h: "كل شي بمكانه", pg_d: "صفحة لكل شغلة، وزر ؟ بكل صفحة يشرح لك وش تسوي.",
      pages: [["device", "الجهاز"], ["flash", "الفلاش"], ["payload", "Payload"], ["root", "الروت"], ["backup", "النسخ"], ["samsung", "سامسونج"], ["image", "أدوات الصور"], ["super", "بناء super"], ["phone", "الجوال"]],
      a_k: "أندرويد", a_h: "وعلى الجوال بعد", a_d: "تطبيق أندرويد يفلّش جوال ثاني بكيبل OTG، وموديول روت يعطي Fastboot Studio حالة الجوال الحقيقية من داخله.",
      apk: "تحميل APK", mod: "موديول الروت",
      trio: [["usb", "فلاش بكيبل OTG", "جوال يفلّش جوال، بدون كمبيوتر، بنفس فحوصات الويندوز.", "mobile"], ["root", "موديول Companion", "يقرا الحالة من داخل الجوال: الروت والسلوت والبطارية والتخزين.", "companion"], ["shield", "نفس الأمان", "نفس القواعد: اللي يخرّب الجوال ما ينسمح فيه، بكل التطبيقات.", ""]],
      f_h: "كل اللي يحتاجه الفلاش", f_d: "من ملف OTA لين الروت، بدون أوامر تحفظها وبدون تخمين.",
      bento: [
        ["flash", "w2", "فلاش OTA و payload", "يفلّش payload.bin من ملف OTA مباشرة، ويحسب مساحة super قبل ما يبدأ، وينشئ البارتشنات الناقصة."],
        ["root", "", "روت بأربع خطوات", "Magisk أو KernelSU أو APatch: يسحب boot، يعدّله، ويرجّعه بعد ما يتأكد منه."],
        ["samsung", "", "سامسونج ووضع التحميل", "يفتح روم سامسونج ويفحص MD5، ويقرا الموديل والمنطقة وجدول PIT."],
        ["super", "", "أدوات الصور و super", "تحويل sparse، وفك super وبناءه، وتفاصيل boot: الكيرنل والـ KMI."],
        ["usb", "", "تعريفات USB", "يلقى الجوال اللي ما له تعريف، ويركّب تعريف سامسونج بضغطة."],
        ["phone", "", "تقرير الجوال", "تقرير كامل عن الجوال عن طريق adb: الروت والسلوت والبطارية والتخزين."],
        ["help", "w2", "شرح بكل صفحة", "زر ؟ يفتح شرح الصفحة: وش تسوي، الخطوات، والأشياء اللي تخرّب للأبد. بالعربي والإنجليزي."]
      ],
      d_h1: "التحميلات من", d_h2: "GitHub", d_d: "مجموع تحميلات كل الإصدارات، وكم نزّل الناس من كل إصدار. الأرقام من GitHub مباشرة، وتتحدث كل كم دقيقة.",
      total: "كل التحميلات", apps: "3 تطبيقات، كل الإصدارات", n_dl: "تحميل", latest: "آخر إصدار", releases: "إصدار", per: "التحميلات لكل إصدار", test: "تجريبي",
      table: "كل الأرقام في جدول", c_ver: "الإصدار", c_date: "التاريخ", c_dl: "التحميلات", months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
      s_h: "أمان، مو تخمين", s_d: "قواعد ثابتة بكل فلاش، ما تقدر تنساها.",
      four: [["slot", "السلوت الصح", "يتأكد من السلوت قبل ما يبدّله أو يكتب عليه."], ["lock", "البارتشنات الحساسة", "EFS والمودم وغيرها محمية، ما تنكتب بالغلط."], ["shield", "تحديثات مفحوصة", "كل تحديث يتفحص بـ SHA-256 قبل ما ينحفظ."], ["code", "مفتوح المصدر", "الكود كامل على GitHub برخصة MIT."]],
      g_h: "جاهز تفلّش وانت مطمّن؟", g_d: "حمّله مجاناً لويندوز، أو ثبّته بأمر واحد.", or: "أو", copy: "نسخ", copied: "تم النسخ",
      g_f: "Windows 10 و 11 · بالعربي والإنجليزي",
      t_h: "قروب تلقرام", t_d: "الإصدارات الجديدة والتجريبية تنزل هنا أول.", gh_d: "الكود والإصدارات وبلّغ عن مشكلة.",
      to_mods: "إضافات الروت", to_home: "كل الأدوات", dev: "المطوّر", fine: "© 2026 IFOKNR · MIT"
    },
    en: {
      n1: "Features", n2: "Android", n3: "Numbers", n4: "Safety", lang: "عربي", download: "Download",
      p_new: "New", p_txt: "Help on every page in v2.8.0",
      h1a: "Confident", h1b: "flashing",
      lead: "Fastboot Studio for Windows and Android checks every file before it touches your phone, and stops the mistakes that brick it.",
      win: "Download for Windows", and: "Get the Android app", free: "Free and open source",
      b_h: "New in v2.8.0", b_d: "Help on every page, a welcome tour, and the Samsung driver in one click.", b_go: "See the release",
      e_h1: "It's as easy as plugging in", e_d: "Connect the phone, pick the file, and leave the rest to it: it checks, asks before anything risky, then flashes.",
      e_c_h: "It checks before it writes", e_c_d: "The image, the slot, super's space and the critical partitions, all before the first byte. What could lock the phone asks you first; what would brick it is not allowed.", e_c_go: "What it checks",
      ck_title: "Checks before flashing", ck_n: "5 checks",
      checks: [["ok", "Image fits the partition", "boot_a"], ["ok", "Active slot", "a"], ["ok", "Enough room in super", "6.2 / 9.1 GB"], ["ok", "Critical partitions untouched", "EFS · modem"], ["warn", "vbmeta turns verification off", "asks you"]],
      bk_h: "A backup first", bk_d: "Partitions and files over adb, before anything is written.",
      pg_h: "Everything in its place", pg_d: "A page for each job, and a ? on every page that explains it.",
      pages: [["device", "Device"], ["flash", "Flash"], ["payload", "Payload"], ["root", "Root"], ["backup", "Backup"], ["samsung", "Samsung"], ["image", "Image tools"], ["super", "Super builder"], ["phone", "Phone"]],
      a_k: "Android", a_h: "And on the phone too", a_d: "An Android app that flashes another phone over an OTG cable, and a root module that gives Fastboot Studio the phone's real state from inside.",
      apk: "Download the APK", mod: "The root module",
      trio: [["usb", "Flash over OTG", "One phone flashes another, no PC, with the same checks as Windows.", "mobile"], ["root", "The Companion module", "Reads the state from inside the phone: root, slot, battery and storage.", "companion"], ["shield", "The same safety", "The same rules: what would brick the phone is not allowed, in every app.", ""]],
      f_h: "Everything flashing needs", f_d: "From an OTA zip to root, with no commands to remember and no guessing.",
      bento: [
        ["flash", "w2", "OTA and payload flashing", "Flashes payload.bin straight from an OTA zip, checks super's space before it starts, and creates missing partitions."],
        ["root", "", "Root in four steps", "Magisk, KernelSU or APatch: it pulls boot, patches it, and flashes it back once checked."],
        ["samsung", "", "Samsung and Download mode", "Opens Samsung firmware, checks its MD5, and reads the model, region and PIT."],
        ["super", "", "Image tools and super", "Sparse conversion, super unpacked and rebuilt, and boot's kernel and KMI."],
        ["usb", "", "USB drivers", "Finds a phone with no driver, and installs Samsung's driver in one click."],
        ["phone", "", "Phone report", "A full report on the phone over adb: root, slot, battery and storage."],
        ["help", "w2", "Help on every page", "A ? opens the page's help: what it does, the steps, and what breaks for good. In English and Arabic."]
      ],
      d_h1: "Downloads from", d_h2: "GitHub", d_d: "All releases added up, and how many people took each one. The numbers come straight from GitHub and refresh every few minutes.",
      total: "All downloads", apps: "3 apps, every release", n_dl: "downloads", latest: "Latest", releases: "releases", per: "Downloads per release", test: "test",
      table: "All the numbers in a table", c_ver: "Version", c_date: "Date", c_dl: "Downloads", months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      s_h: "Safety, not guessing", s_d: "Fixed rules on every flash, so you can't forget them.",
      four: [["slot", "The right slot", "It checks the slot before switching it or writing to it."], ["lock", "Critical partitions", "EFS, the modem and the rest are guarded from a wrong write."], ["shield", "Checked updates", "Every update is checked with SHA-256 before it is kept."], ["code", "Open source", "All the code is on GitHub under the MIT licence."]],
      g_h: "Ready for take-off?", g_d: "Download it free for Windows, or install it with one command.", or: "or", copy: "Copy", copied: "Copied",
      g_f: "Windows 10 and 11 · English and Arabic",
      t_h: "Telegram group", t_d: "New releases and test builds land here first.", gh_d: "Code, releases, and reporting a problem.",
      to_mods: "Root modules", to_home: "All tools", dev: "Developer", fine: "© 2026 IFOKNR · MIT"
    }
  };
  var qs = new URLSearchParams(location.search), root = document.documentElement;
  var L = qs.get("lang") === "en" ? "en" : "ar";
  function e(s) { return String(s).replace(/[&<>"]/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }

  function num(n) { return Number(n).toLocaleString("en-US"); }
  function day(iso) { var p = iso.split("-"); return +p[2] + " " + T[L].months[+p[1] - 1] + " " + p[0]; }
  function dayShort(iso) { var p = iso.split("-"); return +p[2] + " " + T[L].months[+p[1] - 1]; }
  function short(tag) { return tag.replace(/^v/, ""); }
  // Releases in version order; a beta before its version.
  function key(tag) { var m = tag.replace(/^v/, "").split("-"); return m[0].split(".").map(Number).concat([m[1] ? 0 : 1]); }
  function SORT() { IDS.forEach(function (id) {
    DL[id].sort(function (a, b) { var x = key(a[0]), y = key(b[0]); for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; });
  }); }
  SORT();
  function sum(id) { return DL[id].reduce(function (a, r) { return a + r[2]; }, 0); }

  // One bar chart per app: a bar per release, oldest first; the latest is lit and labelled.
  function bars(id, W) {
    var rows = DL[id], H = 200, padL = 34, padB = 26, padT = 20;
    var max = Math.max.apply(null, rows.map(function (r) { return r[2]; }));
    var step = max > 200 ? 100 : max > 60 ? 25 : 10, top = Math.ceil(max / step) * step;
    var bw = Math.min(64, (W - padL - 8) / rows.length), x0 = padL + 4 + ((W - padL - 8) - bw * rows.length) / 2, gap = Math.min(14, bw * 0.3);
    var y = function (v) { return padT + (H - padT - padB) * (1 - v / top); };
    var g = '<defs><linearGradient id="gnow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5ca8"/><stop offset="1" stop-color="#ff4d4d"/></linearGradient></defs>';
    for (var t = 0; t <= top; t += step)
      g += '<line class="grid" x1="' + padL + '" x2="' + W + '" y1="' + y(t) + '" y2="' + y(t) + '"/><text class="tick" x="' + (padL - 6) + '" y="' + (y(t) + 3.5) + '" text-anchor="end">' + t + "</text>";
    var last = rows.length - 1;
    rows.forEach(function (r, i) {
      var x = x0 + i * bw + gap / 2, w = bw - gap, h = Math.max(2, y(0) - y(r[2])), rr = Math.min(5, w / 2, h);
      var cls = "bar" + (i === last ? " now" : "") + (r[3] ? " pre" : "");
      var tip = "v" + short(r[0]) + (r[3] ? " (" + T[L].test + ")" : "") + "|" + day(r[1]) + "|" + num(r[2]) + " " + T[L].n_dl;
      g += '<g class="hit" tabindex="0" data-tip="' + e(tip) + '"><rect class="hitbox" x="' + (x - gap / 2) + '" y="' + padT + '" width="' + bw + '" height="' + (H - padT - padB) + '"/>' +
        '<path class="' + cls + '" d="M' + x + "," + y(0) + "V" + (y(0) - h + rr) + "q0,-" + rr + " " + rr + ",-" + rr + "h" + (w - 2 * rr) + "q" + rr + ",0 " + rr + "," + rr + "V" + y(0) + 'Z"/></g>';
      if (i === last) g += '<text class="val" x="' + (x + w / 2) + '" y="' + (y(r[2]) - 7) + '" text-anchor="middle">' + num(r[2]) + "</text>";
      g += '<text class="lab" x="' + (x + w / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + e(short(r[0]).split("-")[0] + (r[3] ? "β" : "")) + "</text>";
    });
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + e(T[L].per + " " + NAMES[id]) + '">' + g + "</svg>";
  }

  // The wide chart gets the narrow shape on phones so its labels stay readable.
  var narrow = matchMedia("(max-width: 640px)");
  function dash() {
    var t = T[L], all = IDS.reduce(function (a, id) { return a + sum(id); }, 0);
    var tiles = '<div class="kpi big"><small>' + e(t.total) + "</small><b>" + num(all) + "</b><span>" + e(t.apps) + "</span></div>" +
      IDS.map(function (id) {
        var rows = DL[id], lr = rows[rows.length - 1];
        return '<div class="kpi"><img src="/assets/img/tools/' + id + '.svg" alt=""><small>' + SHORT[id] + "</small><b>" + num(sum(id)) + "</b><span>" + e(t.latest) + ' <bdi dir="ltr">v' + short(lr[0]) + "</bdi> · " + dayShort(lr[1]) + "</span></div>";
      }).join("");
    var charts = IDS.map(function (id, i) {
      return '<figure class="chart' + (i ? "" : " wide") + '"><figcaption><img src="/assets/img/tools/' + id + '.svg" alt="">' + NAMES[id] + "<span>" + DL[id].length + " " + e(t.releases) + "</span></figcaption>" + bars(id, i || narrow.matches ? 520 : 1060) + "</figure>";
    }).join("");
    var table = '<details class="dtable"><summary>' + e(t.table) + '</summary><div class="tscroll"><table><thead><tr><th></th><th>' + e(t.c_ver) + "</th><th>" + e(t.c_date) + "</th><th>" + e(t.c_dl) + "</th></tr></thead><tbody>" +
      IDS.map(function (id) { return DL[id].slice().reverse().map(function (r) { return "<tr><td>" + NAMES[id] + '</td><td dir="ltr">' + e(r[0]) + (r[3] ? " (" + e(t.test) + ")" : "") + "</td><td>" + day(r[1]) + '</td><td class="n">' + num(r[2]) + "</td></tr>"; }).join(""); }).join("") +
      "</tbody></table></div></details>";
    return '<div class="kpis">' + tiles + '</div><div class="charts">' + charts + "</div>" + table;
  }

  function render() {
    var t = T[L];
    root.lang = L; root.dir = L === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-t]").forEach(function (n) { n.textContent = t[n.getAttribute("data-t")]; });
    document.getElementById("checks").innerHTML = '<header><img src="/assets/img/tools/fastbootstudio.svg" alt="">' + e(t.ck_title) + "<span>" + e(t.ck_n) + "</span></header>" +
      t.checks.map(function (c) { return '<div class="ck' + (c[0] === "warn" ? " warn" : "") + '"><span class="st">' + svg(c[0]) + "</span>" + e(c[1]) + '<span class="v"><bdi>' + e(c[2]) + "</bdi></span></div>"; }).join("");
    var parts = [["boot", "96 MB", 1], ["vbmeta", "64 KB", 1], ["persist", "32 MB", 1], ["modemst1", "2 MB", 1], ["userdata", "112 GB", 0]];
    document.getElementById("bk").innerHTML = parts.map(function (p, i) { return '<div class="row' + (p[2] ? "" : " off") + (i === 0 ? " sel" : "") + '"><span class="bx">' + (p[2] ? svg("ok") : "") + "</span><code>" + p[0] + '</code><span class="sz">' + p[1] + "</span></div>"; }).join("");
    document.getElementById("pages").innerHTML = t.pages.map(function (p) { return "<span>" + svg(p[0]) + e(p[1]) + "</span>"; }).join("");
    var ver = { mobile: "v1.1.0", companion: "v2.5.2" };
    document.getElementById("trio").innerHTML = t.trio.map(function (c) { return '<article class="card"><span class="ic">' + svg(c[0]) + "</span>" + (c[3] ? '<span class="ver"><bdi dir="ltr">' + ver[c[3]] + "</bdi></span>" : "") + "<h3>" + e(c[1]) + "</h3><p>" + e(c[2]) + "</p></article>"; }).join("");
    document.getElementById("bento").innerHTML = t.bento.map(function (c) { return '<article class="card ' + c[1] + '"><span class="ric">' + svg(c[0]) + "</span><h3>" + e(c[2]) + "</h3><p>" + e(c[3]) + "</p></article>"; }).join("");
    document.getElementById("four").innerHTML = t.four.map(function (c) { return "<div>" + svg(c[0]) + "<h3>" + e(c[1]) + "</h3><p>" + e(c[2]) + "</p></div>"; }).join("");
    document.getElementById("dash").innerHTML = dash();
  }

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
    if (ev.target.closest("[data-act=lang]")) { L = L === "ar" ? "en" : "ar"; render(); return; }
    var c = ev.target.closest("[data-act=copy]");
    if (c) {
      var done = function () { c.textContent = T[L].copied; setTimeout(function () { c.textContent = T[L].copy; }, 1600); };
      try { navigator.clipboard.writeText("winget install IFOKNR.FastbootStudio").then(done, function () {}); } catch (x) { /* no clipboard here */ }
    }
  });
  // Still pictures for people who turn motion off.
  if (matchMedia("(prefers-reduced-motion: reduce)").matches)
    document.querySelectorAll("video").forEach(function (v) { v.removeAttribute("autoplay"); v.pause(); });
  if (narrow.addEventListener) narrow.addEventListener("change", function () { document.getElementById("dash").innerHTML = dash(); });

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
