(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var page = $("#page");
  var lang = "ar";
  try { lang = localStorage.getItem("lang") || ((navigator.language || "").indexOf("ar") === 0 ? "ar" : "en"); } catch (e) {}
  // L(["arabic", "english"]) picks the visitor's language.
  function L(pair) { return lang === "en" ? pair[1] : pair[0]; }

  var ICON = { win: "img/glass/fastbootstudio-dark.svg", mob: "img/glass/mobile-dark.svg", comp: "img/glass/companion-dark.svg" };
  var NAME = { win: "Fastboot Studio", mob: "Fastboot Studio Mobile", comp: "Fastboot Studio Companion" };
  var INSTALL = {
    win: [["ثبّته بأمر واحد من winget، أو حمّل ملف zip", "Install it with one winget command, or download the zip"], ["شغّل Fastboot Studio ووصّل جوالك", "Run Fastboot Studio and connect your phone"], ["اتبع صفحة الترحيب: اللغة، الصفحات، والفحص", "Follow the welcome steps: language, pages, check"]],
    mob: [["حمّل ملف APK، أو تابع التحديثات من Obtainium", "Download the APK, or follow updates with Obtainium"], ["اسمح بصلاحية الروت أول ما تفتحه", "Allow root when it first opens"]],
    comp: [["حمّل ملف zip من زر التحميل", "Download the zip with the button"], ["ركّبه من مدير الروت: KernelSU أو Magisk أو APatch", "Install it in your root manager: KernelSU, Magisk or APatch"], ["أعد تشغيل الجوال، وافتح الواجهة من مدير الروت", "Restart, then open its WebUI from the root manager"]]
  };

  var GOALS = [
    { id: "root", label: ["أروّت جوالي", "Root my phone"], icon: '<path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/>', app: "win",
      why: ["روت بـ Magisk أو KernelSU أو APatch في أربع خطوات، وفحص صورة boot قبل التفليش.", "Root with Magisk, KernelSU or APatch in four steps, with the boot image checked before flashing."],
      steps: INSTALL.win.concat([["افتح صفحة الروت واختر مدير الروت", "Open the Root page and pick your root manager"]]) },
    { id: "ota", label: ["أفلّش تحديث OTA", "Flash an OTA update"], icon: '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>', app: "win",
      why: ["يفلّش payload.bin من ملف OTA مباشرة، ويحسب مساحة super ويسوي الأقسام الناقصة.", "Flashes payload.bin straight from an OTA zip, checks super space and creates missing partitions."],
      steps: [["حمّل ملف التحديث الكامل لجوالك", "Download the full update for your phone"], ["افتحه في صفحة Payload", "Open it on the Payload page"], ["راجع الأقسام والمساحة، وبعدها فلّش", "Review the partitions and space, then flash"]] },
    { id: "kernel", label: ["أفلّش كيرنل بدون كمبيوتر", "Flash a kernel without a PC"], icon: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>', app: "mob",
      why: ["يفلّش صورة boot أو ملف كيرنل AnyKernel3 من الجوال، وكل ملف ينفحص قبل الكتابة: من أي جوال جاء، ونوع الصورة، والكيرنل، وبصمة SHA-256.", "Flashes a boot image or an AnyKernel3 kernel from the phone. Every file is checked before writing: which phone it came from, the image type, the kernel and its SHA-256."],
      steps: INSTALL.mob.concat([["اختر الملف، والتطبيق ياخذ نسخة احتياطية قبل الكتابة", "Pick the file; the app takes a backup before writing"]]) },
    { id: "samsung", label: ["جوالي سامسونج", "My phone is a Samsung"], icon: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>', app: "win",
      why: ["من v3.0.0: دعم أجهزة سامسونج عن طريق وضع Download.", "Since v3.0.0: Samsung phones through Download mode."],
      steps: INSTALL.win.slice(0, 2).concat([["حط جوالك على وضع Download ووصّله", "Put your phone in Download mode and connect it"], ["افتح صفحة سامسونج", "Open the Samsung page"]]) },
    { id: "otg", label: ["أنقذ جوال ثاني", "Rescue another phone"], icon: '<rect x="3" y="6" width="7" height="12" rx="1.5"/><rect x="14" y="6" width="7" height="12" rx="1.5"/><path d="M10 12h4"/>', app: "mob",
      why: ["يفلّش جوال ثاني في وضع fastboot بكيبل OTG، والجوال الثاني ما يحتاج روت.", "Flashes another phone in fastboot mode over an OTG cable; the other phone needs no root."],
      steps: INSTALL.mob.concat([["وصّل الجوال الثاني بكيبل OTG وهو على وضع fastboot", "Connect the other phone with an OTG cable, in fastboot mode"]]) },
    { id: "check", label: ["أفحص جوالي قبل أي شي", "Check my phone first"], icon: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>', app: "comp",
      why: ["يقرأ الجهاز والأقسام وحالة الإقلاع من داخل الجوال، ويكشف التعارض بين المودات. قراءة فقط: ما يكتب على أي قسم.", "Reads the device, its partitions and boot state from inside the phone, and finds conflicts between modules. Read only: it writes to no partition."],
      steps: INSTALL.comp }
  ];
  var goal = "root";

  var TOUR = {
    win: [
      ["img/win/ar-02-device.webp", "img/win/light-02-device.webp", ["الجهاز", "Device"], ["حالة الجوال مباشرة: الخصائص والأقسام والإجراءات السريعة.", "The phone's state live: properties, partitions and quick actions."]],
      ["img/win/ar-03-flash.webp", "img/win/light-03-flash.webp", ["التفليش", "Flash"], ["تفليش الصور، مع فحص صورة boot قبل الكتابة.", "Flash images, with the boot image checked before writing."]],
      ["img/win/ar-01-payload.webp", "img/win/light-01-payload.webp", ["Payload", "Payload"], ["يفتح payload.bin من ملف OTA مباشرة ويعرض أقسامه.", "Opens payload.bin straight from an OTA zip and lists its partitions."]],
      ["img/win/ar-10-super.webp", "img/win/ar-10-super.webp", ["بناء Super", "Build Super"], ["يحسب مساحة super ويسوي الأقسام الناقصة.", "Checks super space and creates missing partitions."]],
      ["img/win/ar-odin-4-plan.webp", "img/win/en-odin-4-plan.webp", ["سامسونج", "Samsung"], ["أجهزة سامسونج عن طريق وضع Download.", "Samsung phones through Download mode."]],
      ["img/win/ar-05-backup-partitions.webp", "img/win/ar-05-backup-partitions.webp", ["النسخ الاحتياطي", "Backup"], ["نسخ احتياطي للأقسام قبل أي تغيير.", "Partition backups before any change."]],
      ["img/win/ar-08-images-super.webp", "img/win/ar-08-images-super.webp", ["أدوات الصور", "Image tools"], ["يستخرج الصور ويعرض تفاصيلها.", "Extracts images and shows their details."]],
      ["img/win/ar-11-phone.webp", "img/win/light-06-phone.webp", ["الجوال", "Phone"], ["صفحة الجوال مع إضافة Companion.", "The phone page with the Companion module."]],
      ["img/win/ar-welcome-4-safety.webp", "img/win/en-welcome-4-safety.webp", ["الترحيب والأمان", "Welcome and safety"], ["صفحة الترحيب: اللغة، الصفحات، والفحص.", "The welcome steps: language, pages, check."]]
    ],
    mob: [
      ["img/mob/ar-device.webp", "img/mob/en-device.webp", ["الجهاز", "Device"], ["معلومات الجوال وحالته.", "The phone's details and state."]],
      ["img/mob/ar-flash.webp", "img/mob/en-flash.webp", ["التفليش", "Flash"], ["فحص قبل كل تفليش: الملف الغلط أو المتلاعب فيه ينرفض.", "A check before every flash: a wrong or tampered file is refused."]],
      ["img/mob/ar-kernel.webp", "img/mob/en-kernel.webp", ["الكيرنل", "Kernel"], ["تفليش ملف كيرنل AnyKernel3 من الجوال.", "Flash an AnyKernel3 kernel from the phone."]],
      ["img/mob/ar-backups.webp", "img/mob/en-backups.webp", ["النسخ الاحتياطية", "Backups"], ["نسخة قبل الكتابة، في نفس مجلدات برنامج الويندوز والـ Companion.", "A backup before writing, in the same folders as the Windows app and the Companion."]],
      ["img/mob/ar-otg.webp", "img/mob/en-otg.webp", ["OTG", "OTG"], ["تفليش جوال ثاني في وضع fastboot بالكيبل.", "Flash another phone in fastboot mode over a cable."]]
    ],
    comp: [
      ["img/comp/webui-ar.webp", "img/comp/webui-en.webp", ["الواجهة", "WebUI"], ["حالة AVB من البوت لودر، وتعارض المودات، والنسخ الاحتياطي.", "The AVB state from the bootloader, module conflicts and backups."]],
      ["img/comp/webui-tablet-ar.webp", "img/comp/webui-tablet.webp", ["على التابلت", "On a tablet"], ["نفس الواجهة للتابلت، بالوضع الليلي والنهاري.", "The same WebUI on tablets, day and night."]]
    ]
  };
  var curApp = "win", curPage = 0;

  var TERMS = [
    ["Fastboot", ["فاست بوت", "Fastboot"], ["وضع في البوت لودر يستقبل أوامر من الكمبيوتر بكيبل USB: تفليش الأقسام ومسحها وإعادة التشغيل.", "A bootloader mode that takes commands from a PC over USB: flash or erase partitions, reboot."], ["Fastboot Studio، وتطبيق الجوال عن طريق OTG", "Fastboot Studio, and the phone app over OTG"]],
    ["Fastbootd", ["فاست بوت دي", "Fastbootd"], ["نسخة من fastboot تشتغل من الريكفري، وتحتاجها لتفليش الأقسام اللي داخل super.", "A fastboot that runs from recovery, needed to flash the partitions inside super."], ["Fastboot Studio: النسخ الاحتياطي والتفليش", "Fastboot Studio: backups and flashing"]],
    ["Bootloader", ["البوت لودر", "Bootloader"], ["أول برنامج يشتغل لما تشغّل الجوال، يتحقق من النظام ويشغّله. فك قفله شرط للتفليش والروت.", "The first program that runs when the phone starts; it checks the system and starts it. Unlocking it is required to flash or root."], null],
    ["boot / init_boot", ["صورة الإقلاع", "Boot image"], ["فيها الكيرنل والـ ramdisk. في جوالات أندرويد 13 وفوق، الـ ramdisk صار في init_boot. الروت يعدّل وحدة منهم.", "Holds the kernel and ramdisk. On phones launched with Android 13 and later the ramdisk moved to init_boot. Rooting patches one of them."], ["يفحصها Fastboot Studio قبل التفليش", "Fastboot Studio checks it before flashing"]],
    ["OTA", ["تحديث النظام", "System update"], ["التحديث اللي يوصل للجوال. الكامل منه فيه ملف payload.bin.", "The update the phone receives. A full one contains payload.bin."], null],
    ["payload.bin", ["حزمة التحديث", "Update payload"], ["الملف داخل تحديث OTA اللي فيه صور كل الأقسام مضغوطة.", "The file inside an OTA update that holds every partition image, compressed."], ["Fastboot Studio: صفحة Payload", "Fastboot Studio: the Payload page"]],
    ["super", ["القسم الكبير", "Super partition"], ["قسم في الجوالات الحديثة يحتوي الأقسام الديناميكية مثل system وvendor وproduct.", "A partition on modern phones that holds the dynamic partitions such as system, vendor and product."], ["Fastboot Studio: بناء Super", "Fastboot Studio: Build Super"]],
    ["A/B", ["الخانتين", "Slots"], ["نسختين من الأقسام (a وb). التحديث ينزل على الخانة الثانية، ولو فشل يرجع الجوال للأولى.", "Two copies of the partitions (a and b). An update goes to the other slot, and the phone falls back if it fails."], null],
    ["AVB / vbmeta", ["التحقق من الإقلاع", "Verified boot"], ["يتأكد إن الأقسام ما انعدّلت، وvbmeta يحمل بصماتها.", "Checks the partitions were not modified; vbmeta holds their fingerprints."], ["Companion يقرأ حالته من البوت لودر", "The Companion reads its state from the bootloader"]],
    ["Download mode", ["وضع التحميل", "Download mode"], ["وضع التفليش في أجهزة سامسونج بدل fastboot.", "Samsung's flashing mode, in place of fastboot."], ["Fastboot Studio من v3.0.0", "Fastboot Studio since v3.0.0"]],
    ["ADB", ["أي دي بي", "ADB"], ["أداة تتواصل مع الجوال وهو شغّال على النظام أو الريكفري.", "A tool that talks to the phone while it runs the system or recovery."], null],
    ["Recovery", ["الريكفري", "Recovery"], ["نظام صغير منفصل للتحديث والمسح والإصلاح.", "A small separate system for updates, wipes and repairs."], null],
    ["Magisk · KernelSU · APatch", ["مدراء الروت", "Root managers"], ["Magisk يعدّل صورة الإقلاع، وKernelSU وAPatch يشتغلون من داخل الكيرنل.", "Magisk patches the boot image; KernelSU and APatch work from inside the kernel."], ["Fastboot Studio يروّت بأي واحد منهم", "Fastboot Studio roots with any of them"]],
    ["AnyKernel3", ["ملف كيرنل", "Kernel zip"], ["صيغة zip منتشرة لتفليش الكيرنلات المعدّلة.", "A common zip format for flashing custom kernels."], ["تطبيق الجوال", "The phone app"]],
    ["SHA-256", ["البصمة", "Fingerprint"], ["رقم يطلع من محتوى الملف. لو تغيّر بايت واحد تتغيّر البصمة، فتعرف إن الملف سليم.", "A number computed from a file's content. Change one byte and it changes, so you know the file is intact."], ["تطبيق الجوال يفحصها قبل التفليش", "The phone app checks it before flashing"]],
    ["OTG", ["أو تي جي", "OTG"], ["يخلّي الجوال يتصرف كأنه كمبيوتر، فتقدر توصّل فيه جوال ثاني بالكيبل.", "Lets the phone act as a USB host, so you can connect another phone by cable."], ["تطبيق الجوال", "The phone app"]]
  ];

  // Smart download: the visitor's system picks the main button (?os=win|android|other to try).
  var q = (location.search.match(/os=(\w+)/) || [])[1];
  var ua = navigator.userAgent;
  var os = q || (/Android/i.test(ua) ? "android" : /Windows/i.test(ua) ? "win" : "other");
  function drawSmart() {
    var alt;
    if (os === "android") {
      $("#osname").textContent = L(["أندرويد", "Android"]);
      $("#smartbtn").textContent = L(["تحميل Fastboot Studio Mobile", "Download Fastboot Studio Mobile"]);
      alt = L(["أو ", "Or "]) + '<a href="#get">' + L(["موديول Companion", "the Companion module"]) + "</a> · <a href=\"#get\">" + L(["برنامج الويندوز", "the Windows app"]) + "</a>";
    } else if (os === "win") {
      $("#osname").textContent = "Windows";
      $("#smartbtn").textContent = L(["تحميل Fastboot Studio للويندوز", "Download Fastboot Studio for Windows"]);
      alt = L(["أو ", "Or "]) + '<a href="#get">' + L(["تطبيق الجوال", "the phone app"]) + "</a> · <a href=\"#get\">" + L(["موديول Companion", "the Companion module"]) + "</a>";
    } else {
      $("#osname").textContent = L(["جهاز غير ويندوز", "not Windows"]);
      $("#smartbtn").textContent = L(["شوف كل التحميلات", "See all downloads"]);
      alt = L(["برنامج الكمبيوتر للويندوز بس، وتطبيق الجوال يشتغل على أي أندرويد 8+.", "The PC app is for Windows only; the phone app runs on any Android 8+."]);
    }
    $("#smartalt").innerHTML = alt;
  }

  function drawGoals() {
    $("#goals").innerHTML = GOALS.map(function (g) {
      return '<button class="goal" type="button" data-g="' + g.id + '" aria-pressed="' + (g.id === goal) + '"><span class="gi"><svg viewBox="0 0 24 24">' + g.icon + "</svg></span>" + L(g.label) + "</button>";
    }).join("");
    document.querySelectorAll(".goal").forEach(function (b) { b.addEventListener("click", function () { goal = b.dataset.g; drawGoals(); }); });
    var x = GOALS.filter(function (g) { return g.id === goal; })[0];
    $("#answer").innerHTML = '<img class="ic" src="' + ICON[x.app] + '" alt=""><div><span class="pill">' + L(["ننصحك بـ", "We suggest"]) + '</span><h3 class="mt8"><span class="ltr">' + NAME[x.app] + '</span></h3><p class="why">' + L(x.why) +
      '</p><ol class="steps">' + x.steps.map(function (s) { return "<li>" + L(s) + "</li>"; }).join("") +
      '</ol><div class="acts"><a class="btn fill" href="#get">' + L(["تحميل ", "Download "]) + NAME[x.app] + '</a><a class="btn line" href="app.html#' + x.app + '">' + L(["صفحة التطبيق", "App page"]) + "</a></div></div>";
  }

  function showPage(i) {
    curPage = i;
    var p = TOUR[curApp][i];
    $("#viewimg").src = lang === "en" ? p[1] : p[0];
    $("#viewimg").alt = L(p[2]);
    $("#view").className = "view" + (curApp === "mob" ? " tall" : "");
    $("#cap").textContent = L(p[3]);
    document.querySelectorAll("#pagetabs button").forEach(function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); });
  }
  function drawTour() {
    document.querySelectorAll(".apptabs button").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.app === curApp ? "true" : "false"); });
    $("#pagetabs").innerHTML = TOUR[curApp].map(function (p, i) { return '<button type="button" role="tab" data-i="' + i + '"><b>' + L(p[2]) + "</b><small>" + L(p[3]) + "</small></button>"; }).join("");
    document.querySelectorAll("#pagetabs button").forEach(function (b) { b.addEventListener("click", function () { showPage(+b.dataset.i); }); });
    showPage(Math.min(curPage, TOUR[curApp].length - 1));
  }
  document.querySelectorAll(".apptabs button").forEach(function (b) { b.addEventListener("click", function () { curApp = b.dataset.app; curPage = 0; drawTour(); }); });

  function drawTerms() {
    var f = ($("#gq").value || "").trim().toLowerCase();
    var list = TERMS.filter(function (t) { return !f || JSON.stringify(t).toLowerCase().indexOf(f) >= 0; });
    $("#terms").innerHTML = list.map(function (t) {
      return '<article class="term"><h3><span class="ltr">' + t[0] + "</span><small>" + (lang === "en" && t[1][1] === t[0] ? "" : L(t[1])) + "</small></h3><p>" + L(t[2]) + "</p>" + (t[3] ? '<div class="in">' + L(["وين تلقاه: ", "Where: "]) + L(t[3]) + "</div>" : "") + "</article>";
    }).join("");
    $("#none").hidden = list.length > 0;
  }
  $("#gq").addEventListener("input", drawTerms);

  // Static text: Arabic is in the markup, English in data-en / data-en-html / data-en-src.
  document.querySelectorAll("[data-en]").forEach(function (n) { n.dataset.ar = n.textContent; });
  document.querySelectorAll("[data-en-html]").forEach(function (n) { n.dataset.arHtml = n.innerHTML; });
  document.querySelectorAll("[data-en-src]").forEach(function (n) { n.dataset.arSrc = n.getAttribute("src"); });
  function apply() {
    page.dir = lang === "en" ? "ltr" : "rtl";
    page.lang = lang;
    document.querySelectorAll("[data-en]").forEach(function (n) { n.textContent = lang === "en" ? n.dataset.en : n.dataset.ar; });
    document.querySelectorAll("[data-en-html]").forEach(function (n) { n.innerHTML = lang === "en" ? n.dataset.enHtml : n.dataset.arHtml; });
    document.querySelectorAll("[data-en-src]").forEach(function (n) { n.src = lang === "en" ? n.dataset.enSrc : n.dataset.arSrc; });
    $("#lang").textContent = lang === "en" ? "عربي" : "English";
    $("#gq").placeholder = L(["دوّر: super، AVB، payload…", "Search: super, AVB, payload…"]);
    $("#gq").setAttribute("aria-label", L(["بحث في المصطلحات", "Search the glossary"]));
    drawSmart(); drawGoals(); drawTour(); drawTerms();
  }
  $("#lang").addEventListener("click", function () {
    lang = lang === "en" ? "ar" : "en";
    try { localStorage.setItem("lang", lang); } catch (e) {}
    apply();
  });
  if (/lang=en/.test(location.search)) lang = "en";
  apply();

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]");
    if (!b) return;
    var done = function () { b.textContent = L(["تم النسخ", "Copied"]); setTimeout(function () { b.textContent = L(["نسخ", "Copy"]); }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).then(done, function () {});
  });
})();

// Hero: the app's dark and light themes take turns; a click picks one and stops the turns.
(function () {
  var dev = document.getElementById("device"); if (!dev) return;
  var btns = document.querySelectorAll(".modes button"), auto = null;
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function set(m) { dev.dataset.mode = m; btns.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.mode === m ? "true" : "false"); }); }
  btns.forEach(function (b) { b.addEventListener("click", function () { clearInterval(auto); auto = null; set(b.dataset.mode); }); });
  function start() { if (still || auto) return; auto = setInterval(function () { set(dev.dataset.mode === "dark" ? "light" : "dark"); }, 3800); }
  var picked = false;
  btns.forEach(function (b) { b.addEventListener("click", function () { picked = true; }); });
  dev.addEventListener("mouseenter", function () { clearInterval(auto); auto = null; });
  dev.addEventListener("mouseleave", function () { if (!picked) start(); });
  start();
})();


// Language switches re-render the release cards in the new language.
document.getElementById("lang").addEventListener("click", function () { setTimeout(function () { FB.fill(FB.lang()); }, 0); });
