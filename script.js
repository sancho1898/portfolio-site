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
    'Software Engineer',
    'Data and reliability reporting',
    'Applied AI'
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
