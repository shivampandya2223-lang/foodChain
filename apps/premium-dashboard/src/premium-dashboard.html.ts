export function renderPremiumDashboardHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Food Chain Command Center</title>
    <script src="/config.js"></script>
    <style>
      :root {
        color-scheme: dark;
        --bg: #090b0f;
        --panel: rgba(18, 24, 32, 0.92);
        --panel-2: rgba(24, 31, 41, 0.96);
        --line: rgba(149, 164, 186, 0.18);
        --text: #edf3fb;
        --muted: #94a3b8;
        --brand: #2dd4bf;
        --brand-2: #38bdf8;
        --accent: #f59e0b;
        --danger: #fb7185;
        --success: #22c55e;
        --shadow: 0 20px 60px rgba(0, 0, 0, 0.36);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        background:
          linear-gradient(145deg, rgba(45, 212, 191, 0.08), transparent 28%),
          linear-gradient(45deg, rgba(56, 189, 248, 0.07), transparent 32%),
          var(--bg);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .app {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 272px minmax(0, 1fr);
      }

      aside {
        border-right: 1px solid var(--line);
        background: rgba(8, 12, 17, 0.86);
        padding: 22px;
        position: sticky;
        top: 0;
        height: 100vh;
      }

      .brand {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 28px;
      }

      .logo {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        display: grid;
        place-items: center;
        box-shadow: 0 12px 30px rgba(45, 212, 191, 0.2);
      }

      .logo svg { width: 24px; height: 24px; fill: #06201d; }
      .brand strong { display: block; font-size: 16px; }
      .brand span { color: var(--muted); font-size: 12px; }

      nav {
        display: grid;
        gap: 8px;
      }

      nav a {
        color: #cbd5e1;
        text-decoration: none;
        padding: 11px 12px;
        border: 1px solid transparent;
        border-radius: 8px;
        font-size: 14px;
      }

      nav a.active, nav a:hover {
        background: rgba(45, 212, 191, 0.08);
        border-color: rgba(45, 212, 191, 0.22);
        color: #ffffff;
      }

      .side-card {
        margin-top: 24px;
        padding: 14px;
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 10px;
      }

      .side-card .small { color: var(--muted); font-size: 12px; }
      .side-card .big { margin-top: 6px; font-weight: 800; font-size: 18px; }

      main {
        padding: 24px;
        display: grid;
        gap: 18px;
      }

      header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 18px;
      }

      h1 {
        margin: 0;
        font-size: 28px;
        letter-spacing: 0;
      }

      .subtitle {
        color: var(--muted);
        margin-top: 6px;
        font-size: 14px;
      }

      .toolbar {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }

      .pill {
        display: inline-flex;
        gap: 8px;
        align-items: center;
        min-height: 36px;
        padding: 8px 11px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--panel);
        color: #dbeafe;
        font-size: 13px;
      }

      .pulse {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--danger);
        box-shadow: 0 0 0 4px rgba(251, 113, 133, 0.12);
      }

      .pulse.on {
        background: var(--success);
        box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
      }

      .pulse.idle {
        background: var(--accent);
        box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12);
      }

      .grid { display: grid; gap: 14px; }
      .kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .two { grid-template-columns: 1.05fr 1.45fr; }
      .three { grid-template-columns: repeat(3, minmax(0, 1fr)); }

      .card {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 12px;
        box-shadow: var(--shadow);
      }

      .card-body { padding: 16px; }
      .card-head {
        padding: 15px 16px;
        border-bottom: 1px solid var(--line);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .card h2 {
        margin: 0;
        font-size: 15px;
        letter-spacing: 0;
      }

      .metric {
        font-size: 30px;
        font-weight: 900;
        line-height: 1;
      }

      .metric-label {
        color: var(--muted);
        font-size: 12px;
        margin-top: 7px;
      }

      .spark {
        width: 100%;
        height: 34px;
        margin-top: 14px;
        border-radius: 6px;
        background:
          linear-gradient(90deg, rgba(45, 212, 191, 0.16), rgba(56, 189, 248, 0.1)),
          repeating-linear-gradient(90deg, transparent 0 12px, rgba(255,255,255,0.08) 12px 13px);
      }

      .service {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 12px 0;
        border-top: 1px solid var(--line);
      }

      .service:first-child { border-top: 0; }
      .service strong { display: block; font-size: 14px; }
      .service span { color: var(--muted); font-size: 12px; overflow-wrap: anywhere; }

      .status {
        padding: 5px 9px;
        border-radius: 999px;
        font-size: 12px;
        border: 1px solid rgba(148, 163, 184, 0.28);
        color: var(--muted);
      }

      .status.good {
        color: #86efac;
        border-color: rgba(34, 197, 94, 0.3);
        background: rgba(34, 197, 94, 0.08);
      }

      .status.bad {
        color: #fda4af;
        border-color: rgba(251, 113, 133, 0.32);
        background: rgba(251, 113, 133, 0.08);
      }

      .topic-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }

      .topic {
        border: 1px solid var(--line);
        background: rgba(15, 23, 32, 0.82);
        border-radius: 10px;
        padding: 12px;
      }

      .topic strong {
        display: block;
        font-size: 13px;
        overflow-wrap: anywhere;
      }

      .topic span {
        color: var(--muted);
        display: block;
        margin-top: 8px;
        font-size: 12px;
      }

      .event-list {
        display: grid;
        gap: 10px;
        max-height: 520px;
        overflow: auto;
        padding-right: 4px;
      }

      .event {
        border: 1px solid var(--line);
        border-left: 4px solid var(--brand);
        background: rgba(12, 18, 25, 0.9);
        border-radius: 10px;
        padding: 12px;
      }

      .event-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        font-size: 13px;
        font-weight: 800;
      }

      .event pre {
        margin: 10px 0 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        color: #aab8ca;
        font-size: 12px;
      }

      .role-chain {
        display: grid;
        gap: 10px;
      }

      .role {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px;
        align-items: center;
        padding: 11px;
        background: rgba(15, 23, 32, 0.82);
        border: 1px solid var(--line);
        border-radius: 10px;
      }

      .rank {
        width: 30px;
        height: 30px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        background: rgba(45, 212, 191, 0.12);
        color: var(--brand);
        font-weight: 900;
      }

      .module-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .module {
        border: 1px solid var(--line);
        background: rgba(15, 23, 32, 0.82);
        color: #dbeafe;
        padding: 7px 10px;
        border-radius: 999px;
        font-size: 12px;
      }

      .visual {
        min-height: 220px;
        display: grid;
        place-items: center;
        overflow: hidden;
        position: relative;
      }

      .visual svg {
        width: min(100%, 420px);
        height: auto;
      }

      @media (max-width: 1100px) {
        .app { grid-template-columns: 1fr; }
        aside { position: static; height: auto; }
        .kpis, .two, .three, .topic-grid { grid-template-columns: 1fr; }
        header { flex-direction: column; }
      }
    </style>
  </head>
  <body>
    <div class="app">
      <aside>
        <div class="brand">
          <div class="logo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5 12 2l8 3.5v6.8c0 4.6-3.2 8.4-8 9.7-4.8-1.3-8-5.1-8-9.7V5.5Zm8 1.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 2.2 1.1 2.1 2.4.4-1.7 1.7.4 2.4-2.2-1.1-2.2 1.1.4-2.4-1.7-1.7 2.4-.4L12 9Z"/></svg>
          </div>
          <div><strong>Command Center</strong><span>Super Admin</span></div>
        </div>
        <nav>
          <a class="active" href="#overview">Executive Overview</a>
          <a href="#services">Service Mesh</a>
          <a href="#events">Kafka Stream</a>
          <a href="#access">Access Model</a>
        </nav>
        <div class="side-card">
          <div class="small">Kafka mode</div>
          <div id="side-kafka" class="big">Loading</div>
        </div>
      </aside>
      <main>
        <header id="overview">
          <div>
            <h1>Super Admin Operations Dashboard</h1>
            <div class="subtitle">Premium command surface for services, Kafka events, access hierarchy, and platform modules.</div>
          </div>
          <div class="toolbar">
            <div class="pill"><span id="kafka-pulse" class="pulse"></span><span id="kafka-label">Connecting</span></div>
            <div class="pill" id="clock">--:--</div>
          </div>
        </header>

        <section class="grid kpis">
          <div class="card"><div class="card-body"><div class="metric" id="events-total">0</div><div class="metric-label">Events consumed</div><div class="spark"></div></div></div>
          <div class="card"><div class="card-body"><div class="metric" id="healthy-services">0</div><div class="metric-label">Healthy services</div><div class="spark"></div></div></div>
          <div class="card"><div class="card-body"><div class="metric" id="topics-total">0</div><div class="metric-label">Topics monitored</div><div class="spark"></div></div></div>
          <div class="card"><div class="card-body"><div class="metric" id="modules-total">0</div><div class="metric-label">Business modules</div><div class="spark"></div></div></div>
        </section>

        <section class="grid two">
          <div class="card" id="services">
            <div class="card-head"><h2>Service Mesh</h2><span class="status" id="mesh-status">checking</span></div>
            <div class="card-body" id="services-list"></div>
          </div>
          <div class="card">
            <div class="card-head"><h2>Kafka Topic Matrix</h2><span class="status">live counters</span></div>
            <div class="card-body"><div class="topic-grid" id="topics-list"></div></div>
          </div>
        </section>

        <section class="grid two">
          <div class="card visual">
            <svg viewBox="0 0 520 260" role="img" aria-label="Food Chain service topology">
              <defs>
                <linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#2dd4bf"/><stop offset="1" stop-color="#38bdf8"/></linearGradient>
              </defs>
              <rect x="22" y="22" width="476" height="216" rx="22" fill="#0f1720" stroke="rgba(148,163,184,.24)"/>
              <circle cx="260" cy="130" r="54" fill="url(#g)" opacity=".95"/>
              <text x="260" y="125" fill="#06201d" font-size="18" text-anchor="middle" font-weight="900">Kafka</text>
              <text x="260" y="146" fill="#06201d" font-size="12" text-anchor="middle" font-weight="800">Event Bus</text>
              <g fill="none" stroke="#38bdf8" stroke-width="3" opacity=".65">
                <path d="M158 74 C190 88 210 102 220 118"/>
                <path d="M158 186 C190 172 210 158 220 142"/>
                <path d="M362 74 C330 88 310 102 300 118"/>
                <path d="M362 186 C330 172 310 158 300 142"/>
              </g>
              <g fill="#17212c" stroke="rgba(148,163,184,.28)">
                <rect x="58" y="48" width="118" height="48" rx="10"/>
                <rect x="58" y="164" width="118" height="48" rx="10"/>
                <rect x="344" y="48" width="118" height="48" rx="10"/>
                <rect x="344" y="164" width="118" height="48" rx="10"/>
              </g>
              <g fill="#edf3fb" font-size="13" font-weight="800" text-anchor="middle">
                <text x="117" y="77">API</text>
                <text x="117" y="193">Inventory</text>
                <text x="403" y="77">Notify</text>
                <text x="403" y="193">Analytics</text>
              </g>
            </svg>
          </div>
          <div class="card" id="access">
            <div class="card-head"><h2>Access Hierarchy</h2><span class="status">RBAC</span></div>
            <div class="card-body"><div class="role-chain" id="roles-list"></div></div>
          </div>
        </section>

        <section class="card">
          <div class="card-head"><h2>Business Modules</h2><span class="status">platform map</span></div>
          <div class="card-body"><div class="module-wrap" id="modules-list"></div></div>
        </section>

        <section class="card" id="events">
          <div class="card-head"><h2>Real-Time Kafka Event Feed</h2><span class="status" id="feed-status">waiting</span></div>
          <div class="card-body"><div class="event-list" id="events-list"></div></div>
        </section>
      </main>
    </div>

    <script>
      const config = window.FOOD_CHAIN_CONFIG || { adminDashboardUrl: 'http://localhost:1309' };
      const state = { topics: [], counters: {}, events: [] };

      function updateClock() {
        document.getElementById('clock').textContent = new Date().toLocaleString();
      }
      setInterval(updateClock, 1000);
      updateClock();

      function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (character) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        }[character]));
      }

      function setKafka(status) {
        const pulse = document.getElementById('kafka-pulse');
        const label = document.getElementById('kafka-label');
        const side = document.getElementById('side-kafka');
        pulse.className = 'pulse ' + (status.connected ? 'on' : status.enabled ? '' : 'idle');
        label.textContent = status.connected ? 'Kafka connected' : status.enabled ? 'Kafka disconnected' : 'Kafka disabled';
        side.textContent = status.connected ? 'Connected' : status.enabled ? 'Disconnected' : 'Disabled';
        state.topics = status.topics || [];
        state.counters = status.consumedByTopic || {};
        renderTopics();
        renderMetrics();
      }

      function renderMetrics() {
        const total = Object.values(state.counters).reduce((sum, value) => sum + Number(value || 0), 0);
        document.getElementById('events-total').textContent = total;
        document.getElementById('topics-total').textContent = state.topics.length;
      }

      function renderServices(services) {
        const healthy = services.filter((service) => service.healthy).length;
        document.getElementById('healthy-services').textContent = healthy;
        document.getElementById('mesh-status').textContent = healthy + '/' + services.length + ' online';
        document.getElementById('services-list').innerHTML = services.map((service) => \`
          <div class="service">
            <div><strong>\${escapeHtml(service.name)}</strong><span>\${escapeHtml(service.url)}</span></div>
            <div class="status \${service.healthy ? 'good' : 'bad'}">\${service.healthy ? 'online' : 'offline'}</div>
          </div>
        \`).join('');
      }

      function renderTopics() {
        document.getElementById('topics-list').innerHTML = state.topics.map((topic) => \`
          <div class="topic"><strong>\${escapeHtml(topic)}</strong><span>\${Number(state.counters[topic] || 0)} consumed</span></div>
        \`).join('');
      }

      function renderEvents() {
        const list = document.getElementById('events-list');
        document.getElementById('feed-status').textContent = state.events.length ? 'streaming' : 'waiting';
        if (!state.events.length) {
          list.innerHTML = '<div class="event"><div class="event-top"><span>No events yet</span><span>live</span></div><pre>Start Kafka, create orders, update inventory, assign tasks, or create shops/users.</pre></div>';
          return;
        }
        list.innerHTML = state.events.slice(0, 70).map((event) => \`
          <div class="event">
            <div class="event-top"><span>\${escapeHtml(event.topic)}</span><span>\${escapeHtml(new Date(event.occurredAt).toLocaleTimeString())}</span></div>
            <pre>\${escapeHtml(JSON.stringify(event.payload, null, 2))}</pre>
          </div>
        \`).join('');
      }

      function renderStatic(summary) {
        document.getElementById('modules-total').textContent = summary.modules.length;
        document.getElementById('roles-list').innerHTML = summary.roleHierarchy.map((role, index) => \`
          <div class="role"><div class="rank">\${index + 1}</div><div>\${escapeHtml(role)}</div></div>
        \`).join('');
        document.getElementById('modules-list').innerHTML = summary.modules.map((moduleName) => \`
          <span class="module">\${escapeHtml(moduleName)}</span>
        \`).join('');
      }

      async function loadSummary() {
        const response = await fetch(config.adminDashboardUrl + '/api/summary');
        const summary = await response.json();
        setKafka(summary.kafka);
        renderServices(summary.services);
        renderStatic(summary);
        state.events = summary.recentEvents || state.events;
        renderEvents();
      }

      loadSummary().catch(() => {
        document.getElementById('services-list').innerHTML = '<div class="service"><div><strong>Admin Dashboard API</strong><span>Unable to reach backend summary service</span></div><div class="status bad">offline</div></div>';
      });
      setInterval(() => loadSummary().catch(() => undefined), 5000);

      const source = new EventSource(config.adminDashboardUrl + '/events/stream');
      source.addEventListener('snapshot', (message) => {
        const data = JSON.parse(message.data);
        setKafka(data.status);
        state.events = data.recentEvents || state.events;
        renderEvents();
      });
      source.addEventListener('kafka-event', (message) => {
        state.events.unshift(JSON.parse(message.data));
        state.events = state.events.slice(0, 100);
        renderEvents();
      });
      source.addEventListener('kafka-status', (message) => {
        setKafka(JSON.parse(message.data));
      });
      source.onerror = () => {
        document.getElementById('feed-status').textContent = 'stream disconnected';
      };
    </script>
  </body>
</html>`;
}
