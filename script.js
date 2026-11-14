const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;

// Copy email address, with a visible "Copied" state on the button
const copyBtn = document.getElementById('copy-email');
const copyStatus = document.getElementById('copy-status');
const copyLabel = copyBtn.textContent;
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.email);
    copyBtn.textContent = 'Copied ✓';
    copyBtn.classList.add('done');
    copyStatus.textContent = 'Email address copied.';
  } catch {
    copyStatus.textContent = "Couldn't copy. Select the address above instead.";
  }
  setTimeout(() => {
    copyBtn.textContent = copyLabel;
    copyBtn.classList.remove('done');
    copyStatus.textContent = '';
  }, 2200);
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Phones: no hover, so play the DDUROGA scroll and project effects as they come into view
if (!canHover && !reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('in-view', e.isIntersecting));
  }, { threshold: 0.6 });
  document.querySelectorAll('.feature-shot, .feature, .project').forEach((el) => io.observe(el));
}

// Headline: letters near the pointer widen (the font can change width smoothly).
// On phones, a wave runs across the headline after it appears, and again as you scroll.
const wave = document.querySelector('.hero h1.wave');
if (wave && !reduceMotion) {
  const MIN = 62;
  const MAX = 115;
  const chars = [];
  wave.querySelectorAll('.line').forEach((line) => {
    const text = line.textContent;
    line.textContent = '';
    for (const ch of text) {
      if (ch === ' ') { line.append(' '); continue; }
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = ch;
      line.append(span);
      chars.push(span);
    }
  });

  let centers = [];
  let radius = 200;
  const reset = () => chars.forEach((c) => { c.style.fontStretch = ''; });
  const measure = () => {
    reset();
    radius = parseFloat(getComputedStyle(wave).fontSize) * 2.4;
    centers = chars.map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY };
    });
  };
  const apply = (x, y) => {
    chars.forEach((c, i) => {
      const d = Math.hypot(centers[i].x - x, centers[i].y - y);
      const f = Math.max(0, 1 - d / radius);
      c.style.fontStretch = `${MIN + (MAX - MIN) * f * f}%`;
    });
  };

  let frame = 0;
  const queue = (x, y) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => apply(x, y));
  };

  // A point that travels along the lines, left to right, top to bottom (p goes 0 to 1)
  const along = (p) => {
    const first = centers[0];
    const last = centers[centers.length - 1];
    const lines = wave.querySelectorAll('.line').length;
    const lineIndex = Math.min(lines - 1, Math.floor(p * lines));
    const inLine = p * lines - lineIndex;
    const box = wave.getBoundingClientRect();
    return {
      x: box.left + window.scrollX + inLine * box.width * 0.9,
      y: first.y + (last.y - first.y) * (lineIndex / Math.max(1, lines - 1)),
    };
  };

  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  ready.then(() => {
    setTimeout(measure, 950); // after the reveal animation
    let resizeTimer = 0;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(measure, 200); });

    if (canHover) {
      const hero = document.querySelector('.hero');
      hero.addEventListener('pointermove', (e) => { if (centers.length) queue(e.pageX, e.pageY); });
      hero.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); reset(); });
    } else {
      // One sweep after load, then follow the scroll through the hero
      setTimeout(() => {
        const start = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - start) / 1800);
          const pt = along(p);
          apply(pt.x, pt.y);
          if (p < 1) requestAnimationFrame(step); else reset();
        };
        requestAnimationFrame(step);
      }, 1100);
      window.addEventListener('scroll', () => {
        if (!centers.length) return;
        const end = wave.getBoundingClientRect().bottom + window.scrollY;
        const p = window.scrollY / end;
        if (p <= 0.02 || p >= 1) { reset(); return; }
        const pt = along(p);
        queue(pt.x, pt.y);
      }, { passive: true });
    }
  });
}
