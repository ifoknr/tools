// One guide page for each tool: tool.html#zy, #wh, #su. Text from the site's tools.json;
// version, date, downloads and history read live by live.js.
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var L = function (p) { return IF.lang() === "en" ? p[1] : p[0]; };
  var STEPS = [["حمّل ملف zip من زر التحميل", "Download the zip with the button above"], ["ركّبه من مدير الروت: KernelSU أو Magisk أو APatch", "Install it in your root manager: KernelSU, Magisk or APatch"], ["أعد تشغيل الجوال، وافتح الواجهة من مدير الروت", "Restart, then open its WebUI from the root manager"]];
  var LAYERS = [["wh", "NextWheel", ["التطبيقات", "Apps"]], ["zy", "NextZygisk", ["Zygote", "Zygote"]], ["su", "NextSUSFS", ["النواة", "Kernel"]]];
  var T = {
    zy: { name: "NextZygisk", repo: "ifoknr/NexTZygisk", cls: "c-sage", tool: "var(--c-zy)", tint: "var(--t-zy)", ver: "v1.0.7", license: "AGPL-3.0",
      tag: ["Zygisk مستقل لكل مدراء الروت.", "Standalone Zygisk for every root manager."],
      about: ["يشغّل وحدات Zygisk مثل LSPosed، NextWheel، Play Integrity Fix، ويخفي الروت عن التطبيقات اللي تختارها.", "Runs Zygisk modules such as LSPosed, Play Integrity Fix and NextWheel, and hides root from the apps you choose."],
      points: [["فتح أسرع للتطبيقات: الإجابة تجي من الذاكرة بدل قاعدة البيانات", "Faster app launches: answers come from memory, not the database"], ["أكثر من 12 إصلاح في الخدمة والمراقبة والكود داخل Zygote", "More than a dozen fixes in the daemon, monitor and Zygote code"], ["لوحة تحكم داخل مدير الروت: الحالة والوحدات والإخفاء", "A dashboard in your root manager: status, modules and hiding"]],
      layer: ["الطبقة الوسطى: تشتغل داخل عملية Zygote اللي تنطلق منها كل التطبيقات، وتشغّل وحدات Zygisk مثل NextWheel.", "The middle layer: it runs inside Zygote, the process every app starts from, and runs Zygisk modules such as NextWheel."],
      needs: ["KernelSU", "ReSukiSU", "Magisk", "APatch", "Android 7.1+"], base: ["مبني على ReZygisk من PerformanC.", "Based on ReZygisk by PerformanC."] },
    wh: { name: "NextWheel", repo: "ifoknr/NextWheel", cls: "c-sky", tool: "var(--c-wh)", tint: "var(--t-wh)", ver: "v0.0.18", license: "AGPL-3.0",
      tag: ["طبقة التطبيقات: يخفي Zygisk والروت داخل التطبيقات.", "The app layer: hides Zygisk and root inside apps."],
      about: ["مبني ليشتغل مع NextZygisk. خفيف وما يترك أثر، ومعه لوحة حية توضّح إذا الإخفاء شغّال أو توقف.", "Built to work with NextZygisk. Light and traceless, with a live dashboard that shows whether hiding works or stopped."],
      points: [["لوحة حية: الإخفاء شغّال، انهار، أو Zygisk وقف", "Live dashboard: working, crashed, or Zygisk stopped"], ["يشتغل مع NextZygisk أو ReZygisk", "Works with NextZygisk and ReZygisk"], ["واجهة بـ 11 لغة منها العربي، للجوال والتابلت", "WebUI in 11 languages including Arabic, for phones and tablets"]],
      layer: ["الطبقة العليا: تشتغل داخل التطبيقات نفسها، وتخفي Zygisk والروت عن التطبيق اللي يدوّر عليهم.", "The top layer: it works inside the apps themselves, hiding Zygisk and root from an app that looks for them."],
      needs: ["NextZygisk / ReZygisk 508+", "Magisk", "KernelSU", "APatch", "Android 7.1+"], base: ["مبني على Treat Wheel من ThePedroo.", "Based on Treat Wheel by ThePedroo."] },
    su: { name: "NextSUSFS", repo: "ifoknr/NextSUSFS", cls: "c-rose", tool: "var(--c-su)", tint: "var(--t-su)", ver: "v0.0.14", license: "AGPL-3.0",
      tag: ["إخفاء الروت من مستوى النواة مع SuSFS.", "Kernel-level root hiding with SuSFS."],
      about: ["يخفي المسارات ونقاط الربط وخرائط الذاكرة والخصائص عن التطبيقات، وكل الإعدادات في واجهة وحدة.", "Hides paths, mounts, memory maps and properties from apps, with every option in one WebUI."],
      points: [["يخفي منظومة NEXT لحاله مع كل إقلاع", "Hides the NEXT stack automatically at every boot"], ["أكثر من 40 إعداد في 7 صفحات، وقوائم إخفاء خاصة فيك", "40+ settings across 7 pages, plus your own hide lists"], ["أدوات الفحص داخل الواجهة: Native Detector وغيره", "Detector apps one tap away to check the result"]],
      layer: ["الطبقة الأساس: تشتغل من النواة، فتخفي اللي ما توصله الطبقتين اللي فوقها.", "The base layer: it works from the kernel, hiding what the two layers above cannot reach."],
      needs: ["KernelSU / Next / ReSukiSU / SukiSU", "SuSFS v2"], base: ["يستخدم susfs4ksu من simonpunk.", "Uses susfs4ksu by simonpunk."] }
  };
  function cur() { var h = location.hash.slice(1); return T[h] ? h : "zy"; }
  function render() {
    var id = cur(), t = T[id], r = LIVE.data[id], en = IF.lang() === "en", repo = "https://github.com/" + t.repo;
    var thero = $("thero"), page = $("page");
    thero.className = "card wide thero " + t.cls;
    page.style.setProperty("--tool", t.tool); thero.style.setProperty("--tint", t.tint);
    document.title = t.name + " · IFOKNR Tools";
    $("switch").innerHTML = LAYERS.map(function (l) { return '<a href="#' + l[0] + '"' + (l[0] === id ? ' aria-current="page"' : "") + '><img src="assets/img/tools/' + T[l[0]].name.toLowerCase() + '.svg" alt="">' + l[1] + "</a>"; }).join("");
    $("ticon").src = "assets/img/tools/" + t.name.toLowerCase() + ".svg";
    $("tname-dk").src = "assets/img/names/" + t.name.toLowerCase() + "-dark.svg"; $("tname-dk").alt = t.name;
    $("tname-lt").src = "assets/img/names/" + t.name.toLowerCase() + "-light.svg";
    // On the coloured card (night) the dark-text name reads; on white (day) too.
    $("tname-dk").src = "assets/img/names/" + t.name.toLowerCase() + "-light.svg";
    $("tshot-dk").src = "assets/ui/" + id + "-dark.webp"; $("tshot-lt").src = "assets/ui/" + id + "-light.webp";
    $("tshot-dk").alt = t.name + " WebUI";
    $("ttag").textContent = L(t.tag); $("tabout").textContent = L(t.about);
    var ver = r ? LIVE.short(r.tag) : t.ver;
    $("tacts").innerHTML = '<a class="btn d" href="' + LIVE.esc(r ? (r.asset || r.url) : repo + "/releases/latest") + '" target="_blank" rel="noopener">' + L(["تحميل", "Download"]) + ' <span class="ltr">' + LIVE.esc(ver) + "</span></a>" +
      '<a class="btn o dark-on-card" href="' + repo + '/releases" target="_blank" rel="noopener">' + L(["سجل التغييرات", "Changelog"]) + "</a>" +
      '<a class="btn o dark-on-card" href="' + repo + '" target="_blank" rel="noopener">' + L(["المصدر", "Source"]) + "</a>";
    var facts = [[L(["الإصدار", "Version"]), ver], [L(["التحميلات", "Downloads"]), r ? LIVE.num(r.downloads) : "—"], [L(["آخر تحديث", "Updated"]), r ? LIVE.date(r.date, IF.lang()) : "—"], [L(["الترخيص", "Licence"]), t.license]];
    $("facts").innerHTML = facts.map(function (f) { return '<div class="fact"><small>' + f[0] + '</small><b class="ltr">' + LIVE.esc(f[1]) + "</b></div>"; }).join("");
    $("tlayers").innerHTML = LAYERS.map(function (l) { return '<div class="tl' + (l[0] === id ? " on" : "") + '"><img src="assets/img/tools/' + T[l[0]].name.toLowerCase() + '.svg" alt=""><b>' + l[1] + "</b><small>" + L(l[2]) + "</small></div>"; }).join("");
    $("tlayer").textContent = L(t.layer);
    $("tpoints").innerHTML = t.points.map(function (x) { return "<li>" + L(x) + "</li>"; }).join("");
    $("tsteps").innerHTML = STEPS.map(function (x) { return "<li>" + L(x) + "</li>"; }).join("");
    $("tneeds").innerHTML = t.needs.map(function (x) { return "<span>" + x + "</span>"; }).join("");
    $("tbase").textContent = L(t.base) + " " + L(["الترخيص", "Licence"]) + " " + t.license + ".";
    $("thist").innerHTML = r ? r.history.map(function (h) {
      var n = LIVE.notes(h.body, IF.lang());
      return '<div class="hrow"><div><b>' + LIVE.esc(LIVE.short(h.tag)) + "</b><small>" + LIVE.esc(LIVE.date(h.date, IF.lang())) + "</small><small>" + LIVE.num(h.downloads) + " " + L(["تحميل", "downloads"]) + "</small></div><div>" +
        (n.length ? "<ul>" + n.map(function (x) { return "<li>" + LIVE.esc(x) + "</li>"; }).join("") + "</ul>" : "") + '<a href="' + LIVE.esc(h.url) + '" target="_blank" rel="noopener">' + L(["على GitHub", "On GitHub"]) + "</a></div></div>";
    }).join("") : '<p class="muted">' + L(["سجل الإصدارات ينقرا من GitHub على الموقع.", "The release history is read from GitHub on the site."]) + "</p>";
  }
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });
  IF.onLang(render); LIVE.onData(render);
  render();
})();
