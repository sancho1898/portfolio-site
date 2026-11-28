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

// Track filter for Professional work; also narrows Projects when a filter has matching projects.
(function () {
  const buttons = Array.from(document.querySelectorAll('.filter'));
  const cases = Array.from(document.querySelectorAll('#work .case'));
  const projects = Array.from(document.querySelectorAll('#projects .project'));
  const note = document.getElementById('filter-note');
  if (buttons.length === 0) return;

  const tracksOf = el => (el.dataset.tracks || '').split(' ');

  buttons.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    buttons.forEach(b => {
      const on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    cases.forEach(c => c.classList.toggle('hidden', f !== 'all' && !tracksOf(c).includes(f)));

    const matches = projects.filter(p => tracksOf(p).includes(f));
    const narrow = f !== 'all' && matches.length > 0;
    projects.forEach(p => p.classList.toggle('hidden', narrow && !matches.includes(p)));
    if (note) {
      note.hidden = !narrow;
      // Name each related project by its tag (e.g. "client consulting engagement").
      const kinds = matches.map(p => {
        const tag = p.querySelector('.tag');
        return tag ? tag.textContent.split('·')[0].trim().toLowerCase() : 'project';
      });
      const list = kinds.length > 1
        ? kinds.slice(0, -1).map(k => 'a ' + k).join(', ') + ' and a ' + kinds[kinds.length - 1]
        : 'a ' + kinds[0];
      note.innerHTML = narrow
        ? 'Also related, in <a href="#projects">Projects and Publication</a> below: ' + list + '.'
        : '';
    }
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

// Click (or press Enter on) any diagram or photo to view it enlarged.
(function () {
  const SELECTOR = '.visual img, .project-flow img, .mini-flow img, .about-photo';
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Enlarged image');
  dlg.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close enlarged image">&times;</button>' +
    '<img alt=""><p class="lightbox-caption"></p>';
  document.body.appendChild(dlg);
  const big = dlg.querySelector('img');
  const cap = dlg.querySelector('.lightbox-caption');

  function open(img) {
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    big.classList.toggle('is-vector', /\.svg(\?|$)/i.test(big.src));
    cap.textContent = img.alt;
    dlg.showModal();
  }
  // In a carousel, a card that is not in focus is brought forward first instead.
  const sideCard = img => {
    const card = img.closest('.cf-item');
    return card && card.getAttribute('aria-hidden') === 'true';
  };

  document.querySelectorAll(SELECTOR).forEach(img => {
    img.classList.add('zoomable');
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Enlarge image: ' + (img.alt || 'image'));
  });
  // Capture phase: decide before the carousel's own click handler brings a side card forward.
  document.addEventListener('click', e => {
    const img = e.target.closest && e.target.closest(SELECTOR);
    if (img && !sideCard(img)) open(img);
  }, true);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const img = e.target.closest && e.target.closest(SELECTOR);
    if (!img) return;
    e.preventDefault();
    open(img);
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
        // Cards out of focus are hidden from screen readers, so keep their controls out of the Tab order too.
        el.querySelectorAll('a, button, [tabindex]').forEach(f => { f.tabIndex = d === 0 ? 0 : -1; });
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
    // Keyboard users get the same pause while focus is inside the carousel.
    cf.addEventListener('focusin', () => { hovering = true; stop(); });
    cf.addEventListener('focusout', e => { if (!cf.contains(e.relatedTarget)) { hovering = false; start(); } });
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

    // Filters restart the work and project carousels at their first card.
    if (items.some(el => el.classList.contains('case') || el.classList.contains('project'))) {
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

// Experience: on desktop, "Show details" opens the bullets in a side panel and moves Education below.
(function () {
  const box = document.querySelector('.qualification-container');
  const panel = box && box.querySelector('.job-panel');
  if (!box || !panel) return;
  const wide = window.matchMedia('(min-width: 901px)');
  const jobs = Array.from(box.querySelectorAll('details.job'));

  function reset() {
    jobs.forEach(d => { d.querySelector('summary').classList.remove('is-active'); d.dataset.active = ''; });
  }
  function close() {
    reset();
    box.classList.remove('panel-open');
    panel.hidden = true;
    panel.innerHTML = '';
  }
  function open(d) {
    reset();
    d.dataset.active = '1';
    d.querySelector('summary').classList.add('is-active');
    const when = d.querySelector('.when').textContent;
    const title = d.querySelector('h4').textContent;
    const points = d.querySelector('.job-points').innerHTML;
    panel.innerHTML = '<div class="job-panel-inner"><button type="button" class="job-panel-close" aria-label="Close details">&times;</button>' +
      '<span class="when"></span><h4></h4><ul class="job-points"></ul></div>';
    panel.querySelector('.when').textContent = when;
    panel.querySelector('h4').textContent = title;
    panel.querySelector('.job-points').innerHTML = points;
    panel.querySelector('.job-panel-close').addEventListener('click', close);
    panel.hidden = false;
    box.classList.add('panel-open');
  }

  jobs.forEach(d => {
    d.querySelector('summary').addEventListener('click', e => {
      if (!wide.matches) return;          // phones keep the in-place expand
      e.preventDefault();
      if (d.dataset.active === '1') close(); else open(d);
    });
  });
  window.addEventListener('resize', () => { if (!wide.matches) close(); });
})();

// Experience: animated career path (desktop). Built from the list entries, so both views stay in sync.
(function () {
  const section = document.getElementById('experience');
  const host = document.getElementById('career-path');
  const list = section && section.querySelector('.qualification-container');
  const toggle = section && section.querySelector('.view-toggle');
  if (!section || !host || !list || !toggle) return;
  const wide = window.matchMedia('(min-width: 900px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Stops: every job, plus a start and a graduation stop for each degree, oldest first.
  const stops = [];
  section.querySelectorAll('.timeline > li[data-start]').forEach(li => {
    const logo = li.querySelector('.org-logo');
    const line = li.querySelector('.job-line');
    stops.push({
      kind: 'job', start: parseFloat(li.dataset.start), year: li.dataset.year, short: li.dataset.short,
      when: li.querySelector('.when').textContent, title: li.querySelector('h4').textContent,
      line: line ? line.textContent : '',
      points: Array.from(li.querySelectorAll('.job-points li')).map(x => x.textContent),
      logo: logo ? logo.getAttribute('src') : '', logoAlt: logo ? logo.getAttribute('alt') : ''
    });
  });
  section.querySelectorAll('.edu-card[data-start]').forEach(card => {
    const rows = {};
    card.querySelectorAll('dl > div').forEach(d => {
      rows[d.querySelector('dt').textContent.trim()] = d.querySelector('dd').textContent.trim();
    });
    const logo = card.querySelector('.org-logo');
    const base = {
      kind: 'edu', title: rows['Degree'] || '', line: rows['University'] || '',
      logo: logo ? logo.getAttribute('src') : '', logoAlt: logo ? logo.getAttribute('alt') : ''
    };
    if (card.dataset.began) {
      stops.push(Object.assign({}, base, {
        start: parseFloat(card.dataset.began), year: card.dataset.beganYear, short: card.dataset.beganShort,
        when: 'Started ' + card.dataset.beganYear, points: []
      }));
    }
    stops.push(Object.assign({}, base, {
      start: parseFloat(card.dataset.start), year: card.dataset.year, short: card.dataset.short,
      when: 'Graduated ' + (rows['Graduation Year'] || card.dataset.year),
      points: ['Concentrations', 'Honors'].filter(k => rows[k]).map(k => k + ': ' + rows[k])
    }));
  });
  stops.sort((a, b) => a.start - b.start);
  if (stops.length < 2) return;

  // A serpentine road: three rows joined by U-turns, drawn in a 1000 x 440 box.
  const VW = 1000, VH = 440, ROWS = [80, 220, 360], X0 = 110, X1 = 890;
  const d = `M 40 ${ROWS[0]} H 920 A 70 70 0 0 1 920 ${ROWS[1]} H 80 A 70 70 0 0 0 80 ${ROWS[2]} H 960`;
  const perRow = Math.ceil(stops.length / ROWS.length);
  stops.forEach((s, i) => {
    const row = Math.floor(i / perRow);
    const inRow = Math.min(perRow, stops.length - row * perRow);
    const t = inRow > 1 ? (i - row * perRow) / (inRow - 1) : 0.5;
    const x = X0 + t * (X1 - X0);
    s.x = row % 2 === 1 ? VW - x : x;   // the middle row runs right to left
    s.y = ROWS[row];
    s.row = row;
  });

  // A small illustrated walker; legs and arms swing while it moves.
  const FIGURE =
    '<svg class="cp-figure" viewBox="0 0 40 64" aria-hidden="true" focusable="false"><g class="cp-body">' +
      '<g class="leg leg-back"><rect x="16" y="40" width="5" height="18" rx="2.5" fill="#26384a"/><rect x="14.5" y="55" width="9" height="4" rx="2" fill="#16202b"/></g>' +
      '<g class="arm arm-back"><rect x="13" y="24" width="4.5" height="15" rx="2.25" fill="#b97d53"/></g>' +
      '<rect x="11" y="22" width="18" height="21" rx="6" fill="#0e7c7b"/>' +
      '<rect x="17.5" y="22" width="5" height="4" rx="1.5" fill="#ffffff" opacity="0.85"/>' +
      '<g class="leg leg-front"><rect x="19" y="40" width="5" height="18" rx="2.5" fill="#33475b"/><rect x="18.5" y="55" width="9" height="4" rx="2" fill="#16202b"/></g>' +
      '<circle cx="20" cy="13" r="8.5" fill="#cf9a70"/>' +
      '<path d="M11.4 12.6 C10.8 5.2 15.6 2.4 20.4 2.6 C26.2 2.8 29.4 6.4 28.8 11.6 C26.6 8.6 23 7.4 19 7.9 C16 8.3 13.4 9.9 11.4 12.6 Z" fill="#1d1714"/>' +
      '<circle cx="23.4" cy="13.4" r="1.05" fill="#1d1714"/>' +
      '<path d="M21.4 17.1 Q23.6 18.7 25.6 16.8" stroke="#7a3e2a" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
      '<g class="arm arm-front"><rect x="20" y="24" width="4.5" height="15" rx="2.25" fill="#cf9a70"/></g>' +
    '</g></svg>';

  let built = false, started = false, cur = 0, raf = 0, lastX = null;
  let road, total, walker, buttons, detail;

  function dotFor(s) {
    const inner = s.logo
      ? `<img src="${esc(s.logo)}" alt="" loading="lazy">`
      : `<i class="bx ${s.kind === 'edu' ? 'bxs-graduation' : 'bxs-briefcase'}" aria-hidden="true"></i>`;
    const badge = s.kind === 'edu' ? '<i class="bx bxs-graduation cp-badge" aria-hidden="true"></i>' : '';
    return `<span class="cp-dot${s.logo ? ' has-logo' : ''}">${inner}${badge}</span>`;
  }

  function build() {
    built = true;
    host.innerHTML =
      '<p class="cp-hint">Hover a stop for a one-line summary; click it to walk there and see the details.</p>' +
      '<div class="cp-stage">' +
        `<svg class="cp-svg" viewBox="0 0 ${VW} ${VH}" aria-hidden="true" focusable="false">` +
          `<path class="cp-road" d="${d}"/><path class="cp-road-line" d="${d}"/><path class="cp-progress" d="${d}"/>` +
        '</svg>' +
        stops.map((s, i) =>
          `<button type="button" class="cp-stop cp-row${s.row}" data-i="${i}" aria-pressed="false" style="left:${s.x / VW * 100}%;top:${s.y / VH * 100}%">` +
            dotFor(s) +
            `<span class="cp-label"><b>${esc(s.year)}</b>${esc(s.short)}</span>` +
            `<span class="cp-tip" role="tooltip"><strong>${esc(s.title)}</strong><em>${esc(s.when)}</em>${esc(s.line)}</span>` +
          '</button>').join('') +
        `<div class="cp-walker" aria-hidden="true">${FIGURE}</div>` +
      '</div>' +
      '<div class="cp-detail" aria-live="polite"></div>';

    road = host.querySelector('.cp-progress');
    total = road.getTotalLength();
    road.style.strokeDasharray = total;
    walker = host.querySelector('.cp-walker');
    buttons = Array.from(host.querySelectorAll('.cp-stop'));
    detail = host.querySelector('.cp-detail');

    // Distance along the road to each stop.
    const samples = [];
    for (let L = 0; L <= total; L += 4) {
      const p = road.getPointAtLength(L);
      samples.push([L, p.x, p.y]);
    }
    stops.forEach(s => {
      let best = Infinity;
      samples.forEach(([L, x, y]) => {
        const dist = (x - s.x) ** 2 + (y - s.y) ** 2;
        if (dist < best) { best = dist; s.len = L; }
      });
    });

    buttons.forEach((b, i) => b.addEventListener('click', () => {
      started = true;
      show(i);
      walkTo(stops[i].len);
    }));
    place(0);

    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); intro(); }
    }, { threshold: 0.35 });
    io.observe(host);
  }

  function place(len) {
    const p = road.getPointAtLength(len);
    walker.style.left = (p.x / VW * 100) + '%';
    walker.style.top = (p.y / VH * 100) + '%';
    if (lastX !== null && Math.abs(p.x - lastX) > 0.2) walker.classList.toggle('face-left', p.x < lastX);
    lastX = p.x;
    road.style.strokeDashoffset = total - len;
    buttons.forEach((b, i) => {
      const reached = stops[i].len <= len + 1;
      if (reached && !b.classList.contains('visited')) {
        // Each logo pops as the walker reaches it.
        b.classList.add('pop');
        setTimeout(() => b.classList.remove('pop'), 600);
      }
      b.classList.toggle('visited', reached);
    });
  }

  function walkTo(target, ms, done) {
    cancelAnimationFrame(raf);
    if (reduce) { cur = target; place(cur); if (done) done(); return; }
    const from = cur, t0 = performance.now();
    const dur = ms || Math.min(2200, Math.max(500, Math.abs(target - from) * 1.2));
    walker.classList.add('walking');
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      cur = from + (target - from) * e;
      place(cur);
      if (k < 1) raf = requestAnimationFrame(step);
      else { walker.classList.remove('walking'); if (done) done(); }
    };
    raf = requestAnimationFrame(step);
  }

  function show(i) {
    const s = stops[i];
    buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
    detail.innerHTML =
      (s.logo ? `<img src="${esc(s.logo)}" alt="${esc(s.logoAlt)}">` : '') +
      `<div><span class="when">${esc(s.when)}</span><h4>${esc(s.title)}</h4>` +
      (s.line ? `<p class="cp-line">${esc(s.line)}</p>` : '') +
      (s.points.length ? '<ul>' + s.points.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>' : '') +
      '</div>';
  }

  // First view: walk from the start to the present, then open the current role.
  function intro() {
    if (started) return;
    started = true;
    const last = stops.length - 1;
    walkTo(stops[last].len, 5200, () => show(last));
  }

  function setView(v) {
    const path = v === 'path' && wide.matches;
    host.hidden = !path;
    list.hidden = path;
    toggle.querySelectorAll('button').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.view === (path ? 'path' : 'list'))));
    if (path && !built) build();
  }
  toggle.querySelectorAll('button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  wide.addEventListener('change', () => setView(wide.matches ? 'path' : 'list'));
  setView('path');
})();
