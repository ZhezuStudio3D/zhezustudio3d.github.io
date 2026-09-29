// ZHEZU STUDIO 3D — shared behavior
(function(){

  /* ---------------- Loading overlay ---------------- */
  // Fills the tiled pattern with mascot icons, waits for real page load
  // (fonts + images) up to a max timeout, then reveals the page.
  // If loading takes too long or a resource errors out, shows the
  // "whoops" fallen-mascots state instead.
  var overlay = document.getElementById('loading-overlay');
  if (overlay) {
    var grid = overlay.querySelector('.loading-grid');
    var icons = ['../assets/img/mascot_gota.png','../assets/img/mascot_momia.png','../assets/img/mascot_medusa.png'];
    // index.html lives at root, others in /pages-like root too (flat structure) — resolve via data-root
    var root = overlay.getAttribute('data-root') || './';
    icons = [root+'assets/img/mascot_gota.png', root+'assets/img/mascot_momia.png', root+'assets/img/mascot_medusa.png'];

    if (grid) {
      var cols = Math.ceil(window.innerWidth / 70) * Math.ceil(window.innerHeight / 70) + 20;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < cols; i++) {
        var img = document.createElement('img');
        img.src = icons[i % icons.length];
        img.style.animationDelay = (Math.random() * -2) + 's';
        img.alt = '';
        frag.appendChild(img);
      }
      grid.appendChild(frag);
    }

    var revealed = false;
    function reveal() {
      if (revealed) return;
      revealed = true;
      overlay.classList.add('is-hidden');
      setTimeout(function () { overlay.style.display = 'none'; }, 550);
    }
    function showError() {
      if (revealed) return;
      overlay.classList.add('is-error');
    }

    var minTimer = setTimeout(function () {
      if (document.readyState === 'complete') reveal();
    }, 700);

    window.addEventListener('load', function () {
      setTimeout(reveal, 400);
    });

    // fail-safe: real network/asset problems trigger the error state
    window.addEventListener('error', function (e) {
      if (e && e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'LINK' || e.target.tagName === 'SCRIPT')) {
        showError();
      }
    }, true);

    // if nothing has resolved within 7s, assume something went wrong
    setTimeout(function () { if (!revealed) showError(); }, 7000);

    var retryBtn = overlay.querySelector('.error-retry');
    if (retryBtn) retryBtn.addEventListener('click', function () { location.reload(); });
  }

  /* ---------------- Header scroll state ---------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- Full-screen nav ---------------- */
  var toggle = document.querySelector('.menu-toggle');
  var navOverlay = document.querySelector('.nav-overlay');
  if (toggle && navOverlay) {
    var closeNav = function () {
      toggle.classList.remove('is-open');
      navOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    toggle.addEventListener('click', function () {
      var open = toggle.classList.toggle('is-open');
      navOverlay.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navOverlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
  }

  /* ---------------- Cursor-reactive hero mascots ---------------- */
  var heroArt = document.querySelector('.hero-art');
  if (heroArt) {
    var mascots = heroArt.querySelectorAll('.mascot');
    heroArt.addEventListener('mousemove', function (e) {
      var rect = heroArt.getBoundingClientRect();
      var cx = (e.clientX - rect.left) / rect.width - 0.5;
      var cy = (e.clientY - rect.top) / rect.height - 0.5;
      mascots.forEach(function (m, i) {
        var depth = (i + 1) * 8;
        m.style.transform = 'translate(' + (cx * depth) + 'px,' + (cy * depth) + 'px)';
      });
    });
    heroArt.addEventListener('mouseleave', function () {
      mascots.forEach(function (m) { m.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- Gallery filters ---------------- */
  var filterRow = document.getElementById('filterRow');
  if (filterRow) {
    var items = document.querySelectorAll('.gallery-item');
    filterRow.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterRow.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.getAttribute('data-filter');
        items.forEach(function (item) {
          var match = f === 'todos' || item.getAttribute('data-cat') === f;
          item.classList.toggle('hide', !match);
        });
      });
    });
  }

  /* ---------------- Lightbox ---------------- */
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    document.querySelectorAll('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () {
        lbImg.src = item.querySelector('img').src;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });
    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
  }

  /* ---------------- Llaveros configurator ---------------- */
  var configurator = document.getElementById('configurador');
  if (configurator) {
    var state = {
      shape: 'redondo', shapeLabel: 'redondo',
      size: '5', color: 'Coral', hex: '#f38487',
      nfc: true, use: 'personal', useLabel: 'uso personal',
      fileName: null
    };

    var previewShape = document.getElementById('previewShape');
    var previewChip = document.getElementById('previewChip');
    var previewSummary = document.getElementById('previewSummary');
    var configCta = document.getElementById('configCta');
    var waNumber = '573208390714';

    function renderShape() {
      previewShape.innerHTML = '';
      previewShape.style.background = state.hex;
      previewShape.style.clipPath = 'none';
      previewShape.style.borderRadius = '50%';
      var ring = document.createElement('div');
      ring.className = 'preview-ring';
      previewShape.appendChild(ring);

      if (state.shape === 'corazon') {
        previewShape.style.clipPath = "path('M75 135 C20 100 0 65 0 40 C0 15 20 0 42 0 C58 0 70 10 75 25 C80 10 92 0 108 0 C130 0 150 15 150 40 C150 65 130 100 75 135 Z')";
        previewShape.style.borderRadius = '0';
        ring.style.display = 'none';
      } else if (state.shape === 'letra') {
        var letter = document.createElement('span');
        letter.className = 'preview-letter';
        letter.textContent = 'Z';
        letter.style.color = '#fff';
        previewShape.appendChild(letter);
      } else if (state.shape === 'libre') {
        previewShape.style.borderRadius = '32% 68% 62% 38% / 42% 45% 55% 58%';
      }
      if (state.nfc) previewShape.appendChild(previewChip);
    }

    function renderSummary() {
      previewSummary.innerHTML =
        'Llavero <strong>' + state.shapeLabel + '</strong> de <strong>' + state.size + ' cm</strong>, color <strong>' + state.color + '</strong>' +
        (state.nfc ? ', <strong>con chip NFC</strong>' : ', <strong>sin chip NFC</strong>') +
        ' — <strong>' + state.useLabel + '</strong>.';

      var lines = [
        'Hola! Quiero cotizar un llavero personalizado:',
        '- Forma: ' + state.shapeLabel,
        '- Tamaño: ' + state.size + ' cm',
        '- Color: ' + state.color,
        '- Chip NFC: ' + (state.nfc ? 'sí' : 'no'),
        '- Uso: ' + state.useLabel
      ];
      var notes = document.getElementById('configNotes');
      if (notes && notes.value.trim()) lines.push('- Notas: ' + notes.value.trim());
      if (state.fileName) lines.push('(Voy a enviarte por aquí una imagen de referencia llamada "' + state.fileName + '")');
      lines.push('¿Me ayudas con el valor?');
      var msg = lines.join('\n');
      configCta.href = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(msg);
    }

    document.querySelectorAll('#shapeOptions .chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#shapeOptions .chip').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.shape = btn.getAttribute('data-shape');
        state.shapeLabel = btn.textContent.trim().toLowerCase();
        renderShape(); renderSummary();
      });
    });

    document.querySelectorAll('#sizeOptions .chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#sizeOptions .chip').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.size = btn.getAttribute('data-size');
        renderSummary();
      });
    });

    document.querySelectorAll('#colorOptions .swatch').forEach(function (sw) {
      sw.addEventListener('click', function () {
        document.querySelectorAll('#colorOptions .swatch').forEach(function (s) { s.classList.remove('active'); });
        sw.classList.add('active');
        state.color = sw.getAttribute('data-color');
        state.hex = sw.getAttribute('data-hex');
        renderShape(); renderSummary();
      });
    });

    document.querySelectorAll('#nfcOptions .chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#nfcOptions .chip').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.nfc = btn.getAttribute('data-nfc') === 'si';
        renderShape(); renderSummary();
      });
    });

    document.querySelectorAll('#useOptions .chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#useOptions .chip').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.use = btn.getAttribute('data-use');
        state.useLabel = btn.textContent.trim().toLowerCase();
        renderSummary();
      });
    });

    var notesInput = document.getElementById('configNotes');
    if (notesInput) notesInput.addEventListener('input', renderSummary);

    var uploadBox = document.getElementById('uploadBox');
    var uploadInput = document.getElementById('uploadInput');
    var uploadPreview = document.getElementById('uploadPreview');
    if (uploadBox && uploadInput) {
      uploadBox.addEventListener('click', function () { uploadInput.click(); });
      ['dragenter','dragover'].forEach(function(ev){
        uploadBox.addEventListener(ev, function(e){ e.preventDefault(); uploadBox.classList.add('drag'); });
      });
      ['dragleave','drop'].forEach(function(ev){
        uploadBox.addEventListener(ev, function(e){ e.preventDefault(); uploadBox.classList.remove('drag'); });
      });
      uploadBox.addEventListener('drop', function (e) {
        if (e.dataTransfer.files.length) {
          uploadInput.files = e.dataTransfer.files;
          handleFile(e.dataTransfer.files[0]);
        }
      });
      uploadInput.addEventListener('change', function () {
        if (uploadInput.files.length) handleFile(uploadInput.files[0]);
      });
      function handleFile(file) {
        state.fileName = file.name;
        var reader = new FileReader();
        reader.onload = function (e) {
          uploadPreview.querySelector('img').src = e.target.result;
          uploadPreview.querySelector('span').textContent = file.name;
          uploadPreview.classList.add('show');
          renderSummary();
        };
        reader.readAsDataURL(file);
      }
    }

    renderShape();
    renderSummary();
  }

})();
