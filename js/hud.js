// HUD: radar blips, vitals sparklines, uptime counter, coords drift, ticker feed
(function () {
  // --- uptime + coords drift
  const start = Date.now();
  const uptime = document.getElementById('uptime');
  const latEl = document.getElementById('coord-lat');
  const lonEl = document.getElementById('coord-lon');
  const baseLat = -37.8136, baseLon = 144.9631;
  function tick() {
    const secs = Math.floor((Date.now() - start) / 1000);
    const h = String(Math.floor(secs/3600)).padStart(2,'0');
    const m = String(Math.floor((secs%3600)/60)).padStart(2,'0');
    const s = String(secs%60).padStart(2,'0');
    if (uptime) uptime.textContent = `${h}:${m}:${s}`;
    // slight lat/lon jitter for 'live gps' feel
    if (latEl) latEl.textContent = (baseLat + (Math.random()-0.5)*0.001).toFixed(4) + '°';
    if (lonEl) lonEl.textContent = (baseLon + (Math.random()-0.5)*0.001).toFixed(4) + '°';
  }
  tick();
  setInterval(tick, 1000);

  // --- radar blips: spawn at random polar coords, short life
  const blipsG = document.getElementById('radarBlips');
  const countEl = document.getElementById('radarCount');
  const hosts = [
    '10.8.12.41', '10.8.12.77', '10.8.15.3', '10.8.33.202',
    '172.16.4.51', '172.16.2.8', 'api.internal.corp', 'vault.corp'
  ];
  let discovered = 0;
  function rand(min, max) { return min + Math.random()*(max-min); }
  function spawnBlip() {
    if (!blipsG) return;
    const angle = rand(0, Math.PI*2);
    const r = rand(18, 85);
    const cx = 100 + Math.cos(angle)*r;
    const cy = 100 + Math.sin(angle)*r;
    const kind = Math.random();
    const cls = kind > 0.9 ? 'hot' : (kind > 0.75 ? 'lock' : '');

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', cy);
    dot.setAttribute('r', 2);
    dot.setAttribute('class', 'blip ' + cls);
    dot.style.opacity = '0';
    dot.style.transition = 'opacity .3s ease';
    blipsG.appendChild(dot);
    requestAnimationFrame(() => dot.style.opacity = '1');

    // pulse ring
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', cx);
    ring.setAttribute('cy', cy);
    ring.setAttribute('r', 2);
    ring.setAttribute('class', 'blip-ring');
    blipsG.appendChild(ring);

    discovered++;
    if (countEl) countEl.textContent = discovered + ' hosts';

    setTimeout(() => { ring.remove(); }, 1700);
    setTimeout(() => {
      dot.style.opacity = '0';
      setTimeout(() => dot.remove(), 400);
    }, 3500 + Math.random()*2500);

    // reset counter at 99
    if (discovered >= 99) discovered = 0;
  }
  setInterval(spawnBlip, 650);
  for (let i = 0; i < 5; i++) setTimeout(spawnBlip, i * 140);

  // --- vitals: pkt/s + cpu with mini sparkline (block chars)
  const spChars = ['▁','▂','▃','▄','▅','▆','▇','█'];
  function spark(el, valEl, suffix, min, max, prevRef) {
    const hist = [];
    setInterval(() => {
      let next = prevRef.v + (Math.random()-0.5) * (max-min)*0.25;
      next = Math.max(min, Math.min(max, next));
      prevRef.v = next;
      hist.push(next);
      if (hist.length > 14) hist.shift();
      valEl.textContent = Math.round(next) + suffix;
      el.textContent = hist.map(v => spChars[Math.min(7, Math.floor((v-min)/(max-min)*8))]).join('');
    }, 420);
  }
  const ppsRef = { v: 1240 };
  const cpuRef = { v: 22 };
  spark(document.getElementById('spark-pps'), document.getElementById('v-pps'), '', 800, 2400, ppsRef);
  spark(document.getElementById('spark-cpu'), document.getElementById('v-cpu'), '%', 8, 74, cpuRef);

  // --- ticker feed
  const tick_items = [
    'api/v1/auth — IDOR chain', 'cognito pool — misconfig audit',
    'AD forest — kerberoast path', 'azure fn — timing oracle',
    'mobile banking v4.2 — jailbreak bypass', 's3 bucket drift — 3 findings',
    'gql introspection — data exposure', 'jwt alg confusion — poc',
    'ci pipeline — secret leak scan', 'k8s rbac — priv-esc path',
  ];
  const ticker = document.getElementById('tickerTrack');
  if (ticker) {
    const doubled = [...tick_items, ...tick_items];
    ticker.innerHTML = doubled.map(t => `<span>${t}</span>`).join('');
  }
})();
