const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const currentPage = document.body.dataset.page;
$$(`[data-nav="${currentPage}"]`).forEach(link => link.classList.add("active"));

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function moneyCard(challenge, index) {
  return `
    <article class="pricing-card ${index === 1 ? "featured" : ""}">
      <span class="badge">${challenge.badge}</span>
      <h3>${challenge.name}</h3>
      <p>${challenge.phase} evaluation for traders who want funded capital without overbuilding risk.</p>
      <div class="price">${challenge.capital}</div>
      <ul class="list">
        <li>Entry fee: ${challenge.price}</li>
        <li>Profit target: ${challenge.target}</li>
        <li>Max drawdown: ${challenge.drawdown}</li>
        <li>Profit split: ${challenge.split}</li>
      </ul>
      <button class="btn btn-primary" data-apply="${challenge.id}" data-amount="${challenge.price}">Start challenge</button>
    </article>
  `;
}

async function hydrateChallenges() {
  const mount = $("#challenge-cards");
  if (!mount) return;

  try {
    const { challenges } = await api("/api/challenges");
    mount.innerHTML = challenges.map(moneyCard).join("");

    $$("[data-apply]", mount).forEach(button => {
      button.addEventListener("click", async () => {
        const payload = {
          challengeId: button.dataset.apply,
          amount: button.dataset.amount,
          channel: "frontend-demo"
        };
        const result = await api("/api/payments/initialize", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        showNotice(`Payment placeholder created: ${result.reference}`);
      });
    });
  } catch (error) {
    mount.innerHTML = `<div class="notice show">Challenge API placeholder is offline.</div>`;
  }
}

async function hydrateLeaderboard() {
  const mount = $("#leaderboard-list");
  if (!mount) return;

  try {
    const { leaderboard } = await api("/api/leaderboard");
    mount.innerHTML = leaderboard.map(row => `
      <article class="leader-row">
        <div class="rank">${row.rank}</div>
        <div>
          <strong>${row.name}</strong>
          <div class="tiny-label">${row.city}</div>
        </div>
        <div>
          <div class="tiny-label">Profit</div>
          <strong>${row.profit}</strong>
        </div>
        <div>
          <div class="tiny-label">Consistency</div>
          <strong>${row.consistency}</strong>
        </div>
      </article>
    `).join("");
  } catch (error) {
    mount.innerHTML = `<div class="notice show">Leaderboard API placeholder is offline.</div>`;
  }
}

async function hydrateDashboard() {
  const mount = $("#dashboard-data");
  if (!mount) return;

  try {
    const data = await api("/api/dashboard");
    mount.innerHTML = `
      <section class="dashboard-widget">
        <div class="tiny-label">${data.account}</div>
        <h3>${data.trader}</h3>
        <div class="progress-ring" style="--value:${data.progress}%"><strong>${data.progress}%</strong></div>
        <p>Progress toward the current evaluation profit target.</p>
      </section>
      <section class="dashboard-widget">
        <div class="stats-grid">
          <div class="stat-tile"><span class="tiny-label">Equity</span><strong>${data.equity}</strong></div>
          <div class="stat-tile"><span class="tiny-label">Daily DD</span><strong>${data.dailyDrawdown}</strong></div>
          <div class="stat-tile"><span class="tiny-label">Total DD</span><strong>${data.totalDrawdown}</strong></div>
        </div>
        <h3>Risk desk notes</h3>
        <ul class="list">${data.alerts.map(alert => `<li>${alert}</li>`).join("")}</ul>
      </section>
    `;
  } catch (error) {
    mount.innerHTML = `<div class="notice show">Dashboard API placeholder is offline.</div>`;
  }
}

function showNotice(message, selector = "#global-notice") {
  const notice = $(selector);
  if (!notice) return;
  notice.textContent = message;
  notice.classList.add("show");
}

function wireForms() {
  $$("form[data-endpoint]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      const endpoint = form.dataset.endpoint;

      try {
        const result = await api(endpoint, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        const message = result.message || "Demo request completed.";
        showNotice(message, form.dataset.notice || "#global-notice");
        form.reset();
      } catch (error) {
        showNotice("Backend placeholder could not process the form.", form.dataset.notice || "#global-notice");
      }
    });
  });
}

hydrateChallenges();
hydrateLeaderboard();
hydrateDashboard();
wireForms();
