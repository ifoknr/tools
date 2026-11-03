(function () {
  "use strict";
  var I = {
    ic_flash: '<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
    ic_root: '<path d="M12 21V11M12 11c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z"/>',
    ic_backup: '<path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5"/>',
    ic_samsung: '<path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM12 7v7M9 11l3 3 3-3M10 18h4"/>',
    ic_super: '<path d="M4 5h16v4H4zM4 11h7v8H4zM13 11h7v8h-7z"/>',
    ic_help: '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.3 2-2.3 3.6M12 17h.01"/>'
  };
  var T = {
    ar: {
      n_features: "الميزات", n_android: "أندرويد", n_safety: "الأمان", n_get: "تحميل", lang: "English", download: "تحميل",
      chip: "مجاني ومفتوح المصدر · ويندوز وأندرويد",
      h1: "فلّش، خذ نسخة، وروّت. بأمان.",
      lead: "Fastboot Studio لويندوز وأندرويد: يفحص كل ملف قبل ما يلمس جوالك، ويوقفك قبل الغلطة اللي تخرّب الجهاز.",
      win: "تحميل لويندوز", and: "تطبيق الأندرويد", apk: "تحميل APK",
      f_h: "كل اللي يحتاجه الفلاش، في مكان واحد", f_d: "من ملف OTA لين الروت، بدون أوامر تحفظها وبدون تخمين.",
      cards: [
        ["ic_flash", "t1", "فلاش OTA و payload", "يفلّش payload.bin من ملف OTA مباشرة، ويحسب مساحة super قبل ما يبدأ، وينشئ البارتشنات الناقصة.", "شوف الفلاش"],
        ["ic_root", "t2", "روت بأربع خطوات", "Magisk أو KernelSU أو APatch: يسحب boot، يعدّله على الجوال، ويرجّعه بعد ما يتأكد منه.", "شوف الروت"],
        ["ic_backup", "t3", "نسخة احتياطية أول", "البارتشنات والملفات عن طريق adb، قبل أي كتابة، في نفس المجلدات حق التطبيقات الثانية.", "شوف النسخ"],
        ["ic_samsung", "t4", "سامسونج ووضع التحميل", "يفتح روم سامسونج ويفحص MD5، ويقرا الجوال في وضع التحميل: الموديل والمنطقة وجدول PIT.", "شوف سامسونج"],
        ["ic_super", "t1", "أدوات الصور و super", "تحويل sparse، وفك super وبناءه من جديد، وتفاصيل صورة boot: الكيرنل والـ KMI والروت.", "شوف الأدوات"],
        ["ic_help", "t2", "شرح بكل صفحة", "زر ؟ يفتح شرح الصفحة: وش تسوي، الخطوات، والأشياء اللي تخرّب للأبد. بالعربي والإنجليزي.", "شوف الشرح"]
      ],
      s_h: "يوقفك قبل الغلطة", s_d: "قبل كل فلاش يفحص الصورة والسلوت ومساحة super والبارتشنات الحساسة. الشي اللي ممكن يقفل الجوال يطلب منك تأكيد، والشي اللي يخرّبه ما يسمح فيه.", s_more: "وش يفحص بالضبط",
      a_h: "وعلى الجوال بعد", a_d: "تطبيق أندرويد يفلّش جوال ثاني بكيبل OTG، وموديول روت يكمّل Fastboot Studio من داخل الجوال.",
      m_d: "Fastboot Studio على الجوال نفسه: فلّش بأمان بدون كمبيوتر.",
      c_d: "موديول روت يعطي Fastboot Studio حالة الجوال الحقيقية من داخله.",
      stats: [["5", "لغات"], ["Windows 10 / 11", "ويندوز"], ["Android 8+", "أندرويد"], ["MIT", "مفتوح المصدر"]],
      g_h: "جاهز تفلّش وانت مطمّن؟", g_d: "حمّله مجاناً لويندوز، أو ثبّته بأمر واحد من winget، وخذ تطبيق الأندرويد معه.", g_f: "التحديثات تنفحص بـ SHA-256 قبل ما تنحفظ.",
      dev: "المطوّر"
    },
    en: {
      n_features: "Features", n_android: "Android", n_safety: "Safety", n_get: "Download", lang: "عربي", download: "Download",
      chip: "Free and open source · Windows and Android",
      h1: "Flash, back up and root. Safely.",
      lead: "Fastboot Studio for Windows and Android checks every file before it touches your phone, and stops the mistakes that brick it.",
      win: "Download for Windows", and: "Get the Android app", apk: "Download the APK",
      f_h: "Everything flashing needs, in one place", f_d: "From an OTA zip to root, with no commands to remember and no guessing.",
      cards: [
        ["ic_flash", "t1", "OTA and payload flashing", "Flashes payload.bin straight from an OTA zip, checks super's space before it starts, and creates missing partitions.", "See flashing"],
        ["ic_root", "t2", "Root in four steps", "Magisk, KernelSU or APatch: it pulls boot, patches it on the phone, and flashes it back once checked.", "See root"],
        ["ic_backup", "t3", "A backup first", "Partitions and files over adb, before anything is written, in the same folders as the other apps.", "See backups"],
        ["ic_samsung", "t4", "Samsung and Download mode", "Opens Samsung firmware and checks its MD5, and reads a phone in Download mode: model, region and PIT.", "See Samsung"],
        ["ic_super", "t1", "Image tools and super", "Sparse conversion, super unpacked and rebuilt, and a boot image's details: kernel, KMI and root.", "See the tools"],
        ["ic_help", "t2", "Help on every page", "A ? opens the page's help: what it does, the steps, and what breaks for good. In English and Arabic.", "See the help"]
      ],
      s_h: "It stops you before the mistake", s_d: "Before every flash it checks the image, the slot, super's space and the critical partitions. What could lock the phone asks you first; what would brick it is not allowed.", s_more: "What it checks",
      a_h: "And on the phone too", a_d: "An Android app that flashes another phone over an OTG cable, and a root module that completes Fastboot Studio from inside the phone.",
      m_d: "Fastboot Studio on the phone itself: flash safely, no PC needed.",
      c_d: "A root module that gives Fastboot Studio the phone's real state from inside.",
      stats: [["5", "languages"], ["Windows 10 / 11", "Windows"], ["Android 8+", "Android"], ["MIT", "open source"]],
      g_h: "Ready to flash without the worry?", g_d: "Download it free for Windows, or install it with one winget command, and take the Android app with it.", g_f: "Updates are checked with SHA-256 before they are kept.",
      dev: "Developer"
    }
  };
  var PTS = {
    ar: {
      m: ["فحص قبل كل فلاش: الملف الغلط أو المعدّل، أو كيرنل من سلسلة ثانية، ينرفض", "نسخة احتياطية قبل الكتابة", "OTG: فلّش جوال ثاني في وضع fastboot بكيبل، بدون روت"],
      c: ["حالة AVB من البوت لودر نفسه", "يلقى التعارضات بين الموديولات", "نسخ البارتشنات على الجوال، وواجهة للجوال والتابلت"]
    },
    en: {
      m: ["A check before every flash: a wrong or tampered file, or a kernel of another series, is refused", "A backup before writing", "OTG: flash another phone in fastboot mode over a cable, no root needed"],
      c: ["The AVB state from the bootloader itself", "Finds conflicts between modules", "Partition backups on the phone; a WebUI for phones and tablets"]
    }
  };
  var LOG = [
    ["dim", "$ flash boot_a ← magisk_patched-28100.img"],
    ["ok", "✓ boot image · Magisk 28.1 · KMI android14-6.1"],
    ["ok", "✓ slot a is active · the image fits (64 MB)"],
    ["ok", "✓ a backup of boot_a was kept"],
    ["warn", "! vbmeta · verity is on: flash it with --disable-verity?"],
    ["bad", "✗ modem_a · refused from fastbootd: use the bootloader"],
    ["dim", "  waiting for your answer…"]
  ];
  var qs = new URLSearchParams(location.search), root = document.documentElement;
  var L = qs.get("lang") === "en" ? "en" : "ar";
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  function render() {
    var t = T[L];
    root.lang = L; root.dir = L === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-t]").forEach(function (n) { n.textContent = t[n.getAttribute("data-t")]; });
    document.getElementById("cards").innerHTML = t.cards.map(function (c) {
      return '<article class="card"><span class="tile ' + c[1] + '"><svg viewBox="0 0 24 24">' + I[c[0]] + '</svg></span><h3>' + esc(c[2]) + "</h3><p>" + esc(c[3]) + '</p><a class="more" href="#">' + esc(c[4]) + "</a></article>";
    }).join("");
    document.getElementById("m_pts").innerHTML = PTS[L].m.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    document.getElementById("c_pts").innerHTML = PTS[L].c.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    document.getElementById("stats").innerHTML = t.stats.map(function (s) { return '<div class="stat"><b>' + esc(s[0]) + "</b><span>" + esc(s[1]) + "</span></div>"; }).join("");
    document.getElementById("term").innerHTML = LOG.map(function (l, i) { return '<span class="' + l[0] + '"><em>' + (i + 1) + "</em>" + esc(l[1]) + "</span>"; }).join("\n");
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-act=lang]");
    if (a) { L = L === "ar" ? "en" : "ar"; render(); }
  });
  render();
})();
