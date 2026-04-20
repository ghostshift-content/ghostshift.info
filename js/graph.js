// Animated lateral-movement network graph
(function () {
  const svg = document.getElementById('graph');
  const metaEl = document.getElementById('graphMeta');
  if (!svg) return;

  const W = 240, H = 180;
  const nodes = [
    { id: 'edge',  x: 28,  y: 90,  label: 'dmz.edge',   kind: 'root' },
    { id: 'web',   x: 78,  y: 50,  label: 'web-01' },
    { id: 'api',   x: 78,  y: 130, label: 'api-02' },
    { id: 'db',    x: 138, y: 48,  label: 'db-prim' },
    { id: 'cache', x: 138, y: 110, label: 'redis' },
    { id: 'ad',    x: 200, y: 72,  label: 'dc-01' },
    { id: 'hr',    x: 200, y: 140, label: 'hr-app' },
  ];
  const edges = [
    ['edge','web'], ['edge','api'],
    ['web','db'], ['api','db'], ['api','cache'],
    ['db','ad'], ['cache','hr'], ['ad','hr'],
  ];

  // render base
  const svgNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    const e = document.createElementNS(svgNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // edges first (so behind nodes)
  const edgeEls = {};
  edges.forEach(([a,b], i) => {
    const n1 = nodes.find(n => n.id === a);
    const n2 = nodes.find(n => n.id === b);
    const line = el('line', {
      x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y,
      class: 'g-edge'
    });
    svg.appendChild(line);
    edgeEls[a + '-' + b] = line;
  });

  const nodeEls = {};
  nodes.forEach(n => {
    const g = el('g', { transform: `translate(${n.x},${n.y})` });
    const c = el('circle', {
      cx: 0, cy: 0, r: n.kind === 'root' ? 6 : 5,
      class: 'g-node' + (n.kind === 'root' ? ' root' : '')
    });
    const t = el('text', { x: 0, y: 18, 'text-anchor':'middle', class: 'g-label' });
    t.textContent = n.label;
    g.appendChild(c); g.appendChild(t);
    svg.appendChild(g);
    nodeEls[n.id] = { g, c, t };
  });

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function activate(id, cls) {
    const { c } = nodeEls[id];
    c.classList.add(cls || 'on');
    await sleep(180);
  }
  async function light(from, to, live) {
    const line = edgeEls[from + '-' + to];
    if (!line) return;
    line.classList.add('on');
    if (live) line.classList.add('live');
    await sleep(260);
    if (live) setTimeout(() => line.classList.remove('live'), 900);
  }
  async function reset() {
    Object.values(nodeEls).forEach(n => { n.c.classList.remove('on'); n.c.classList.remove('pwn'); });
    Object.values(edgeEls).forEach(l => { l.classList.remove('on'); l.classList.remove('live'); });
    // restore root
    nodeEls['edge'].c.classList.add('root');
  }

  const script = [
    { meta: 'initial foothold → edge' },
    { act: ['edge','on'] },
    { meta: 'enumerating dmz → web-01, api-02' },
    { edge: ['edge','web', true] },
    { act: ['web','on'] },
    { edge: ['edge','api', true] },
    { act: ['api','on'] },
    { meta: 'pivot via api-02 → db-prim' },
    { edge: ['api','db', true] },
    { act: ['db','on'] },
    { edge: ['web','db', true] },
    { meta: 'kerberoast → dc-01' },
    { edge: ['db','ad', true] },
    { act: ['ad','pwn'] },
    { meta: 'lateral → redis & hr-app' },
    { edge: ['api','cache', true] },
    { act: ['cache','on'] },
    { edge: ['cache','hr', true] },
    { edge: ['ad','hr', true] },
    { act: ['hr','pwn'] },
    { meta: 'objective: domain admin + hr pii · ACHIEVED' },
    { wait: 2800 },
    { meta: 'restarting simulation…' },
    { wait: 900 },
    { reset: true },
  ];

  async function run() {
    while (true) {
      for (const step of script) {
        if (step.meta && metaEl) metaEl.textContent = step.meta;
        if (step.act)   await activate(step.act[0], step.act[1]);
        if (step.edge)  await light(step.edge[0], step.edge[1], step.edge[2]);
        if (step.wait)  await sleep(step.wait);
        if (step.reset) { await reset(); await sleep(400); }
        else            await sleep(220);
      }
    }
  }
  run();
})();
