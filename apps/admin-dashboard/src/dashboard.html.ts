export function renderDashboardHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Food Chain Admin Dashboard</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f7f9;
        --panel: #ffffff;
        --line: #d8dde4;
        --text: #1d2430;
        --muted: #687385;
        --brand: #116466;
        --accent: #c84b31;
        --good: #16803c;
        --bad: #b42318;
        --warn: #a15c07;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: var(--bg);
        color: var(--text);
      }

      .shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 260px 1fr;
      }

      aside {
        background: #202832;
        color: #f8fafc;
        padding: 22px 18px;
        border-right: 1px solid #111827;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 800;
        font-size: 18px;
        margin-bottom: 28px;
      }

      .mark {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 6px;
        background: var(--brand);
      }

      nav {
        display: grid;
        gap: 6px;
      }

      nav a {
        color: #d6dde8;
        text-decoration: none;
        padding: 10px 12px;
        border-radius: 6px;
        font-size: 14px;
      }

      nav a.active, nav a:hover {
        background: #303b49;
        color: #ffffff;
      }

      main {
        padding: 22px;
        display: grid;
        gap: 18px;
      }

      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      h1 {
        margin: 0;
        font-size: 24px;
        letter-spacing: 0;
      }

      .sub {
        color: var(--muted);
        margin-top: 4px;
        font-size: 14px;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 6px;
        font-size: 13px;
      }

      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--bad);
      }

      .dot.on { background: var(--good); }
      .dot.idle { background: var(--warn); }

      .grid {
        display: grid;
        gap: 14px;
      }

      .cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .cols-2 { grid-template-columns: 1fr 1.4fr; }

      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 16px;
      }

      .panel h2 {
        margin: 0 0 12px;
        font-size: 15px;
        letter-spacing: 0;
      }

      .metric {
        font-size: 26px;
        font-weight: 800;
      }

      .label {
        color: var(--muted);
        font-size: 13px;
        margin-top: 4px;
      }

      .service {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        padding: 10px 0;
        border-top: 1px solid var(--line);
      }

      .service:first-of-type { border-top: 0; }

      .service strong {
        display: block;
        font-size: 14px;
      }

      .service span {
        color: var(--muted);
        font-size: 12px;
      }

      .badge {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 4px 8px;
        font-size: 12px;
        color: var(--muted);
        background: #fafbfc;
        white-space: nowrap;
      }

      .badge.good { color: var(--good); border-color: #b7dec4; background: #f1fbf4; }
      .badge.bad { color: var(--bad); border-color: #f0b8b0; background: #fff5f3; }

      .topics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }

      .topic {
        border: 1px solid var(--line);
        border-radius: 6px;
        padding: 10px;
        background: #fafbfc;
      }

      .topic strong {
        display: block;
        font-size: 13px;
        overflow-wrap: anywhere;
      }

      .topic span {
        color: var(--muted);
        font-size: 12px;
      }

      .events {
        display: grid;
        gap: 8px;
        max-height: 420px;
        overflow: auto;
      }

      .event {
        border: 1px solid var(--line);
        border-left: 4px solid var(--brand);
        border-radius: 6px;
        padding: 10px;
        background: #ffffff;
      }

      .event-top {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-size: 13px;
        font-weight: 700;
      }

      .event pre {
        margin: 8px 0 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        color: var(--muted);
        font-size: 12px;
      }

      .transactions {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }

      .transactions th,
      .transactions td {
        padding: 10px 8px;
        border-top: 1px solid var(--line);
        text-align: left;
        vertical-align: top;
      }

      .transactions th {
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
      }

      .transactions td strong {
        display: block;
        color: var(--text);
      }

      .transactions td span {
        display: block;
        color: var(--muted);
        font-size: 12px;
        margin-top: 3px;
      }

      .money {
        font-weight: 800;
        color: var(--brand);
      }

      .chart-wrap {
        height: 280px;
        position: relative;
      }

      .chart-wrap canvas {
        width: 100%;
        height: 100%;
        display: block;
      }

      .chart-meta {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }

      .modules {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .chain {
        display: grid;
        gap: 8px;
      }

      .role {
        padding: 10px 12px;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: #fafbfc;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 1000px) {
        .shell { grid-template-columns: 1fr; }
        aside { display: none; }
        .cols-4, .cols-3, .cols-2 { grid-template-columns: 1fr; }
        header { align-items: flex-start; flex-direction: column; }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <aside>
        <div class="brand"><div class="mark">FC</div><div>Food Chain</div></div>
        <nav>
          <a class="active" href="#overview">Overview</a>
          <a href="#services">Services</a>
          <a href="#service-load">Service Load</a>
          <a href="#storage">Data Stores</a>
          <a href="#transactions">Transactions</a>
          <a href="#events">Kafka Events</a>
          <a href="#access">Access Model</a>
        </nav>
      </aside>
      <main>
        <header id="overview">
          <div>
            <h1>Super Admin Dashboard</h1>
            <div class="sub">Real-time Kafka operations, services, and platform overview.</div>
          </div>
          <div class="status-pill"><span id="kafka-dot" class="dot"></span><span id="kafka-status">Connecting</span></div>
        </header>

        <section class="grid cols-4">
          <div class="panel"><div class="metric" id="total-events">0</div><div class="label">Kafka events consumed</div></div>
          <div class="panel"><div class="metric" id="services-up">0</div><div class="label">Services healthy</div></div>
          <div class="panel"><div class="metric" id="topic-count">0</div><div class="label">Topics monitored</div></div>
          <div class="panel"><div class="metric" id="module-count">0</div><div class="label">Core modules</div></div>
        </section>

        <section class="grid cols-3">
          <div class="panel"><div class="metric" id="events-per-minute">0</div><div class="label">Events per minute</div></div>
          <div class="panel"><div class="metric" id="peak-events">0</div><div class="label">Peak events per minute</div></div>
          <div class="panel"><div class="metric" id="event-range">1L-3L</div><div class="label">Demo event scale</div></div>
        </section>

        <section class="grid cols-2">
          <div class="panel">
            <h2>24 Hour Event Volume</h2>
            <div class="chart-meta"><span class="badge">orders</span><span class="badge">inventory</span><span class="badge">tasks</span><span class="badge">users</span></div>
            <div class="chart-wrap"><canvas id="events-line-chart"></canvas></div>
          </div>
          <div class="panel">
            <h2>Events By Kafka Topic</h2>
            <div class="chart-meta"><span class="badge">1-3 lakh scale</span><span class="badge">live counters</span></div>
            <div class="chart-wrap"><canvas id="topic-bar-chart"></canvas></div>
          </div>
        </section>

        <section class="grid cols-2" id="service-load">
          <div class="panel">
            <h2>Service Event Load</h2>
            <div class="chart-meta"><span class="badge">Core API</span><span class="badge">Inventory</span><span class="badge">Notification</span><span class="badge">Analytics</span></div>
            <div class="chart-wrap"><canvas id="service-load-chart"></canvas></div>
          </div>
          <div class="panel">
            <h2>Event Task Comparison</h2>
            <div class="chart-meta"><span class="badge">which server has more work</span><span class="badge">real-time SSE</span></div>
            <div class="chart-wrap"><canvas id="service-task-chart"></canvas></div>
          </div>
        </section>

        <section class="grid cols-4">
          <div class="panel"><div class="metric" id="revenue-today">₹0</div><div class="label">Revenue today</div></div>
          <div class="panel"><div class="metric" id="orders-today">0</div><div class="label">Orders today</div></div>
          <div class="panel"><div class="metric" id="low-stock-items">0</div><div class="label">Low stock items</div></div>
          <div class="panel"><div class="metric" id="pending-tasks">0</div><div class="label">Pending tasks</div></div>
        </section>

        <section class="grid cols-2">
          <div class="panel" id="services">
            <h2>Service Health</h2>
            <div id="services-list"></div>
          </div>
          <div class="panel">
            <h2>Topic Counters</h2>
            <div class="topics" id="topics-list"></div>
          </div>
        </section>

        <section class="panel" id="storage">
          <h2>Data Stores</h2>
          <div id="persistence-loader"></div>
          <div id="storage-list"></div>
        </section>

        <section class="panel" id="transactions">
          <h2>Live Business Transactions</h2>
          <table class="transactions">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Shop</th>
                <th>Status</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody id="transactions-list"></tbody>
          </table>
        </section>

        <section class="grid cols-2">
          <div class="panel" id="access">
            <h2>Role Hierarchy</h2>
            <div class="chain" id="roles-list"></div>
          </div>
          <div class="panel">
            <h2>Project Modules</h2>
            <div class="modules" id="modules-list"></div>
          </div>
        </section>

        <section class="panel" id="events">
          <h2>Live Kafka Events</h2>
          <div class="events" id="events-list"></div>
        </section>
      </main>
    </div>

    <script>
      const state = { topics: [], counters: {}, events: [], transactions: [], analytics: null };

      function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (character) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        }[character]));
      }

      function formatMoney(value) {
        if (typeof value !== 'number') {
          return '-';
        }
        return '₹' + value.toLocaleString('en-IN');
      }

      function formatNumber(value) {
        return Number(value || 0).toLocaleString('en-IN');
      }

      function setKafkaStatus(status) {
        const dot = document.getElementById('kafka-dot');
        const text = document.getElementById('kafka-status');
        dot.className = 'dot ' + (status.connected ? 'on' : status.enabled ? '' : 'idle');
        text.textContent = status.connected ? 'Kafka connected' : status.enabled ? 'Kafka disconnected' : 'Kafka disabled';
        state.topics = status.topics || [];
        state.counters = status.consumedByTopic || {};
        renderTopics();
        renderMetrics();
      }

      function renderMetrics() {
        const total = state.analytics?.totalEvents ?? Object.values(state.counters).reduce((sum, value) => sum + Number(value || 0), 0);
        document.getElementById('total-events').textContent = formatNumber(total);
        document.getElementById('topic-count').textContent = state.topics.length;
      }

      function renderServices(services) {
        document.getElementById('services-up').textContent = services.filter((service) => service.healthy).length;
        document.getElementById('services-list').innerHTML = services.map((service) => \`
          <div class="service">
            <div><strong>\${escapeHtml(service.name)}</strong><span>\${escapeHtml(service.url)}</span></div>
            <div class="badge \${service.healthy ? 'good' : 'bad'}">\${service.healthy ? 'healthy' : 'down'}</div>
          </div>
        \`).join('');
      }

      function renderStorage(storage, persistence) {
        if (!storage) {
          return;
        }
        if (persistence) {
          const loaderState = persistence.databaseWritesActive ? 'connected' : 'waiting';
          document.getElementById('persistence-loader').innerHTML = \`
            <div class="service">
              <div><strong>Event Persistence Loader</strong><span>\${escapeHtml(persistence.message)}</span></div>
              <div class="badge \${persistence.databaseWritesActive ? 'good' : ''}">\${escapeHtml(loaderState)}</div>
            </div>
          \`;
        }
        const stores = [
          {
            name: 'PostgreSQL',
            detail: storage.postgres?.database || 'business database',
            healthy: storage.postgres?.enabled,
          },
          {
            name: 'Redis',
            detail: storage.redis?.url || 'cache disabled',
            healthy: storage.redis?.connected,
            enabled: storage.redis?.enabled,
          },
          {
            name: 'MongoDB',
            detail: storage.mongo?.database || 'event store disabled',
            healthy: storage.mongo?.connected,
            enabled: storage.mongo?.enabled,
          },
        ];

        document.getElementById('storage-list').innerHTML = stores.map((store) => {
          const state = store.healthy ? 'connected' : store.enabled === false ? 'disabled' : 'offline';
          return \`
            <div class="service">
              <div><strong>\${escapeHtml(store.name)}</strong><span>\${escapeHtml(store.detail)}</span></div>
              <div class="badge \${store.healthy ? 'good' : store.enabled === false ? '' : 'bad'}">\${state}</div>
            </div>
          \`;
        }).join('');
      }

      function renderTopics() {
        document.getElementById('topics-list').innerHTML = state.topics.map((topic) => \`
          <div class="topic"><strong>\${escapeHtml(topic)}</strong><span>\${Number(state.counters[topic] || 0)} events</span></div>
        \`).join('');
      }

      function renderBusiness(business) {
        if (!business) {
          return;
        }
        document.getElementById('revenue-today').textContent = formatMoney(business.revenueToday);
        document.getElementById('orders-today').textContent = formatNumber(business.ordersToday);
        document.getElementById('low-stock-items').textContent = formatNumber(business.lowStockItems);
        document.getElementById('pending-tasks').textContent = formatNumber(business.pendingTasks);
      }

      function renderAnalytics(analytics) {
        if (!analytics) {
          return;
        }
        state.analytics = analytics;
        document.getElementById('events-per-minute').textContent = formatNumber(analytics.eventsPerMinute);
        document.getElementById('peak-events').textContent = formatNumber(analytics.peakEventsPerMinute);
        document.getElementById('event-range').textContent = formatNumber(analytics.generatedRange.min) + '-' + formatNumber(analytics.generatedRange.max);
        renderMetrics();
        drawLineChart('events-line-chart', analytics.timeline);
        drawBarChart('topic-bar-chart', analytics.byTopic);
        drawHorizontalBarChart('service-load-chart', analytics.byService);
        drawHorizontalBarChart('service-task-chart', analytics.eventTasksByService);
      }

      function setupCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ratio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.floor(rect.width * ratio));
        canvas.height = Math.max(1, Math.floor(rect.height * ratio));
        const context = canvas.getContext('2d');
        context.scale(ratio, ratio);
        return { canvas, context, width: rect.width, height: rect.height };
      }

      function drawLineChart(canvasId, points) {
        const { context, width, height } = setupCanvas(canvasId);
        context.clearRect(0, 0, width, height);
        const padding = 34;
        const max = Math.max(...points.map((point) => point.count), 1);
        context.strokeStyle = '#d8dde4';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(padding, padding);
        context.lineTo(padding, height - padding);
        context.lineTo(width - padding, height - padding);
        context.stroke();

        context.strokeStyle = '#116466';
        context.lineWidth = 3;
        context.beginPath();
        points.forEach((point, index) => {
          const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
          const y = height - padding - (point.count / max) * (height - padding * 2);
          if (index === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        });
        context.stroke();

        context.fillStyle = '#687385';
        context.font = '11px system-ui';
        context.fillText(formatNumber(max), padding, 16);
        context.fillText(points[0]?.label || '', padding, height - 8);
        context.fillText(points[points.length - 1]?.label || '', width - 72, height - 8);
      }

      function drawBarChart(canvasId, byTopic) {
        const { context, width, height } = setupCanvas(canvasId);
        context.clearRect(0, 0, width, height);
        const entries = Object.entries(byTopic || {});
        const max = Math.max(...entries.map(([, count]) => count), 1);
        const padding = 24;
        const gap = 8;
        const barWidth = Math.max(12, (width - padding * 2 - gap * (entries.length - 1)) / Math.max(entries.length, 1));
        context.font = '10px system-ui';
        entries.forEach(([topic, count], index) => {
          const x = padding + index * (barWidth + gap);
          const barHeight = (count / max) * (height - 72);
          const y = height - 36 - barHeight;
          context.fillStyle = index % 2 === 0 ? '#116466' : '#c84b31';
          context.fillRect(x, y, barWidth, barHeight);
          context.fillStyle = '#687385';
          context.save();
          context.translate(x + barWidth / 2, height - 28);
          context.rotate(-0.7);
          context.fillText(topic.replace('.', ' '), 0, 0);
          context.restore();
        });
      }

      function drawHorizontalBarChart(canvasId, values) {
        const { context, width, height } = setupCanvas(canvasId);
        context.clearRect(0, 0, width, height);
        const entries = Object.entries(values || {}).sort((a, b) => b[1] - a[1]);
        const max = Math.max(...entries.map(([, count]) => count), 1);
        const padding = 24;
        const rowHeight = Math.min(48, (height - padding * 2) / Math.max(entries.length, 1));

        context.font = '12px system-ui';
        entries.forEach(([label, count], index) => {
          const y = padding + index * rowHeight;
          const labelWidth = 132;
          const barStart = labelWidth;
          const barMaxWidth = width - barStart - 96;
          const barWidth = Math.max(4, (count / max) * barMaxWidth);

          context.fillStyle = '#1d2430';
          context.fillText(label, padding, y + 19);
          context.fillStyle = '#edf1f5';
          context.fillRect(barStart, y + 5, barMaxWidth, 18);
          context.fillStyle = index === 0 ? '#c84b31' : '#116466';
          context.fillRect(barStart, y + 5, barWidth, 18);
          context.fillStyle = '#687385';
          context.fillText(formatNumber(count), barStart + barMaxWidth + 12, y + 19);
        });
      }

      function renderTransactions() {
        const list = document.getElementById('transactions-list');
        list.innerHTML = state.transactions.slice(0, 16).map((transaction) => \`
          <tr>
            <td><strong>\${escapeHtml(transaction.title)}</strong><span>\${escapeHtml(transaction.referenceId)} · \${escapeHtml(transaction.type)}</span></td>
            <td>\${escapeHtml(transaction.shop)}</td>
            <td><span class="badge">\${escapeHtml(transaction.status)}</span></td>
            <td>\${escapeHtml(transaction.source)}</td>
            <td class="money">\${formatMoney(transaction.amount)}</td>
            <td>\${escapeHtml(new Date(transaction.occurredAt).toLocaleTimeString())}</td>
          </tr>
        \`).join('');
      }

      function renderEvents() {
        const list = document.getElementById('events-list');
        if (!state.events.length) {
          list.innerHTML = '<div class="event"><div class="event-top">Waiting for Kafka events</div><pre>Create orders, stock movements, tasks, shops, or users to see live updates.</pre></div>';
          return;
        }
        list.innerHTML = state.events.slice(0, 50).map((event) => \`
          <div class="event">
            <div class="event-top"><span>\${escapeHtml(event.topic)}</span><span>\${escapeHtml(new Date(event.occurredAt).toLocaleTimeString())}</span></div>
            <pre>\${escapeHtml(JSON.stringify(event.payload, null, 2))}</pre>
          </div>
        \`).join('');
      }

      function renderStatic(summary) {
        document.getElementById('module-count').textContent = summary.modules.length;
        document.getElementById('roles-list').innerHTML = summary.roleHierarchy.map((role) => \`<div class="role">\${escapeHtml(role)}</div>\`).join('');
        document.getElementById('modules-list').innerHTML = summary.modules.map((moduleName) => \`<span class="badge">\${escapeHtml(moduleName)}</span>\`).join('');
      }

      async function loadSummary() {
        const response = await fetch('/api/summary');
        const summary = await response.json();
        setKafkaStatus(summary.kafka);
        renderServices(summary.services);
        renderStorage(summary.storage, summary.persistence);
        renderStatic(summary);
        renderBusiness(summary.business);
        renderAnalytics(summary.analytics);
        state.events = summary.recentEvents || [];
        state.transactions = summary.transactions || [];
        renderEvents();
        renderTransactions();
      }

      loadSummary();
      setInterval(loadSummary, 5000);

      const source = new EventSource('/events/stream');
      source.addEventListener('snapshot', (message) => {
        const data = JSON.parse(message.data);
        setKafkaStatus(data.status);
        state.events = data.recentEvents || state.events;
        state.transactions = data.transactions || state.transactions;
        renderStorage(data.storage, data.persistence);
        renderAnalytics(data.analytics);
        renderEvents();
        renderTransactions();
      });
      source.addEventListener('kafka-event', (message) => {
        state.events.unshift(JSON.parse(message.data));
        state.events = state.events.slice(0, 100);
        renderEvents();
      });
      source.addEventListener('dashboard-transactions', (message) => {
        state.transactions = JSON.parse(message.data);
        renderTransactions();
      });
      source.addEventListener('dashboard-analytics', (message) => {
        renderAnalytics(JSON.parse(message.data));
      });
      source.addEventListener('kafka-status', (message) => {
        setKafkaStatus(JSON.parse(message.data));
      });
      window.addEventListener('resize', () => renderAnalytics(state.analytics));
    </script>
  </body>
</html>`;
}
