// IFOKNR tools library: the Telegram Mini App (and a plain page outside Telegram).
// Data: library.json (Awesome Android Root's list, rebuilt daily), /assets/tools.json (IFOKNR's own
// tools, with live releases through the site's /gh cache) and live/private.json (files the owner
// added through the bot; the bot sends them, so only their names are public).
(function () {
  'use strict';

  var BOT = 'IFOKNR_bot';          // the bot that sends the owner's files (live/private.json names it)
  var PAGE = 40;                   // rows shown before "show more"
  var tg = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData !== undefined ? window.Telegram.WebApp : null;
  var inTelegram = !!(tg && tg.initData);

  var T = {
    ar: {
      title: 'مكتبة الأدوات', sub: '{n} برنامج وموديول للروت', search: 'ابحث: Magisk، إخفاء الروت، بطارية…',
      mine: 'أدوات IFOKNR', uploads: 'ملفات IFOKNR',
      stack: 'منظومة الإخفاء', stackSub: 'ثلاث موديولات تشتغل مع بعض، كل وحدة تخفي الروت في طبقة', fbs: 'Fastboot Studio', fbsSub: 'برنامج للويندوز، تطبيق للجوال، وإضافة روت', perf: 'الأداء',
      layer_apps: 'طبقة التطبيقات', layer_zygote: 'طبقة Zygote', layer_kernel: 'طبقة النواة', plat_fastbootstudio: 'ويندوز', plat_mobile: 'أندرويد', plat_companion: 'إضافة روت', cats: 'التصنيفات', picks: 'مختارات ⭐', all: 'الكل', open: 'مفتوح المصدر فقط',
      results: '{n} نتيجة', none: 'ما لقيت شي', noneHint: 'جرّب كلمة ثانية أو بالإنقليزي', more: 'عرض المزيد ({n})',
      items: '{n} برنامج', download: 'تحميل', downloadApk: 'تحميل APK', source: 'المصدر', page: 'صفحة المشروع',
      fdroid: 'F-Droid', play: 'Google Play', izzy: 'IzzyOnDroid', share: 'مشاركة', copied: 'انسخ الرابط',
      version: 'آخر نسخة', released: 'تاريخ النسخة', size: 'الحجم', stars: 'النجوم', category: 'التصنيف', works: 'يشتغل مع',
      license: 'الرخصة', foss: 'مفتوح المصدر', prop: 'مغلق المصدر', archived: 'متوقف التطوير', by: 'من {who}',
      fromList: 'من قائمة {name}', safety: 'البرامج من مطوّريها مباشرة. تأكد من المصدر قبل التثبيت، وخذ نسخة احتياطية قبل أي تعديل بالروت.',
      changes: 'التغييرات', needs: 'يحتاج', beta: 'بيتا', soon: 'قريباً', sendMe: 'أرسله لي في المحادثة',
      uploaded: 'انرفع', fileType: 'نوع الملف', privateNote: 'الملف يوصلك من البوت @{bot} في المحادثة.',
      credit: 'قائمة البرامج من <a href="{url}">{name}</a> (رخصة {lic}، {copy}). أدوات IFOKNR من <a href="https://ifoknr.com">ifoknr.com</a>.',
      updated: 'آخر تحديث للقائمة {d}', lang: 'EN', loadFail: 'ما قدرت أحمّل المكتبة', retry: 'حاول مرة ثانية'
    },
    en: {
      title: 'Tools library', sub: '{n} root apps and modules', search: 'Search: Magisk, hide root, battery…',
      mine: 'IFOKNR tools', uploads: 'IFOKNR files',
      stack: 'Root hiding stack', stackSub: 'Three modules that work together, each hiding root at one layer', fbs: 'Fastboot Studio', fbsSub: 'A Windows app, a phone app and a root module', perf: 'Performance',
      layer_apps: 'App layer', layer_zygote: 'Zygote layer', layer_kernel: 'Kernel layer', plat_fastbootstudio: 'Windows', plat_mobile: 'Android', plat_companion: 'Root module', cats: 'Categories', picks: 'Picks ⭐', all: 'All', open: 'Open source only',
      results: '{n} results', none: 'Nothing found', noneHint: 'Try another word', more: 'Show more ({n})',
      items: '{n} apps', download: 'Get', downloadApk: 'Download APK', source: 'Source', page: 'Project page',
      fdroid: 'F-Droid', play: 'Google Play', izzy: 'IzzyOnDroid', share: 'Share', copied: 'Link copied',
      version: 'Latest version', released: 'Released', size: 'Size', stars: 'Stars', category: 'Category', works: 'Works with',
      license: 'License', foss: 'Open source', prop: 'Closed source', archived: 'No longer developed', by: 'by {who}',
      fromList: 'From the {name} list', safety: 'Apps come straight from their developers. Check the source before you install, and keep a backup before any root change.',
      changes: 'Changes', needs: 'Needs', beta: 'Beta', soon: 'Soon', sendMe: 'Send it to me in the chat',
      uploaded: 'Added', fileType: 'File type', privateNote: 'The file comes from the bot @{bot} in the chat.',
      credit: 'App list from <a href="{url}">{name}</a> ({lic} license, {copy}). IFOKNR tools from <a href="https://ifoknr.com">ifoknr.com</a>.',
      updated: 'List updated {d}', lang: 'ع', loadFail: 'The library did not load', retry: 'Try again'
    }
  };
  var ROOT_NAMES = { magisk: 'Magisk', kernelsu: 'KernelSU', apatch: 'APatch', lsposed: 'LSPosed' };

  var state = { lang: pickLang(), data: null, tools: [], rel: {}, priv: [], q: '', shown: PAGE, filter: { root: '', foss: false, sec: -1 } };
  var app = document.getElementById('app');
  var byId = {};

  // ---------- helpers ----------
  function pickLang() {
    try { var saved = localStorage.getItem('lib-lang'); if (saved === 'ar' || saved === 'en') return saved; } catch (e) {}
    var code = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.language_code) || navigator.language || 'ar';
    return /^ar/i.test(code) ? 'ar' : 'en';
  }
  function t(key, vars) {
    var s = (T[state.lang][key] || T.en[key] || key);
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function num(n) { return Number(n || 0).toLocaleString(state.lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US'); }
  function size(b) {
    if (!b) return '';
    var u = ['B', 'KB', 'MB', 'GB'], i = 0;
    while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
    return (i ? b.toFixed(b < 10 ? 1 : 0) : b) + ' ' + u[i];
  }
  function date(d) {
    if (!d) return '';
    var x = new Date(d.length === 10 ? d + 'T00:00:00Z' : d);
    if (isNaN(x)) return d;
    return x.toLocaleDateString(state.lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function avatar(name, gh, cls) {
    var letter = esc((name || '?').replace(/^[^A-Za-z0-9؀-ۿ]+/, '').charAt(0).toUpperCase() || '?');
    var img = gh ? '<img loading="lazy" alt="" src="https://github.com/' + esc(gh.split('/')[0]) + '.png?size=96" data-fallback>' : '';
    return '<span class="av ' + (cls || '') + ' c' + (hash(name || '') % 8) + '">' + letter + img + '</span>';
  }
  var ICON = {
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chev: '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    dl: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>'
  };
  function haptic() { try { tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged(); } catch (e) {} }
  function toast(msg) {
    var el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 1800);
  }
  function openUrl(url) {
    if (!url) return;
    if (/^https:\/\/t\.me\//.test(url) && tg && tg.openTelegramLink && inTelegram) return tg.openTelegramLink(url);
    if (tg && tg.openLink && inTelegram) return tg.openLink(url);
    window.open(url, '_blank', 'noopener');
  }

  // ---------- data ----------
  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function load() {
    var lib = getJSON('/app/library.json');
    var tools = getJSON('/assets/tools.json').catch(function () { return []; });
    var priv = getJSON('/app/live/private.json').then(function (d) {
      if (d && /^[A-Za-z0-9_]{5,32}$/.test(d.bot || '')) BOT = d.bot;
      return (d && d.items) || [];
    }).catch(function () { return []; });
    return Promise.all([lib, tools, priv]).then(function (r) {
      state.data = r[0];
      state.tools = (r[1] || []).filter(function (x) { return x.repo || x.soon; });
      state.priv = r[2];
      state.data.items.forEach(function (i) { byId[i.id] = i; });
      state.cats = {};
      state.data.categories.forEach(function (c) { state.cats[c.id] = c; });
      state.tools.forEach(function (tool) { if (tool.repo) releases(tool); });
    });
  }
  function releases(tool) {
    var repo = tool.repo.split('/')[1];
    getJSON('/gh/repos/ifoknr/' + repo + '/releases').then(function (list) {
      var rel = (list || []).filter(function (r) { return !r.draft; })[0];
      if (!rel) return;
      var re = tool.asset ? new RegExp(tool.asset) : null;
      var asset = (rel.assets || []).filter(function (a) { return !re || re.test(a.name); })[0];
      state.rel[tool.id] = { v: rel.tag_name, t: (rel.published_at || '').slice(0, 10), url: rel.html_url, pre: rel.prerelease,
        dl: asset && asset.browser_download_url, size: asset && asset.size };
      var r = route();
      if (r.view === 'home' || (r.view === 'tool' && r.id === tool.id)) render();
    }).catch(function () {});
  }

  // ---------- search and filters ----------
  function norm(s) { return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ًͯ-ٟ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي'); }
  // The list is in English: an Arabic word also looks for its English words.
  var SYN = {
    'روت': 'root', 'اخفاء': 'hide hiding hider', 'اخفي': 'hide', 'بطاريه': 'battery', 'شحن': 'charging charge battery',
    'اعلانات': 'ad ads adblock', 'اعلان': 'ad ads adblock', 'خصوصيه': 'privacy', 'حمايه': 'security protect', 'امان': 'security safe',
    'جدار': 'firewall', 'صوت': 'audio sound', 'سماعه': 'audio headphone', 'العاب': 'game gaming', 'لعبه': 'game gaming', 'فريمات': 'fps',
    'شبكه': 'network', 'انترنت': 'network internet vpn', 'نت': 'network internet', 'وايفاي': 'wifi wi-fi', 'بلوتوث': 'bluetooth',
    'ملفات': 'file files', 'ملف': 'file', 'نسخ': 'backup', 'احتياطي': 'backup', 'نسخه': 'backup', 'استرجاع': 'restore backup',
    'تخصيص': 'customization custom theme', 'ثيم': 'theme', 'ثيمات': 'theme', 'خط': 'font', 'خطوط': 'font', 'ايقونات': 'icon',
    'كاميرا': 'camera', 'اداء': 'performance', 'سرعه': 'performance speed fast', 'كيرنل': 'kernel', 'نواه': 'kernel',
    'موديول': 'module', 'موديولات': 'module', 'حذف': 'remove debloat uninstall', 'تنظيف': 'clean cleaner debloat', 'تيرمنال': 'terminal',
    'طرفيه': 'terminal', 'مطور': 'developer', 'تطوير': 'development developer', 'تفليش': 'flash', 'اقلاع': 'boot', 'بوت': 'boot',
    'تحديث': 'update', 'تحديثات': 'update', 'يوتيوب': 'youtube', 'انستقرام': 'instagram', 'واتساب': 'whatsapp', 'سناب': 'snapchat',
    'تيليجرام': 'telegram', 'شاشه': 'screen display', 'عرض': 'display', 'ذاكره': 'memory', 'رام': 'ram memory', 'معالج': 'cpu',
    'موقع': 'location', 'بنك': 'banking bank', 'بنوك': 'banking bank', 'نزاهه': 'integrity', 'تكامل': 'integrity',
    'سامسونج': 'samsung', 'شاومي': 'xiaomi miui hyperos', 'بكسل': 'pixel', 'تسجيل': 'record recorder', 'اشعارات': 'notification',
    'لانشر': 'launcher', 'كيبورد': 'keyboard', 'متصفح': 'browser', 'تطبيقات': 'apps app', 'تطبيق': 'app', 'نظام': 'system'
  };
  var STOP = { 'في': 1, 'من': 1, 'على': 1, 'عن': 1, 'و': 1, 'مع': 1, 'او': 1 };
  function alternatives(w) {
    var bare = w.replace(/^و(?=ال)/, '').replace(/^ال(?=..)/, '');
    var alts = [w];
    if (bare !== w) alts.push(bare);
    [w, bare].forEach(function (x) { if (SYN[x]) alts = alts.concat(SYN[x].split(' ')); });
    return alts;
  }
  function search(q) {
    var words = norm(q).split(/\s+/).filter(function (w) { return w && !STOP[w]; }).map(alternatives);
    if (!words.length) return [];
    var out = [];
    state.data.items.forEach(function (i) {
      var name = norm(i.n), hay = name + ' ' + norm(i.d) + ' ' + (i.gh ? norm(i.gh) : '') + ' ' + (i.root || []).join(' ') + ' ' +
        norm(state.cats[i.c].en + ' ' + state.cats[i.c].ar + ' ' + state.cats[i.c].sections[i.s]);
      var starts = ' ' + hay.replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ') + ' ';
      var score = 0;
      for (var k = 0; k < words.length; k++) {
        var best = -1;
        for (var a = 0; a < words[k].length; a++) {
          var w = words[k][a];
          // A short word only counts at the start of a word: "ad" finds "ads", not "android".
          if (w.length < 4 ? starts.indexOf(' ' + w) < 0 : hay.indexOf(w) < 0) continue;
          best = Math.max(best, name === w ? 100 : name.indexOf(w) === 0 ? 40 : name.indexOf(w) >= 0 ? 20 : 1);
        }
        if (best < 0) return;
        score += best;
      }
      score += (i.star ? 8 : 0) + Math.min(10, Math.log10((i.stars || 0) + 1) * 3);
      out.push({ i: i, s: score });
    });
    out.sort(function (a, b) { return b.s - a.s; });
    return out.map(function (x) { return x.i; });
  }
  function applyFilters(list) {
    var f = state.filter;
    return list.filter(function (i) {
      if (f.foss && i.foss !== 1) return false;
      if (f.root && (i.root || []).indexOf(f.root) < 0) return false;
      if (f.sec >= 0 && i.s !== f.sec) return false;
      return true;
    });
  }

  // ---------- pieces ----------
  function tags(i, full) {
    var out = [];
    if (i.archived) out.push('<span class="tag arch">' + t('archived') + '</span>');
    if (i.rel && i.rel.v) out.push('<span class="tag ver ltr">' + esc(i.rel.v) + '</span>');
    if (i.foss === 1) out.push('<span class="tag foss">' + t('foss') + '</span>');
    else if (i.foss === 0 && full) out.push('<span class="tag prop">' + t('prop') + '</span>');
    (i.root || []).forEach(function (r) { out.push('<span class="tag">' + ROOT_NAMES[r] + '</span>'); });
    return out.join('');
  }
  function row(i) {
    return '<button class="item" data-go="#/i/' + esc(i.id) + '">' + avatar(i.n, i.gh) +
      '<span class="t"><span class="nm"><b class="ltr">' + esc(i.n) + '</b>' + (i.star ? '<span class="star">★</span>' : '') + '</span>' +
      (i.d ? '<p class="auto">' + esc(i.d) + '</p>' : '') + '<span class="meta">' + tags(i) + '</span></span>' + ICON.chev + '</button>';
  }
  function list(items) {
    if (!items.length) return '<div class="empty"><b>' + t('none') + '</b>' + t('noneHint') + '</div>';
    var shown = items.slice(0, state.shown).map(row).join('');
    var rest = items.length - state.shown;
    return '<div class="list">' + shown + '</div>' + (rest > 0 ? '<button class="more" data-more>' + t('more', { n: num(rest) }) + '</button>' : '');
  }
  function toolName(tool) { return Array.isArray(tool.name) ? tool.name.join('') : tool.name; }
  // A tool with an icon shows it; the modules get a monogram in their group's colour.
  function toolAvatar(tool, cls) {
    if (tool.icon) return '<span class="av ' + (cls || '') + ' acc-icon"><img src="/' + esc(tool.icon) + '" alt=""></span>';
    var parts = Array.isArray(tool.name) ? tool.name : [tool.name || '?'];
    var mono = parts.map(function (p) { return String(p).trim().charAt(0); }).join('').toUpperCase().slice(0, 2);
    return '<span class="av ' + (cls || '') + ' acc-' + esc(tool.group || 'x') + '">' + esc(mono) + '</span>';
  }
  function toolRow(tool) {
    var rel = state.rel[tool.id], txt = tool[state.lang] || tool.en || {};
    var kind = tool.layer ? t('layer_' + tool.layer) : T[state.lang]['plat_' + tool.id] ? t('plat_' + tool.id) : '';
    var meta = (kind ? '<span class="tag kind">' + esc(kind) + '</span>' : '') +
      (tool.soon ? '<span class="tag">' + t('soon') + '</span>' :
        rel ? '<span class="tag ver ltr">' + esc(rel.v) + '</span>' + (rel.pre || tool.beta ? '<span class="tag me">' + t('beta') + '</span>' : '') :
        tool.version ? '<span class="tag ver ltr">' + esc(tool.version) + '</span>' : '') +
      '<span class="tag me">IFOKNR</span>';
    return '<button class="item" data-go="#/t/' + esc(tool.id) + '">' + toolAvatar(tool) +
      '<span class="t"><span class="nm"><b class="ltr">' + esc(toolName(tool)) + '</b></span>' +
      (txt.tagline ? '<p>' + esc(txt.tagline) + '</p>' : '') + '<span class="meta">' + meta + '</span></span>' + ICON.chev + '</button>';
  }
  var LAYERS = ['apps', 'zygote', 'kernel'];
  var FBS = ['fastbootstudio', 'mobile', 'companion'];
  function toolSections() {
    var hide = state.tools.filter(function (x) { return x.group === 'hide'; })
      .sort(function (a, b) { return LAYERS.indexOf(a.layer) - LAYERS.indexOf(b.layer); });
    var fbs = state.tools.filter(function (x) { return x.group === 'pc'; })
      .sort(function (a, b) { return FBS.indexOf(a.id) - FBS.indexOf(b.id); });
    var rest = state.tools.filter(function (x) { return x.group !== 'hide' && x.group !== 'pc'; });
    var h = '';
    if (hide.length) h += '<div class="sec col"><h2>🛡️ ' + t('stack') + '</h2><span>' + t('stackSub') + '</span></div><div class="list">' + hide.map(toolRow).join('') + '</div>';
    if (fbs.length) h += '<div class="sec col"><h2>⚡ ' + t('fbs') + '</h2><span>' + t('fbsSub') + '</span></div><div class="list">' + fbs.map(toolRow).join('') + '</div>';
    if (rest.length) h += '<div class="sec"><h2>🔥 ' + t('perf') + '</h2></div><div class="list">' + rest.map(toolRow).join('') + '</div>';
    return h;
  }
  function privRow(p) {
    return '<button class="item" data-go="#/p/' + esc(p.id) + '">' + avatar(p.name) +
      '<span class="t"><span class="nm"><b class="ltr">' + esc(p.name) + '</b></span>' +
      (p.note ? '<p class="auto">' + esc(p.note) + '</p>' : '') + '<span class="meta"><span class="tag me">IFOKNR</span>' +
      (p.size ? '<span class="tag ltr">' + size(p.size) + '</span>' : '') + (p.ext ? '<span class="tag ltr">.' + esc(p.ext) + '</span>' : '') +
      '</span></span>' + ICON.chev + '</button>';
  }
  function searchBox() {
    return '<div class="search"><label>' + ICON.search + '<input id="q" type="search" enterkeyhint="search" autocomplete="off" placeholder="' + esc(t('search')) + '" value="' + esc(state.q) + '">' +
      (state.q ? '<button class="clear" data-clear aria-label="clear">' + ICON.x + '</button>' : '') + '</label></div>';
  }
  function filterBar(cat) {
    var f = state.filter, h = '<div class="filters">';
    if (cat && cat.sections.length > 1) {
      h += '<div class="chips"><button class="chip' + (f.sec < 0 ? ' on' : '') + '" data-sec="-1">' + t('all') + '</button>' +
        cat.sections.map(function (s, n) { return '<button class="chip' + (f.sec === n ? ' on' : '') + '" data-sec="' + n + '"><span class="ltr">' + esc(s) + '</span></button>'; }).join('') + '</div>';
    }
    h += '<div class="chips"><button class="chip' + (f.foss ? ' on' : '') + '" data-foss>' + t('open') + '</button>' +
      Object.keys(ROOT_NAMES).map(function (r) { return '<button class="chip' + (f.root === r ? ' on' : '') + '" data-root="' + r + '">' + ROOT_NAMES[r] + '</button>'; }).join('') + '</div>';
    return h + '</div>';
  }
  function header(title, sub) {
    return '<div class="head"><button class="back" data-back aria-label="back">' + ICON.back + '</button><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div></div>';
  }
  function credit() {
    var s = state.data.source;
    return '<div class="credit">' + t('credit', { url: esc(s.url), name: esc(s.name), lic: esc(s.license), copy: esc(s.copyright) }) +
      '<br>' + t('updated', { d: esc(date(state.data.updated)) }) + '</div>';
  }

  // ---------- views ----------
  function home() {
    var d = state.data, h = '<div class="top"><img class="logo" src="/app/icon.svg" alt=""><div class="title"><h1>' + t('title') +
      '</h1><p>' + t('sub', { n: num(d.items.length) }) + '</p></div><button class="pill-btn" data-lang>' + t('lang') + '</button></div>' + searchBox();
    if (state.q.trim()) {
      var found = applyFilters(search(state.q));
      return h + filterBar() + '<div class="sec"><h2>' + t('results', { n: num(found.length) }) + '</h2></div>' + list(found);
    }
    h += toolSections();
    if (state.priv.length) h += '<div class="sec"><h2>' + t('uploads') + '</h2><span>' + num(state.priv.length) + '</span></div><div class="list">' + state.priv.slice(0, 6).map(privRow).join('') + '</div>';
    h += '<div class="sec"><h2>' + t('cats') + '</h2><span>' + num(d.categories.length) + '</span></div><div class="cats">' +
      d.categories.map(function (c) {
        return '<button class="cat" data-go="#/c/' + esc(c.id) + '"><span class="em">' + c.emoji + '</span><span><b>' + esc(c[state.lang]) + '</b><small>' + t('items', { n: num(c.count) }) + '</small></span></button>';
      }).join('') + '</div>';
    var picks = d.items.filter(function (i) { return i.star; }).sort(function (a, b) { return (b.stars || 0) - (a.stars || 0); }).slice(0, 12);
    if (picks.length) h += '<div class="sec"><h2>' + t('picks') + '</h2></div><div class="list">' + picks.map(row).join('') + '</div>';
    return h + credit();
  }
  function category(id) {
    var c = state.cats[id];
    if (!c) return home();
    var items = applyFilters(state.data.items.filter(function (i) { return i.c === id; }));
    return header(c.emoji + ' ' + esc(c[state.lang]), t('items', { n: num(items.length) })) + filterBar(c) + list(items);
  }
  function fact(label, value, ltr) { return value ? '<div class="fact"><span>' + label + '</span><i' + (ltr ? ' class="ltr"' : '') + '>' + value + '</i></div>' : ''; }
  function item(id) {
    var i = byId[id];
    if (!i) return home();
    var c = state.cats[i.c], rel = i.rel || {};
    var h = header('', '') + '<div class="hero">' + avatar(i.n, i.gh, 'lg') + '<h1 class="ltr">' + esc(i.n) + (i.star ? ' <span class="star">★</span>' : '') + '</h1>' +
      (i.gh ? '<div class="by ltr">' + esc(i.gh) + '</div>' : '') + '<div class="tags">' + tags(i, true) + '</div></div>';
    if (i.d) h += '<div class="desc auto">' + esc(i.d) + '</div>';
    h += '<div class="facts">' +
      fact(t('category'), esc(c[state.lang]) + ' · <span class="ltr">' + esc(c.sections[i.s]) + '</span>') +
      fact(t('version'), rel.v && esc(rel.v), true) + fact(t('released'), rel.t && esc(date(rel.t))) +
      fact(t('size'), rel.size && size(rel.size), true) + fact(t('stars'), i.stars && '★ ' + num(i.stars), true) +
      fact(t('works'), (i.root || []).map(function (r) { return ROOT_NAMES[r]; }).join(' · '), true) +
      fact(t('license'), i.foss === 1 ? t('foss') : i.foss === 0 ? t('prop') : '') + '</div>';
    h += '<div class="actions">';
    if (rel.apk) h += '<button class="btn primary" data-open="' + esc(rel.apk) + '">' + ICON.dl + t('downloadApk') + (rel.size ? ' · <span class="ltr">' + size(rel.size) + '</span>' : '') + '</button>';
    h += '<button class="btn' + (rel.apk ? '' : ' primary') + '" data-open="' + esc(i.u) + '">' + (i.gh ? t('source') + ' · GitHub' : t('page')) + '</button>';
    var stores = i.stores || {};
    var sb = ['fdroid', 'izzy', 'play'].filter(function (k) { return stores[k]; }).map(function (k) { return '<button class="btn small" data-open="' + esc(stores[k]) + '">' + t(k) + '</button>'; });
    sb.push('<button class="btn small" data-share="' + esc(id) + '">' + t('share') + '</button>');
    h += '<div class="btn-row">' + sb.join('') + '</div></div>';
    h += '<p class="note">' + t('fromList', { name: esc(state.data.source.name) }) + ' · ' + t('safety') + '</p>';
    return h;
  }
  function tool(id) {
    var tl = state.tools.filter(function (x) { return x.id === id; })[0];
    if (!tl) return home();
    var rel = state.rel[id] || {}, txt = tl[state.lang] || tl.en || {}, repo = tl.repo ? 'https://github.com/' + tl.repo : '';
    var h = header('', '') + '<div class="hero">' + toolAvatar(tl, 'lg') + '<h1 class="ltr">' + esc(toolName(tl)) + '</h1>' +
      '<div class="by">' + t('by', { who: 'IFOKNR' }) + '</div><div class="tags"><span class="tag me">IFOKNR</span>' +
      (rel.v ? '<span class="tag ver ltr">' + esc(rel.v) + '</span>' : '') + (rel.pre || tl.beta ? '<span class="tag me">' + t('beta') + '</span>' : '') +
      (tl.license ? '<span class="tag foss">' + t('foss') + '</span>' : '') + '</div></div>';
    h += '<div class="desc">' + esc(txt.about || txt.tagline || '') + ((txt.points || []).length ? '<ul>' + txt.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
    h += '<div class="facts">' + fact(t('version'), rel.v && esc(rel.v), true) + fact(t('released'), rel.t && esc(date(rel.t))) +
      fact(t('size'), rel.size && size(rel.size), true) + fact(t('needs'), (tl.needs || []).map(esc).join(' · '), true) + fact(t('license'), tl.license && esc(tl.license), true) + '</div>';
    h += '<div class="actions">';
    if (tl.soon) h += '<button class="btn" disabled>' + t('soon') + '</button>';
    else h += '<button class="btn primary" data-open="' + esc(rel.dl || (repo + '/releases/latest')) + '">' + ICON.dl + t('download') + (rel.v ? ' <span class="ltr">' + esc(rel.v) + '</span>' : '') + '</button>';
    var b = [];
    if (repo) b.push('<button class="btn small" data-open="' + esc(repo) + '">' + t('source') + '</button>');
    if (rel.url) b.push('<button class="btn small" data-open="' + esc(rel.url) + '">' + t('changes') + '</button>');
    if (tl.xda) b.push('<button class="btn small" data-open="' + esc(tl.xda) + '">XDA</button>');
    return h + '<div class="btn-row">' + b.join('') + '</div></div>';
  }
  function upload(id) {
    var p = state.priv.filter(function (x) { return x.id === id; })[0];
    if (!p) return home();
    var cat = p.c && state.cats[p.c];
    var h = header('', '') + '<div class="hero">' + avatar(p.name, null, 'lg') + '<h1 class="ltr">' + esc(p.name) + '</h1><div class="by">' + t('by', { who: 'IFOKNR' }) +
      '</div><div class="tags"><span class="tag me">IFOKNR</span></div></div>';
    if (p.note) h += '<div class="desc auto">' + esc(p.note) + '</div>';
    h += '<div class="facts">' + fact(t('category'), cat && esc(cat[state.lang])) + fact(t('version'), p.v && esc(p.v), true) +
      fact(t('size'), p.size && size(p.size), true) + fact(t('fileType'), p.ext && '.' + esc(p.ext), true) +
      fact('SHA-256', p.sha256 && '<span title="' + esc(p.sha256) + '">' + esc(p.sha256.slice(0, 8) + '…' + p.sha256.slice(-8)) + '</span>', true) +
      fact(t('uploaded'), p.t && esc(date(p.t))) + '</div>';
    h += '<div class="actions"><button class="btn primary" data-open="https://t.me/' + BOT + '?start=get_' + esc(p.id) + '">' + ICON.dl + t('sendMe') + '</button></div>';
    return h + '<p class="note">' + t('privateNote', { bot: BOT }) + '</p>';
  }

  // ---------- routing ----------
  function route() {
    var m = location.hash.match(/^#\/(c|i|t|p)\/([^/?#]+)/);
    return m ? { view: { c: 'cat', i: 'item', t: 'tool', p: 'upload' }[m[1]], id: decodeURIComponent(m[2]) } : { view: 'home' };
  }
  var lastView = '';
  function render(keepScroll) {
    var r = route(), key = r.view + ':' + (r.id || '');
    var html = r.view === 'cat' ? category(r.id) : r.view === 'item' ? item(r.id) : r.view === 'tool' ? tool(r.id) : r.view === 'upload' ? upload(r.id) : home();
    var y = window.scrollY, focused = document.activeElement && document.activeElement.id === 'q', caret = focused ? document.activeElement.selectionStart : 0;
    app.innerHTML = html;
    app.querySelectorAll('img[data-fallback]').forEach(function (img) {
      img.addEventListener('error', function () { img.remove(); });
    });
    if (focused) { var q = document.getElementById('q'); if (q) { q.focus(); try { q.setSelectionRange(caret, caret); } catch (e) {} } }
    if (key !== lastView && !keepScroll) window.scrollTo(0, 0); else window.scrollTo(0, y);
    lastView = key;
    if (tg && tg.BackButton) { if (r.view === 'home') tg.BackButton.hide(); else tg.BackButton.show(); }
  }
  function go(h) {
    haptic();
    var r = h.match(/^#\/c\//);
    if (r) state.filter = { root: state.filter.root, foss: state.filter.foss, sec: -1 };
    state.shown = PAGE;
    location.hash = h;
  }

  // ---------- events ----------
  app.addEventListener('click', function (e) {
    var el = e.target.closest('button');
    if (!el || el.disabled) return;
    if (el.dataset.go) return go(el.dataset.go);
    if (el.hasAttribute('data-back')) { haptic(); return history.length > 1 ? history.back() : (location.hash = '#/'); }
    if (el.dataset.open) { haptic(); return openUrl(el.dataset.open); }
    if (el.hasAttribute('data-more')) { state.shown += PAGE * 2; return render(true); }
    if (el.hasAttribute('data-clear')) { state.q = ''; state.shown = PAGE; render(); var q = document.getElementById('q'); if (q) q.focus(); return; }
    if (el.hasAttribute('data-lang')) {
      state.lang = state.lang === 'ar' ? 'en' : 'ar';
      try { localStorage.setItem('lib-lang', state.lang); } catch (x) {}
      applyLang(); haptic(); return render(true);
    }
    if (el.hasAttribute('data-foss')) { state.filter.foss = !state.filter.foss; state.shown = PAGE; haptic(); return render(true); }
    if (el.dataset.root !== undefined) { state.filter.root = state.filter.root === el.dataset.root ? '' : el.dataset.root; state.shown = PAGE; haptic(); return render(true); }
    if (el.dataset.sec !== undefined) { state.filter.sec = Number(el.dataset.sec); state.shown = PAGE; haptic(); return render(true); }
    if (el.dataset.share) {
      var link = 'https://ifoknr.com/app/#/i/' + el.dataset.share, name = (byId[el.dataset.share] || {}).n || '';
      if (inTelegram) return openUrl('https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(name));
      if (navigator.share) return navigator.share({ title: name, url: link }).catch(function () {});
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(function () { toast(t('copied')); });
    }
  });
  var typing;
  app.addEventListener('input', function (e) {
    if (e.target.id !== 'q') return;
    state.q = e.target.value; state.shown = PAGE;
    clearTimeout(typing); typing = setTimeout(function () { render(true); }, 120);
  });
  app.addEventListener('keydown', function (e) { if (e.target.id === 'q' && e.key === 'Enter') e.target.blur(); });
  window.addEventListener('hashchange', function () { render(); });

  function applyLang() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    document.title = 'IFOKNR · ' + t('title');
  }
  function applyTheme() {
    var light = tg && inTelegram ? tg.colorScheme === 'light' : window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    document.documentElement.classList.toggle('light', !!light);
    if (tg && inTelegram) {
      var bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
      try { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); if (tg.setBottomBarColor) tg.setBottomBarColor(bg); } catch (e) {}
    }
  }

  // ---------- start ----------
  if (inTelegram) {
    document.documentElement.classList.add('tg');
    tg.ready(); tg.expand();
    tg.BackButton.onClick(function () { history.length > 1 ? history.back() : (location.hash = '#/'); });
    tg.onEvent('themeChanged', applyTheme);
  }
  applyLang(); applyTheme();
  load().then(function () { render(); }).catch(function () {
    app.innerHTML = '<div class="empty"><b>' + t('loadFail') + '</b><br><button class="more" id="retry">' + t('retry') + '</button></div>';
    document.getElementById('retry').addEventListener('click', function () { location.reload(); });
  });
})();
