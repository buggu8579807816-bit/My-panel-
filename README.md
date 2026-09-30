# PRASHANT SMS PANEL — Deployable Version

This is a real web application. The browser talks to the Node/Express backend,
and the backend sends SMS through Twilio Programmable Messaging.

## Requirements
- Node.js 18+
- A Twilio account
- An SMS-capable Twilio sender
- Hosting that supports Node.js

## Setup
1. Upload/extract the project.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Put your Twilio credentials in `.env`.
5. Set a strong `PANEL_KEY`.
6. Run `npm start`.
7. Open `http://YOUR-HOST:3000`.

For a production HTTPS domain, put the Node app behind your hosting provider's
HTTPS/reverse proxy.

## Provider configuration
TWILIO_FROM must be a sender that your Twilio account is allowed to use.
Recipients are expected in E.164 format, for example +919876543210.

Trial accounts can have recipient verification and other restrictions.

## Security
- Credentials stay server-side in `.env`.
- `.env` is excluded by `.gitignore`.
- Helmet adds common HTTP security headers.
- The send endpoint is rate-limited.
- The panel requires PANEL_KEY before sending.

Use the service only for messages to people you are authorized to contact.
Do not use it for spam, phishing, impersonation, or unsolicited bulk messaging.
