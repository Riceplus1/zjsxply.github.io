/* ═══════════════════════════════════════════════════════════
   NLAH — main.js
   PDF viewer, BibTeX copy, scroll fade-in, nav effects
   ═══════════════════════════════════════════════════════════ */

// ── PDF VIEWER ──────────────────────────────────────────

function openPDF(url, title) {
  var overlay = document.getElementById('pdfOverlay');
  var frame   = document.getElementById('pdfFrame');

  document.getElementById('pdfTitle').textContent    = title || 'PDF';
  document.getElementById('pdfDownload').href         = url;
  document.getElementById('pdfNewTab').href           = url;
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
    if (links && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.classList.remove('active');
    }
  }
});


// ── COPY BIBTEX ─────────────────────────────────────────

function copyBibtex() {
  var el  = document.getElementById('bibtex');
  var bib = el.textContent.trim();
  var btn = document.querySelector('.btn-copy');

  navigator.clipboard.writeText(bib).then(function () {
    btn.innerHTML = '<i class="fa-regular fa-check"></i> Copied!';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
      btn.classList.remove('copied');
    }, 2500);
  }).catch(function () {
    // Fallback
    var textarea = document.createElement('textarea');
    textarea.value = bib;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    btn.innerHTML = '<i class="fa-regular fa-check"></i> Copied!';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
      btn.classList.remove('copied');
    }, 2500);
  });
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
