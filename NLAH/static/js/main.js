/* ═══════════════════════════════════════════════════════
   NLAH — main.js
   PDF viewer, BibTeX copy, scroll fade-in, nav effects,
   bilingual (EN/ZH) language switching
   ═══════════════════════════════════════════════════════ */

var currentLang = 'en';

// ── LANGUAGE SWITCHING ────────────────────────────────

(function () {
  var panes = {
    en: document.getElementById('pane-en'),
    zh: document.getElementById('pane-zh')
  };
  var buttons = {
    en: document.getElementById('lang-en'),
    zh: document.getElementById('lang-zh')
  };
  var navDefs = {
    abstract: { en: 'Abstract', zh: '摘要', enHref: '#abstract-en', zhHref: '#abstract-zh' },
    method:   { en: 'Method',   zh: '方法', enHref: '#method-en',   zhHref: '#method-zh' },
    results:  { en: 'Results',  zh: '结果', enHref: '#results-en',  zhHref: '#results-zh' },
    ablation: { en: 'Ablation', zh: '消融', enHref: '#ablation-en', zhHref: '#ablation-zh' },
    citation: { en: 'Citation', zh: '引用', enHref: '#citation-en', zhHref: '#citation-zh' }
  };
  var navLinks = document.querySelectorAll('#navLinks a[data-nav]');
  var brand = document.getElementById('navBrand');
  var pdfCloseBtn = document.querySelector('.pdf-toolbar-actions button');
  var pdfTitleEl  = document.getElementById('pdfTitle');
  var pdfDownload = document.getElementById('pdfDownload');
  var pdfNewTab   = document.getElementById('pdfNewTab');

  var copy = {
    en: {
      title:     'NLAH: Natural-Language Agent Harnesses',
      pdfTitle:  'PDF Viewer',
      download:  'Download',
      newTab:    'Open in new tab',
      close:     'Close',
      copy:      'Copy',
      copied:    'Copied!'
    },
    zh: {
      title:     'NLAH：自然语言 Agent Harnesses',
      pdfTitle:  'PDF 查看器',
      download:  '下载',
      newTab:    '在新标签页打开',
      close:     '关闭',
      copy:      '复制',
      copied:    '已复制！'
    }
  };
  var storageKey = 'nlah_lang_v1';

  function setLanguage(lang, updateUrl) {
    if (!panes[lang]) lang = 'en';
    currentLang = lang;

    Object.keys(panes).forEach(function (key) {
      var selected = key === lang;
      panes[key].hidden   = !selected;
      buttons[key].classList.toggle('active', selected);
      buttons[key].setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = copy[lang].title;
    brand.href = lang === 'zh' ? '#hero-zh' : '#hero-en';

    // Single set of nav links — swap text & href per language
    navLinks.forEach(function (a) {
      var d = navDefs[a.getAttribute('data-nav')];
      if (!d) return;
      a.textContent = d[lang];
      a.href = lang === 'zh' ? d.zhHref : d.enHref;
    });

    // Static UI strings (PDF toolbar, etc.)
    if (pdfTitleEl)  pdfTitleEl.textContent = copy[lang].pdfTitle;
    if (pdfDownload) pdfDownload.textContent = copy[lang].download;
    if (pdfNewTab)   pdfNewTab.textContent   = copy[lang].newTab;
    if (pdfCloseBtn) pdfCloseBtn.textContent = copy[lang].close;

    // Make sure fade-in elements in the now-active pane are visible
    panes[lang].querySelectorAll('.fade-in, .fade-in-up').forEach(function (el) {
      el.classList.add('visible');
    });

    // Persist preference
    try { window.localStorage.setItem(storageKey, lang); } catch (_) {}

    if (updateUrl) {
      var url = new URL(window.location.href);
      url.hash = lang === 'zh' ? 'zh' : '';
      window.history.replaceState(null, '', url);
    }
  }

  buttons.en.addEventListener('click', function () { setLanguage('en', true); });
  buttons.zh.addEventListener('click', function () { setLanguage('zh', true); });

  // Initial language: URL hash → saved preference → browser language → en
  var initial = 'en';
  var hash = window.location.hash;
  if (hash.indexOf('#zh') === 0) {
    initial = 'zh';
  } else if (hash.indexOf('#en') === 0) {
    initial = 'en';
  } else {
    var saved = null;
    try { saved = window.localStorage.getItem(storageKey); } catch (_) {}
    if (saved === 'zh' || saved === 'en') {
      initial = saved;
    } else {
      var navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (navLang.indexOf('zh') === 0) initial = 'zh';
    }
  }
  setLanguage(initial, false);
})();


// ── PDF VIEWER ──────────────────────────────────────────

function openPDF(url, title) {
  var overlay = document.getElementById('pdfOverlay');
  var frame   = document.getElementById('pdfFrame');

  document.getElementById('pdfTitle').textContent = title || (currentLang === 'zh' ? 'PDF 查看器' : 'PDF Viewer');
  document.getElementById('pdfDownload').href = url;
  document.getElementById('pdfNewTab').href   = url;
  frame.src = url;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePDF() {
  var overlay = document.getElementById('pdfOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('pdfFrame').src = '';
}

function closeOnBackdrop(e) {
  if (e.target === e.currentTarget) closePDF();
}

// Close on Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    var overlay = document.getElementById('pdfOverlay');
    if (overlay.classList.contains('active')) closePDF();
    // Also close mobile nav
    var links = document.getElementById('navLinks');
    var toggle = document.getElementById('navToggle');
    if (links && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.classList.remove('active');
    }
  }
});


// ── COPY BIBTEX ─────────────────────────────────────────

function copyBibtex() {
  var activePane = document.querySelector('.lang-pane:not([hidden])');
  if (!activePane) activePane = document.getElementById('pane-en');
  var codeEl = activePane.querySelector('code');
  var btn = activePane.querySelector('.btn-copy');
  var copiedText = currentLang === 'zh' ? '已复制！' : 'Copied!';
  var copyText   = currentLang === 'zh' ? '复制' : 'Copy';
  var bib = codeEl.textContent.trim();

  function ok() {
    btn.innerHTML = '<i class="fa-regular fa-check"></i> ' + copiedText;
    btn.classList.add('copied');
    setTimeout(function () {
      btn.innerHTML = '<i class="fa-regular fa-copy"></i> ' + copyText;
      btn.classList.remove('copied');
    }, 2500);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(bib).then(ok).catch(function () {
      fallbackCopy();
    });
  } else {
    fallbackCopy();
  }

  function fallbackCopy() {
    var textarea = document.createElement('textarea');
    textarea.value = bib;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    ok();
  }
}


// ── SCROLL FADE-IN ──────────────────────────────────────

(function() {
  var els = document.querySelectorAll('.fade-in, .fade-in-up');

  if (els.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    els.forEach(function(el) { observer.observe(el); });
  } else {
    els.forEach(function(el) { el.classList.add('visible'); });
  }
})();


// ── NAV SCROLL EFFECT ──

var nav = document.getElementById('navbar');
var ticking = false;
window.addEventListener('scroll', function () {
  if (!ticking) {
    window.requestAnimationFrame(function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
      ticking = false;
    });
    ticking = true;
  }
});


// ── MOBILE NAV TOGGLE ──

var toggle = document.getElementById('navToggle');
var links = document.getElementById('navLinks');
if (toggle && links) {
  toggle.addEventListener('click', function () {
    links.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.classList.remove('active');
    });
  });
}


// ── SMOOTH SCROLL FOR ANCHOR LINKS ──

document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
