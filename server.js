const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

const challenges = [
  {
    id: "lagos-10k",
    name: "Lagos Starter",
    capital: "$10,000",
    price: "₦7,500",
    phase: "1-Step",
    split: "80%",
    target: "8%",
    drawdown: "6%",
    badge: "Most popular"
  },
  {
    id: "abuja-25k",
    name: "Abuja Growth",
    capital: "$25,000",
    price: "₦22,000",
    phase: "2-Step",
    split: "85%",
    target: "8% + 5%",
    drawdown: "8%",
    badge: "Balanced"
  },
  {
    id: "naija-50k",
    name: "Naija Pro",
    capital: "$50,000",
    price: "₦149,000",
    phase: "2-Step",
    split: "90%",
    target: "10% + 5%",
    drawdown: "10%",
    badge: "High ceiling"
  }
];

const leaderboard = [
  { rank: 1, name: "M. Adesina", city: "Lagos", profit: "$8,420", consistency: "94%" },
  { rank: 2, name: "D. Okafor", city: "Enugu", profit: "$6,980", consistency: "91%" },
  { rank: 3, name: "A. Bello", city: "Kano", profit: "$5,760", consistency: "89%" },
  { rank: 4, name: "T. Eze", city: "Port Harcourt", profit: "$4,890", consistency: "87%" }
];

const dashboard = {
  trader: "Demo Trader",
  account: "DAMIEN FONDS-1024",
  equity: "$12,860",
  phase: "Evaluation",
  progress: 62,
  dailyDrawdown: "2.1%",
  totalDrawdown: "4.7%",
  payoutQueue: "Next review window",
  alerts: [
    "Complete KYC to unlock payout review.",
    "You are 38% away from the phase target.",
    "Risk desk recommends keeping daily loss below 3%."
  ]
};

const applications = [];
const contacts = [];

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(requestUrl.pathname);

  if (pathname === "/") pathname = "/index.html";
  if (!path.extname(pathname)) pathname = `${pathname}.html`;

  const requestedPath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!requestedPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(requestedPath, (error, content) => {
    if (error) {
      fs.readFile(path.join(PUBLIC_DIR, "404.html"), (notFoundError, notFoundContent) => {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(notFoundError ? "Not found" : notFoundContent);
      });
      return;
    }

    const ext = path.extname(requestedPath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
}

async function routeApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, name: "Damien Fonds API", version: "demo" });
  }

  if (req.method === "GET" && url.pathname === "/api/challenges") {
    return sendJson(res, 200, { challenges });
  }

  if (req.method === "GET" && url.pathname === "/api/leaderboard") {
    return sendJson(res, 200, { leaderboard });
  }

  if (req.method === "GET" && url.pathname === "/api/dashboard") {
    return sendJson(res, 200, dashboard);
  }

  if (req.method === "POST" && url.pathname === "/api/applications") {
    try {
      const body = await readBody(req);
      const application = {
        id: `APP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        createdAt: new Date().toISOString(),
        status: "received",
        ...body
      };
      applications.push(application);
      return sendJson(res, 201, { message: "Demo application received", application });
    } catch (error) {
      return sendJson(res, 400, { error: "Invalid JSON body" });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    try {
      const body = await readBody(req);
      return sendJson(res, 200, {
        token: "demo-token",
        user: {
          name: body.email ? body.email.split("@")[0] : "demo",
          role: "trader",
          kycStatus: "pending"
        }
      });
    } catch (error) {
      return sendJson(res, 400, { error: "Invalid JSON body" });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/payments/initialize") {
    try {
      const body = await readBody(req);
      return sendJson(res, 200, {
        reference: `PAY-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
        provider: "Paystack/Flutterwave placeholder",
        amount: body.amount || "TBD",
        redirectUrl: "#payment-demo"
      });
    } catch (error) {
      return sendJson(res, 400, { error: "Invalid JSON body" });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/contact") {
    try {
      const body = await readBody(req);
      const message = { id: contacts.length + 1, createdAt: new Date().toISOString(), ...body };
      contacts.push(message);
      return sendJson(res, 201, { message: "Contact message saved for demo", contact: message });
    } catch (error) {
      return sendJson(res, 400, { error: "Invalid JSON body" });
    }
  }

  return sendJson(res, 404, { error: "API route not found" });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    routeApi(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`Damien Fonds demo running on http://localhost:${PORT}`);
});
