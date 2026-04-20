// misc interactions: reveal on scroll, service card parallax light, decrypt-on-hover,
// contact terminal typing, footer type, QR grid, Konami easter egg
(function () {

  // --- reveal
  const revealables = document.querySelectorAll('.section, .hero-foot');
  revealables.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  revealables.forEach(el => io.observe(el));

  // --- service card pointer-follow light
  document.querySelectorAll('.s-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  // --- decrypt on hover for any [data-decrypt]
  const CHARS = '!<>-_\\/[]{}—=+*^?#01';
  function scramble(node, duration = 700) {
    const original = node.dataset.original || node.textContent;
    node.dataset.original = original;
    const len = original.length;
    const start = performance.now();
    const queue = [];
    for (let i = 0; i < len; i++) {
      const from = original[i];
      const delay = Math.random() * 80;
      const dur = 80 + Math.random() * 250;
      queue.push({ from, i, delay, dur });
    }
    function frame(now) {
      const t = now - start;
      let out = '';
      let done = 0;
      for (const q of queue) {
        if (t - q.delay >= q.dur) { out += original[q.i]; done++; }
        else if (t - q.delay < 0) { out += original[q.i]; }
        else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      node.textContent = out;
      if (done < queue.length) requestAnimationFrame(frame);
      else node.textContent = original;
    }
    requestAnimationFrame(frame);
  }
  document.querySelectorAll('[data-decrypt]').forEach(el => {
    el.addEventListener('mouseenter', () => scramble(el));
  });
  // kick hero once on load
  window.addEventListener('load', () => {
    document.querySelectorAll('.hero [data-decrypt]').forEach((el, i) => {
      setTimeout(() => scramble(el, 500), 250 + i * 140);
    });
  });

  // --- contact terminal typing
  const contactCmd = document.getElementById('contactCmd');
  if (contactCmd) {
    const phrases = [
      'send --scope "web + api + cloud" --tier pro',
      'connect --channel email --priority high',
      'schedule --week next --duration 2w',
      'request --nda mutual --response 24h',
    ];
    let p = 0;
    async function loop() {
      while (true) {
        const txt = phrases[p % phrases.length];
        for (let i = 0; i <= txt.length; i++) {
          contactCmd.textContent = txt.slice(0, i);
          await sleep(28 + Math.random()*26);
        }
        await sleep(2000);
        for (let i = txt.length; i >= 0; i--) {
          contactCmd.textContent = txt.slice(0, i);
          await sleep(14);
        }
        p++;
      }
    }
    function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
    loop();
  }

  // --- footer type
  const footMsgs = [
    '// built after hours, between engagements.',
    '// no trackers. no cookies. no analytics.',
    '// this page rotates 0 bytes of your data.',
    '// say hi to /dev/null for me.',
  ];
  const footEl = document.getElementById('footType');
  if (footEl) {
    let fi = 0;
    setInterval(() => {
      fi = (fi + 1) % footMsgs.length;
      footEl.style.opacity = '0';
      setTimeout(() => { footEl.textContent = footMsgs[fi]; footEl.style.opacity = '1'; }, 300);
    }, 5500);
    footEl.style.transition = 'opacity .3s ease';
  }

  // --- QR grid (deterministic pseudo-random based on string for stable look)
  const qrEl = document.getElementById('qrGrid');
  if (qrEl) {
    const seed = 'ghostshift-jay';
    let h = 0; for (const c of seed) h = (h*31 + c.charCodeAt(0)) | 0;
    function nextRand() { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; }
    const cells = [];
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const on = nextRand() > 0.52;
        const s = document.createElement('span');
        // QR finder patterns at corners for authenticity
        const inCorner = (x < 3 && y < 3) || (x > 6 && y < 3) || (x < 3 && y > 6);
        const inInner = ((x === 1 || x === 2-1+1) && false); // keep simple
        if (inCorner) {
          const outer = (x === 0 || x === 2 || y === 0 || y === 2 ||
                         x === 7 || x === 9 || y === 0 || y === 2 ||
                         x === 0 || x === 2 || y === 7 || y === 9);
          const innerBlock =
            ((x >= 0 && x <= 2 && y >= 0 && y <= 2) && (x === 1 && y === 1)) ||
            ((x >= 7 && x <= 9 && y >= 0 && y <= 2) && (x === 8 && y === 1)) ||
            ((x >= 0 && x <= 2 && y >= 7 && y <= 9) && (x === 1 && y === 8));
          if (outer || innerBlock) s.classList.add('on');
        } else if (on) {
          s.classList.add('on');
        }
        qrEl.appendChild(s);
      }
    }
  }

  // --- Konami easter egg
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  window.addEventListener('keydown', (e) => {
    if (e.key === seq[pos]) {
      pos++;
      if (pos === seq.length) {
        pos = 0;
        const el = document.createElement('div');
        el.textContent = 'root shell acquired. have a good one, jay.';
        Object.assign(el.style, {
          position: 'fixed', bottom: '60px', right: '20px', zIndex: 10001,
          padding: '10px 14px', background: 'var(--bg)', color: 'var(--accent)',
          border: '1px solid var(--accent)', fontFamily: 'var(--mono)', fontSize: '12px',
          letterSpacing: '.1em', boxShadow: '0 0 20px var(--accent-glow)'
        });
        document.body.appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .6s'; }, 2400);
        setTimeout(() => el.remove(), 3200);
      }
    } else {
      pos = 0;
    }
  });

})();
