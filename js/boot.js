// boot sequence overlay
(function() {
  const logEl = document.getElementById('bootLog');
  const fillEl = document.getElementById('bootFill');
  const bootEl = document.getElementById('boot');
  if (!logEl || !bootEl) return;

  const lines = [
    { t: '[ 0.0001 ] ghostshift bios v3.7.1  ──  integrity ok', c: 'dim' },
    { t: '[ 0.0132 ] loading kernel modules ............. [ ok ]', c: 'ok' },
    { t: '[ 0.0457 ] establishing wireguard tunnel ...... [ ok ]', c: 'ok' },
    { t: '[ 0.1204 ] mounting /home/operator ............ [ ok ]', c: 'ok' },
    { t: '[ 0.1890 ] rotating mac address ............... [ ok ]', c: 'ok' },
    { t: '[ 0.2451 ] stripping browser fingerprint ...... [ ok ]', c: 'ok' },
    { t: '[ 0.3012 ] verifying operator signature ....... [ ok ]', c: 'ok' },
    { t: '[ 0.3987 ] welcome back, jay.', c: 'ok' },
  ];

  let i = 0;
  const step = () => {
    if (i >= lines.length) {
      fillEl.style.width = '100%';
      setTimeout(() => { bootEl.classList.add('done'); setTimeout(()=>bootEl.remove(), 520); }, 280);
      return;
    }
    const ln = lines[i];
    const cls = ln.c || '';
    logEl.innerHTML += `<span class="${cls}">${ln.t}</span>\n`;
    fillEl.style.width = Math.round(((i+1)/lines.length) * 98) + '%';
    i++;
    setTimeout(step, 120 + Math.random()*100);
  };
  // Skip boot on revisit within 5 min for speed
  try {
    const last = parseInt(sessionStorage.getItem('gs_boot') || '0', 10);
    if (Date.now() - last < 5*60*1000) {
      bootEl.remove();
      return;
    }
    sessionStorage.setItem('gs_boot', String(Date.now()));
  } catch (e) {}
  setTimeout(step, 140);
})();
