require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const twilio = require("twilio");

const app = express();

const required = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_FROM",
  "PANEL_KEY"
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error("Missing environment variables:", missing.join(", "));
  process.exit(1);
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "20kb" }));
app.use(express.static("public"));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false
});

function authorized(req) {
  return req.get("x-panel-key") === process.env.PANEL_KEY;
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "sms-panel" });
});

app.post("/api/send-sms", limiter, async (req, res) => {
  if (!authorized(req)) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized."
    });
  }

  const { to, message } = req.body || {};

  if (typeof to !== "string" || typeof message !== "string") {
    return res.status(400).json({
      success: false,
      error: "Number and message are required."
    });
  }

  const recipient = to.trim();
  const body = message.trim();

  if (!/^\+[1-9]\d{7,14}$/.test(recipient)) {
    return res.status(400).json({
      success: false,
      error: "Use an international E.164 number, e.g. +919876543210."
    });
  }

  if (!body || body.length > 1600) {
    return res.status(400).json({
      success: false,
      error: "Message must be between 1 and 1600 characters."
    });
  }

  try {
    const sms = await client.messages.create({
      body,
      from: process.env.TWILIO_FROM,
      to: recipient
    });

    return res.json({
      success: true,
      sid: sms.sid,
      status: sms.status
    });
  } catch (err) {
    console.error("Twilio error:", err.code || err.message);

    return res.status(502).json({
      success: false,
      error: "SMS provider rejected the request. Check your provider account, sender and recipient settings."
    });
  }
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`PRASHANT SMS PANEL listening on port ${port}`);
});
