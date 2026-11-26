// Mobile menu toggle.
(function () {
  const toggle = document.getElementById('menu-icon');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
})();

// Typing animation for the role line under the name.
(function () {
  const el = document.getElementById('typing');
  if (!el) return;
  const roles = [
    'Technical Program Manager',
    'Data and Analytics Program Lead',
    'Product Operations Manager',
    'Applied AI Program Manager',
    'Product Manager',
    'Business Analyst',
    'Data Analyst'
  ];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  let r = 0, i = roles[0].length, deleting = true;
  el.textContent = roles[0];

  function tick() {
    const word = roles[r];
    if (!deleting) {
      if (i < word.length) {
        i++;
        el.textContent = word.slice(0, i);
        setTimeout(tick, 70);
      } else {
        deleting = true;
        setTimeout(tick, 1800);
      }
    } else {
      if (i > 0) {
        i--;
        el.textContent = word.slice(0, i);
        setTimeout(tick, 35);
      } else {
        deleting = false;
        r = (r + 1) % roles.length;
        setTimeout(tick, 300);
      }
    }
  }
  setTimeout(tick, 1800);
})();

// Highlight the nav link for the section in view.
(function () {
  const links = Array.from(document.querySelectorAll('.navbar a'));
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => a.removeAttribute('aria-current'));
      const match = links.find(a => a.getAttribute('href') === '#' + entry.target.id);
      if (match) match.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

// Tap to flip certification cards on touch screens (links inside keep working).
(function () {
  document.querySelectorAll('.cert-flip').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      card.classList.toggle('flipped');
    });
  });
})();

// Track filter for Selected work.
(function () {
  const buttons = Array.from(document.querySelectorAll('.filter'));
  const cases = Array.from(document.querySelectorAll('#work .case'));
  if (buttons.length === 0) return;

  buttons.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    buttons.forEach(b => {
      const on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    cases.forEach(c => {
      const tracks = (c.dataset.tracks || '').split(' ');
      c.classList.toggle('hidden', f !== 'all' && !tracks.includes(f));
    });
  }));
})();

// Copy email button.
(function () {
  const btn = document.getElementById('copy-email');
  if (!btn) return;
  const original = btn.textContent;
  btn.addEventListener('click', async () => {
    const email = btn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
    } catch (err) {
      window.prompt('Copy this email address:', email);
    }
    setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 2000);
  });
})();

// Click a slide thumbnail to view it full size.
(function () {
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  const big = document.createElement('img');
  dlg.appendChild(big);
  document.body.appendChild(dlg);
  document.querySelectorAll('.visual img').forEach(img => {
    img.addEventListener('click', () => {
      big.src = img.src;
      big.alt = img.alt;
      dlg.showModal();
    });
  });
  dlg.addEventListener('click', () => dlg.close());
})();

// Carousels: centre card in focus, loops forever, auto-rotates, swipe or arrows.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ROTATE_MS = 5000;

  document.querySelectorAll('[data-cf]').forEach(init);

  function init(cf) {
    const items = Array.from(cf.children);
    items.forEach(el => el.classList.add('cf-item'));
    if (cf.dataset.height) cf.style.setProperty('--cf-h', cf.dataset.height + 'px');

    const nav = document.createElement('div');
    nav.className = 'cf-nav';
    nav.innerHTML = '<button type="button" class="cf-prev" aria-label="Previous">&#8249;</button>' +
      '<button type="button" class="cf-pause" aria-label="Pause rotation">Pause</button>' +
      '<p class="cf-count" aria-live="off"></p>' +
      '<button type="button" class="cf-next" aria-label="Next">&#8250;</button>';
    cf.insertAdjacentElement('afterend', nav);
    const count = nav.querySelector('.cf-count');
    const pauseBtn = nav.querySelector('.cf-pause');

    const autoplay = cf.hasAttribute('data-autoplay') && !reduce;
    let autoOn = autoplay;
    let hovering = false;
    let cur = 0;
    let timer = null;
    let dragX = null;
    let dragged = false;

    if (!autoplay) pauseBtn.hidden = true;

    const list = () => items.filter(el => !el.classList.contains('hidden'));

    function layout() {
      const L = list();
      const n = L.length;
      nav.hidden = n < 2;
      if (n === 0) return;
      if (cur >= n) cur = 0;
      const sep = (L[0].offsetWidth || 300) * 0.78;
      const half = n / 2;
      L.forEach((el, i) => {
        let d = i - cur;
        if (d > half) d -= n;      // shortest way round the loop
        if (d < -half) d += n;
        const ad = Math.abs(d);
        el.style.transform = `translate(-50%, -50%) translateX(${d * sep}px) translateZ(${-ad * 140}px) rotateY(${-d * 24}deg) scale(${Math.max(0.7, 1 - ad * 0.08)})`;
        el.style.opacity = ad > 2 ? '0' : String(1 - ad * 0.25);
        el.style.pointerEvents = ad > 2 ? 'none' : 'auto';
        el.style.zIndex = String(100 - ad);
        el.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      });
      count.textContent = `${cur + 1} / ${n}`;
    }

    function go(delta) {
      const n = list().length;
      if (n === 0) return;
      cur = (cur + delta + n) % n;   // wraps: last -> first and first -> last
      layout();
    }

    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      if (autoOn && !hovering) timer = setInterval(() => go(1), ROTATE_MS);
    }

    nav.querySelector('.cf-prev').addEventListener('click', () => { go(-1); start(); });
    nav.querySelector('.cf-next').addEventListener('click', () => { go(1); start(); });
    pauseBtn.addEventListener('click', () => {
      autoOn = !autoOn;
      pauseBtn.textContent = autoOn ? 'Pause' : 'Play';
      pauseBtn.setAttribute('aria-label', autoOn ? 'Pause rotation' : 'Start rotation');
      start();
    });

    cf.addEventListener('pointerenter', () => { hovering = true; stop(); });
    cf.addEventListener('pointerleave', () => { hovering = false; start(); });
    cf.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });

    // Swipe with mouse or touch.
    cf.addEventListener('pointerdown', e => { dragX = e.clientX; dragged = false; stop(); });
    cf.addEventListener('pointerup', e => {
      if (dragX === null) return;
      const dx = e.clientX - dragX;
      dragX = null;
      if (Math.abs(dx) > 8) dragged = true;
      if (dx < -40) go(1);
      else if (dx > 40) go(-1);
      start();
    });
    cf.addEventListener('pointercancel', () => { dragX = null; start(); });

    // Tap a neighbour to bring it into focus.
    cf.addEventListener('click', e => {
      if (dragged) { dragged = false; return; }
      const card = e.target.closest('.cf-item');
      if (!card) return;
      const L = list();
      const i = L.indexOf(card);
      if (i === -1 || i === cur) return;
      cur = i;
      layout();
      start();
    });

    // Work filters restart the carousel at its first card.
    if (items[0] && items[0].classList.contains('case')) {
      document.querySelectorAll('.filter').forEach(b => b.addEventListener('click', () => {
        cur = 0;
        setTimeout(layout, 0);
      }));
    }

    window.addEventListener('resize', layout);
    layout();
    start();
  }
})();
