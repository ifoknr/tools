(function () {
  "use strict";
  var $ = function (s) { return document.getElementById(s); };
  var page = $("page"), lang = "ar";
  try { lang = localStorage.getItem("lang") || ((navigator.language || "").indexOf("ar") === 0 ? "ar" : "en"); } catch (e) {}
  function L(p) { return lang === "en" ? p[1] : p[0]; }
  var APPS = {
    win: { name: "Fastboot Studio", icon: "img/glass/fastbootstudio-dark.svg", ver: "v3.0.0", license: "MIT", tall: false,
      tagline: ["أداة أندرويد المتكاملة لويندوز.", "The Android toolbox for Windows."],
      about: ["فلاش وتحديثات OTA وملفات payload والأقسام والنسخ الاحتياطي والروت في تطبيق واحد، مع فحوصات تمنع الأخطاء اللي تخرّب الجوال.", "Flashing, OTA payloads, partitions, backups and root in one app, with safety checks that stop the mistakes that brick phones."],
      dl: ["تحميل للويندوز", "Download for Windows"],
      points: [["روت بـ Magisk أو KernelSU أو APatch في أربع خطوات، وفحص صورة boot قبل التفليش", "Root with Magisk, KernelSU or APatch in four steps; boot images checked before flashing"], ["يفلّش payload.bin من ملف OTA مباشرة، ويحسب مساحة super ويسوي الأقسام الناقصة", "Flashes payload.bin straight from an OTA zip; checks super space, creates missing partitions"], ["صفحة الجوال مع إضافة Companion، نسخ احتياطي، طرفية، أدوات صور، وعربي كامل", "Phone page with the Companion module, backups, terminal, image tools, full Arabic"]],
      news: [["الشكل الجديد بالفحمي الغامق والأبيض", "The new look in dark charcoal and white"], ["الأيقونة الزجاجية", "The glass icon"], ["دعم سامسونج عن طريق وضع Download", "Samsung support through Download mode"]],
      steps: [["ثبّته بأمر واحد من winget، أو حمّل ملف zip", "Install with one winget command, or download the zip"], ["شغّل Fastboot Studio ووصّل جوالك", "Run Fastboot Studio and connect your phone"], ["اتبع صفحة الترحيب: اللغة، الصفحات، والفحص", "Follow the welcome steps: language, pages, check"]],
      code: "winget install IFOKNR.FastbootStudio", repo: "ifoknr/FastbootStudio", xda: "https://xdaforums.com/t/tool-windows-fastboot-studio-fastboot-ota-flasher-root-helper-phone-info-payload-dumper-super-builder-backups.4804685/", needs: ["Windows 10 / 11", "x64", "Magisk", "KernelSU", "APatch"],
      credit: ["مبني على Fastboot Enhance من LibXZR.", "Based on Fastboot Enhance by LibXZR."],
      shots: [["img/win/ar-02-device.webp", "img/win/light-02-device.webp", ["الجهاز", "Device"]], ["img/win/ar-03-flash.webp", "img/win/light-03-flash.webp", ["التفليش", "Flash"]], ["img/win/ar-01-payload.webp", "img/win/light-01-payload.webp", ["Payload", "Payload"]], ["img/win/ar-10-super.webp", "img/win/ar-10-super.webp", ["بناء Super", "Build Super"]], ["img/win/ar-odin-4-plan.webp", "img/win/en-odin-4-plan.webp", ["سامسونج", "Samsung"]], ["img/win/ar-05-backup-partitions.webp", "img/win/ar-05-backup-partitions.webp", ["النسخ الاحتياطي", "Backup"]], ["img/win/ar-08-images-super.webp", "img/win/ar-08-images-super.webp", ["أدوات الصور", "Image tools"]], ["img/win/light-04-terminal.webp", "img/win/light-04-terminal.webp", ["الطرفية", "Terminal"]], ["img/win/ar-welcome-4-safety.webp", "img/win/en-welcome-4-safety.webp", ["الترحيب والأمان", "Welcome and safety"]]] },
    mob: { name: "Fastboot Studio Mobile", repo: "ifoknr/FastbootStudio-Mobile", icon: "img/glass/mobile-dark.svg", ver: "v1.2.0", license: "MIT", tall: true,
      tagline: ["Fastboot Studio على الجوال نفسه: فلّش بأمان بدون كمبيوتر.", "Fastboot Studio on the phone itself: flash safely, no PC needed."],
      about: ["فلّش صورة boot أو ملف كيرنل AnyKernel3 من الجوال، ورجّع نسخة احتياطية بضغطتين، أو أنقذ جوال ثاني بكيبل OTG. كل ملف ينفحص قبل الكتابة: من أي جوال جاء، ونوع الصورة، والكيرنل، وبصمة SHA-256.", "Flash a boot image or an AnyKernel3 kernel zip on the phone, restore a backup in two taps, or rescue another phone over an OTG cable. Every file is checked before it is written: which phone it came from, the kind of image, its kernel and its SHA-256."],
      dl: ["تحميل APK", "Download APK"],
      points: [["فحص قبل كل تفليش: الملف الغلط أو المتلاعب فيه أو كيرنل سلسلة ثانية ينرفض", "A check before every flash: a wrong or tampered file, or a kernel of another series, is refused"], ["نسخة احتياطية قبل الكتابة، ونفس مجلدات برنامج الويندز والـ Companion", "A backup before writing, in the same folders as the Windows app and the Companion"], ["OTG: فلّش جوال ثاني في وضع fastboot بالكيبل، بدون روت", "OTG: flash another phone in fastboot mode over a cable, no root needed"]],
      news: [["ملف APK موقّع", "A signed APK"]],
      steps: [["حمّل ملف APK، أو تابع التحديثات من Obtainium", "Download the APK, or follow updates with Obtainium"], ["اسمح بصلاحية الروت أول ما تفتحه", "Allow root when it first opens"], ["للجوال الثاني: وصّله بكيبل OTG", "For a second phone: connect it with an OTG cable"]],
      code: "", needs: ["Android 8+", "Root", "OTG"], credit: null,
      shots: [["img/mob/ar-device.webp", "img/mob/en-device.webp", ["الجهاز", "Device"]], ["img/mob/ar-flash.webp", "img/mob/en-flash.webp", ["التفليش", "Flash"]], ["img/mob/ar-kernel.webp", "img/mob/en-kernel.webp", ["الكيرنل", "Kernel"]], ["img/mob/ar-backups.webp", "img/mob/en-backups.webp", ["النسخ الاحتياطية", "Backups"]], ["img/mob/ar-otg.webp", "img/mob/en-otg.webp", ["OTG", "OTG"]]] },
    comp: { name: "Fastboot Studio Companion", repo: "ifoknr/FastbootStudio-Companion", icon: "img/glass/companion-dark.svg", ver: "v2.5.3", license: "MIT", tall: false,
      tagline: ["موديول روت يكمّل Fastboot Studio من داخل الجوال.", "A root module that brings Fastboot Studio onto the phone."],
      about: ["يقرأ الجهاز والأقسام وحالة الإقلاع من داخل الجوال، ويسوي نسخ احتياطية، ويكشف التعارض بين المودات، ويرسل كل هذا لـ Fastboot Studio على الكمبيوتر. قراءة فقط: ما يكتب على أي قسم.", "Reads the device, its partitions and its boot state from the phone itself, makes backups, finds conflicts between root modules, and hands it all to Fastboot Studio on the PC. Read-only: it never writes to a partition."],
      dl: ["تحميل الموديول", "Download the module"],
      points: [["حالة AVB من البوت لودر نفسه، ويكشف مود الإخفاء اللي يغيّرها", "The AVB state from the bootloader itself, and the hiding module that changes it"], ["يكشف التعارض بين المودات: نفس الملف، مجلد مستبدل، خاصية مكررة", "Finds conflicts between modules: the same file, a replaced folder, a property set twice"], ["نسخ احتياطي للأقسام من الجوال، وواجهة للجوال والتابلت بالوضع الليلي والنهاري", "Partition backups on the phone; a WebUI for phones and tablets, day and night"]],
      news: [["ملف update.json محدّث", "update.json updated"]],
      steps: [["حمّل ملف zip من زر التحميل", "Download the zip with the button"], ["ركّبه من مدير الروت: KernelSU أو Magisk أو APatch", "Install it in your root manager: KernelSU, Magisk or APatch"], ["أعد تشغيل الجوال، وافتح الواجهة من مدير الروت", "Restart, then open its WebUI from the root manager"]],
      code: "", needs: ["KernelSU", "Magisk", "APatch"], credit: null,
      shots: [["img/comp/webui-ar.webp", "img/comp/webui-en.webp", ["الواجهة", "WebUI"]], ["img/comp/webui-tablet-ar.webp", "img/comp/webui-tablet.webp", ["على التابلت", "On a tablet"]]] }
  };
  function cur() { var h = location.hash.slice(1); return APPS[h] ? h : "win"; }
  document.querySelectorAll("[data-en]").forEach(function (n) { n.dataset.ar = n.textContent; });
  function render() {
    var id = cur(), a = APPS[id];
    page.dir = lang === "en" ? "ltr" : "rtl"; page.lang = lang;
    document.documentElement.lang = lang; document.documentElement.dir = page.dir;
    document.querySelectorAll("[data-en]").forEach(function (n) { n.textContent = lang === "en" ? n.dataset.en : n.dataset.ar; });
    $("lang").textContent = lang === "en" ? "عربي" : "English";
    document.title = a.name;
    $("icon").src = a.icon; $("name").textContent = a.name;
    $("tagline").textContent = L(a.tagline); $("about").textContent = L(a.about);
    var rel = FB.data[id], repo = "https://github.com/" + a.repo;
    var ver = rel ? FB.short(rel.tag) : a.ver;
    $("cta").innerHTML = '<a class="btn fill" href="' + FB.esc(rel ? (rel.asset || rel.url) : repo + "/releases/latest") + '">' + L(a.dl) + ' <span class="ltr">' + FB.esc(ver) + '</span></a><a class="btn line" href="' + repo + '/releases" target="_blank" rel="noopener">' + L(["سجل التغييرات", "Changelog"]) + '</a><a class="btn line" href="' + repo + '" target="_blank" rel="noopener">' + L(["المصدر", "Source"]) + "</a>" + (a.xda ? '<a class="btn line" href="' + a.xda + '" target="_blank" rel="noopener">XDA</a>' : "");
    $("switch").innerHTML = Object.keys(APPS).map(function (k) { return '<a href="#' + k + '"' + (k === id ? ' aria-current="page"' : "") + '><img src="' + APPS[k].icon + '" alt=""><span class="ltr">' + (k === "win" ? "Windows" : k === "mob" ? "Mobile" : "Companion") + "</span></a>"; }).join("");
    var s0 = a.shots[0];
    $("heroframe").className = "shotframe" + (a.tall ? " tall" : "");
    $("heroimg").src = lang === "en" ? s0[1] : s0[0];
    $("facts").innerHTML = [[L(["الإصدار", "Version"]), ver], [L(["التاريخ", "Date"]), rel ? FB.date(rel.date, lang) : "…"], [L(["التحميلات", "Downloads"]), rel ? FB.num(rel.downloads) : "…"], [rel && rel.size ? L(["الحجم", "Size"]) : L(["الترخيص", "License"]), rel && rel.size ? FB.size(rel.size) : a.license]].map(function (f) { return '<div class="fact"><small>' + f[0] + '</small><b class="ltr">' + FB.esc(f[1]) + "</b></div>"; }).join("");
    var live = rel && rel.history[0] ? FB.notes(rel.history[0].body, lang) : [];
    $("newbox").innerHTML = '<span class="pill">' + L(["الجديد في ", "New in "]) + '<span class="ltr">' + FB.esc(ver) + '</span></span><ul class="list mt14">' + (live.length ? live.map(function (n) { return "<li>" + FB.esc(n) + "</li>"; }) : a.news.map(function (n) { return "<li>" + L(n) + "</li>"; })).join("") + "</ul>";
    $("points").innerHTML = a.points.map(function (p) { return "<li>" + L(p) + "</li>"; }).join("");
    $("steps").innerHTML = a.steps.map(function (p) { return "<li>" + L(p) + "</li>"; }).join("");
    $("code").innerHTML = a.code ? '<div class="code ltr"><code>' + a.code + '</code><button type="button" data-copy="' + a.code + '">' + L(["نسخ", "Copy"]) + "</button></div>" : "";
    $("needs").innerHTML = a.needs.map(function (n) { return '<span class="ltr">' + n + "</span>"; }).join("");
    $("credit").textContent = a.credit ? L(a.credit) + " " + L(["الترخيص", "License"]) + " MIT." : L(["الترخيص", "License"]) + " MIT.";
    $("gallery").className = "gallery" + (a.tall ? " tall" : "");
    $("gallery").innerHTML = a.shots.map(function (s) { return '<figure><img loading="lazy" src="' + (lang === "en" ? s[1] : s[0]) + '" alt="' + L(s[2]) + '"><figcaption>' + L(s[2]) + "</figcaption></figure>"; }).join("");
    $("history").innerHTML = rel ? rel.history.map(function (h) {
      var n = FB.notes(h.body, lang);
      return '<div class="tl-item"><b class="ltr">' + FB.esc(FB.short(h.tag)) + "<small>" + FB.esc(FB.date(h.date, lang)) + "</small></b><div>" + (n.length ? '<ul class="hist">' + n.map(function (x) { return "<li>" + FB.esc(x) + "</li>"; }).join("") + "</ul>" : "") + '<a class="go" href="' + FB.esc(h.url) + '" target="_blank" rel="noopener">' + L(["على GitHub", "On GitHub"]) + "</a></div></div>";
    }).join("") : '<p class="muted">' + L(["يتحمّل من GitHub…", "Loading from GitHub…"]) + "</p>";
  }
  $("lang").addEventListener("click", function () { lang = lang === "en" ? "ar" : "en"; try { localStorage.setItem("lang", lang); } catch (e) {} render(); });
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]"); if (!b) return;
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).then(function () { b.textContent = L(["تم النسخ", "Copied"]); }, function () {});
  });
  FB.onData(function () { render(); });
  render();
})();
