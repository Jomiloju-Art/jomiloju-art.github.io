// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

function closeNav() {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) closeNav();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNav();
});

// Reveal sections as they scroll into view
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}

// Copy email address
const copyBtn = document.getElementById('copy-email');
copyBtn.addEventListener('click', async () => {
  const label = copyBtn.textContent;
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.email);
    copyBtn.textContent = 'Copied';
  } catch {
    window.location.href = 'mailto:' + copyBtn.dataset.email;
    return;
  }
  setTimeout(() => { copyBtn.textContent = label; }, 2000);
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Creative layer ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Scroll progress bar
const progress = document.querySelector('.progress');
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Rotating headline word
const rotate = document.getElementById('rotate');
const words = ['websites', 'web apps', 'dashboards', 'back ends'];
if (!reduceMotion) {
  let w = 0;
  setInterval(() => {
    rotate.classList.add('out');
    setTimeout(() => {
      w = (w + 1) % words.length;
      rotate.textContent = words[w];
      rotate.classList.remove('out');
    }, 300);
  }, 2400);
}

// Type the code window out, keeping its colours
const typed = document.getElementById('typed');
if (!reduceMotion) {
  typed.parentElement.style.minHeight = typed.parentElement.offsetHeight + 'px';
  const walker = document.createTreeWalker(typed, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push({ node: walker.currentNode, text: walker.currentNode.textContent });
  nodes.forEach((n) => { n.node.textContent = ''; });
  let ni = 0;
  let ci = 0;
  const timer = setInterval(() => {
    if (ni >= nodes.length) { clearInterval(timer); return; }
    ci += 1;
    nodes[ni].node.textContent = nodes[ni].text.slice(0, ci);
    if (ci >= nodes[ni].text.length) { ni += 1; ci = 0; }
  }, 16);
}

// Count the hero figures up
function showCount(el, value) {
  el.textContent = (el.dataset.prefix || '') + Math.round(value).toLocaleString('en-US') + (el.dataset.suffix || '');
}
if (!reduceMotion && 'IntersectionObserver' in window) {
  const counter = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      counter.unobserve(el);
      const target = Number(el.dataset.count);
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / 1400, 1);
        showCount(el, target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => counter.observe(el));
}

// Marquee: duplicate the items so the loop is seamless
const track = document.querySelector('.marquee-track');
track.innerHTML += track.innerHTML;

// Cursor glow and 3D tilt on project cards (mouse only)
if (finePointer) {
  document.querySelectorAll('.glow').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el.style.setProperty('--mx', x + 'px');
      el.style.setProperty('--my', y + 'px');
      if (el.classList.contains('tilt') && !reduceMotion) {
        const rx = (0.5 - y / r.height) * 7;
        const ry = (x / r.width - 0.5) * 7;
        el.style.transition = 'transform 0.1s, border-color 0.25s';
        el.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      }
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = '';
      el.style.transform = '';
    });
  });
}
