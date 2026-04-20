// live terminal that replays recon + exploit loops
(function () {
  const el = document.getElementById('terminal');
  if (!el) return;

  const LINES = [
    { k: 'prompt', txt: 'nmap -sV -T4 --top-ports 200 target.corp' },
    { k: 'out',    txt: 'Starting Nmap 7.95 ( https://nmap.org )', c: 't-dim' },
    { k: 'out',    txt: 'Nmap scan report for target.corp (10.8.12.41)', c: 't-out' },
    { k: 'out',    txt: 'PORT     STATE  SERVICE   VERSION', c: 't-out' },
    { k: 'out',    txt: '22/tcp   open   ssh       OpenSSH 8.9p1', c: 't-out' },
    { k: 'out',    txt: '80/tcp   open   http      nginx 1.22', c: 't-out' },
    { k: 'out',    txt: '443/tcp  open   https     nginx 1.22', c: 't-out' },
    { k: 'out',    txt: '8443/tcp open   https-alt Jetty 11 (admin)', c: 't-warn' },
    { k: 'out',    txt: '[+] 4 open ports · 1 of interest', c: 't-ok' },

    { k: 'prompt', txt: 'nuclei -u https://target.corp:8443 -severity high,critical' },
    { k: 'out',    txt: '[INF] loaded 4842 templates · running 118 matchers', c: 't-dim' },
    { k: 'out',    txt: '[high]     jetty-version-exposure  → /version', c: 't-warn' },
    { k: 'out',    txt: '[critical] cve-2024-52316  auth-bypass (tomcat)', c: 't-bad' },
    { k: 'out',    txt: '[+] 2 findings worth triaging', c: 't-ok' },

    { k: 'prompt', txt: 'ffuf -u https://target.corp/FUZZ -w wl.txt -mc 200' },
    { k: 'out',    txt: '.admin               [Status: 200, Size: 18423]', c: 't-warn' },
    { k: 'out',    txt: '.git                 [Status: 200, Size: 4112]',  c: 't-bad' },
    { k: 'out',    txt: 'api/v1/internal      [Status: 401, Size: 31]',    c: 't-out' },

    { k: 'prompt', txt: 'curl https://target.corp/.git/config' },
    { k: 'out',    txt: '[core] bare = false', c: 't-out' },
    { k: 'out',    txt: '[remote "origin"] url = git@github.corp:infra/terraform-prod.git', c: 't-bad' },
    { k: 'out',    txt: '[+] source disclosure confirmed. escalating.', c: 't-ok' },

    { k: 'prompt', txt: 'writing report... drafting remediation.md' },
    { k: 'out',    txt: '✓ severity ranked · ✓ repro steps · ✓ owners tagged', c: 't-ok' },
    { k: 'out',    txt: '── engagement loop will restart in 3s ──', c: 't-dim' },
  ];

  const MAX_LINES = 14;
  let buffer = [];
  let running = true;
  let lineIdx = 0;

  function render() {
    // join buffer, cap to MAX_LINES visible
    const visible = buffer.slice(-MAX_LINES);
    el.innerHTML = visible.map(l => {
      if (l.k === 'prompt') {
        return `<span class="t-prompt">operator@ghostshift</span><span class="t-dim">:</span><span class="t-host">~/ops</span><span class="t-dim">$</span> <span class="t-cmd">${l.txt}${l.cursor ? '<span class="cursor"></span>' : ''}</span>`;
      }
      return `<span class="${l.c || 't-out'}">${l.txt}</span>`;
    }).join('\n');
  }

  async function typePrompt(txt) {
    // push empty prompt, then type char by char
    const entry = { k: 'prompt', txt: '', cursor: true };
    buffer.push(entry);
    for (let i = 0; i <= txt.length; i++) {
      entry.txt = txt.slice(0, i);
      render();
      await sleep(18 + Math.random() * 22);
    }
    entry.cursor = false;
    render();
    await sleep(260);
  }

  async function pushOut(txt, c) {
    buffer.push({ k: 'out', txt, c });
    render();
    await sleep(90 + Math.random() * 120);
  }

  async function loop() {
    while (running) {
      const ln = LINES[lineIdx % LINES.length];
      lineIdx++;
      if (ln.k === 'prompt') await typePrompt(ln.txt);
      else await pushOut(ln.txt, ln.c);

      if (lineIdx % LINES.length === 0) {
        await sleep(2400);
        buffer = []; // reset
        render();
      }
    }
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // pause when offscreen
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { running = e.isIntersecting; if (running) loop(); });
  }, { threshold: 0.1 });
  io.observe(el);

  loop();
})();
