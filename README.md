# Damien Fonds Demo

Damien Fonds is a multi-page funding-pipeline website concept for Nigerian traders. The brand fuses **Mayana** and **Damien** into **DAMIEN FONDS**, with a premium fintech look for presentation/demo use.

## Pages

- `Home` (`/`) — marketing landing page, brand story, demo journey, dashboard preview.
- `Challenges` (`/challenges`) — funded account plans, payment placeholder, trader application form.
- `Leaderboard` (`/leaderboard`) — Nigerian trader ranking table.
- `Dashboard` (`/dashboard`) — trader room preview with progress, equity, drawdown, and alerts.
- `Login` (`/auth`) — authentication placeholder form.
- `About` (`/about`) — brand explanation and contact form.

## Backend Placeholder Map

| Frontend area | Current endpoint | Future backend connection |
| --- | --- | --- |
| Challenge cards | `GET /api/challenges` | Real challenge/product database with price, rules, capital size, and availability. |
| “Start challenge” button | `POST /api/payments/initialize` | Paystack, Flutterwave, Stripe, or bank-transfer checkout initialization. |
| Application form | `POST /api/applications` | User onboarding, KYC provider, CRM, admin review queue, and funded-account provisioning. |
| Login form | `POST /api/auth/login` | Secure auth service with password hashing, sessions/JWT, MFA, password reset, and role permissions. |
| Leaderboard table | `GET /api/leaderboard` | Broker/trading-platform performance data, verified profit, risk score, and public opt-in settings. |
| Dashboard widgets | `GET /api/dashboard` | Trader account metrics, evaluation phase, risk engine, drawdown monitor, payout status, KYC status. |
| Contact form | `POST /api/contact` | Support inbox, CRM, email automation, Slack/Discord alert, or ticketing system. |
| API health check | `GET /api/health` | Monitoring, uptime checks, deployment diagnostics. |

## Suggested Production Backend Models

- `users`: name, email, password hash, KYC status, role, city, phone.
- `challenges`: name, capital, naira price, profit target, drawdown rules, phase count, split.
- `applications`: user ID, challenge ID, experience, status, reviewer notes.
- `payments`: user ID, challenge ID, provider reference, amount, currency, status.
- `trading_accounts`: user ID, broker account ID, phase, equity, balance, target progress.
- `risk_events`: account ID, daily drawdown, total drawdown, rule violations.
- `payouts`: account ID, amount, status, review date, transfer reference.
- `contacts`: name, email, message, status.

## Run Locally

```bash
npm start
```

The demo server uses Node’s built-in HTTP module and serves the frontend plus placeholder API routes.

## Notes

- This is a demonstration build; it intentionally avoids real money movement, real authentication, and real broker integration.
- Replace in-memory arrays inside `server.js` with a database before production.
- Add proper validation, rate limiting, CSRF protection, logging, and audit trails before handling real user data or payments.
