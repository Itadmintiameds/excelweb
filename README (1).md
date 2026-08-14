# TiaMeds Daily Report Analyzer

A dashboard that displays daily work reports pulled live from a Google Sheet, with search, filters, sorting, and an automated daily email notification.

## What this does

- Reads daily report data (one tab per date) from a live Google Sheet
- Displays it as a searchable, filterable, sortable table in a Next.js dashboard
- Sends an automated daily email at 8:00 PM IST with a link to the dashboard

## Tech stack

- **Frontend/Backend**: Next.js (App Router)
- **Data source**: Google Sheets, fetched via a Google Apps Script Web App (no Google Cloud service account needed)
- **Email**: Nodemailer via Gmail SMTP
- **Scheduling**: node-cron, triggered on server startup via Next.js `instrumentation.js`

## How the data flow works

1. The Google Sheet has one tab per date (e.g. `03-Jul-2026`), each with columns: `Sl. No.`, `Date`, `Resource Name`, `Project Name`, `Task Details`, `Status`, `Resource Attendance`
2. A Google Apps Script (deployed as a Web App, attached to the sheet) reads all tabs and returns them as JSON at a `/exec` URL — see `lib/googleSheets.js`
3. `app/api/excel-data/route.js` fetches that JSON, parses/groups/sorts it per resource per day, and serves it to the frontend
4. `app/page.tsx` and the components in `components/` render the dashboard, with one "page" per date

## How the email flow works

1. `lib/sendDailyEmail.js` sends an email via Gmail SMTP (Nodemailer) containing just a link to the dashboard
2. `lib/scheduler.js` uses `node-cron` to trigger that send automatically once daily at 8:00 PM IST
3. `instrumentation.js` starts the scheduler when the Next.js server boots
4. `app/api/send-daily-email/route.js` is a manual trigger — visit it directly to send immediately, for testing

## Environment variables (`.env.local` — not committed to git)

```
APPS_SCRIPT_URL=          # Google Apps Script Web App /exec URL
SMTP_EMAIL=                # Gmail/Workspace address used to send
SMTP_APP_PASSWORD=         # Google App Password (not your regular password)
TEST_RECIPIENT_EMAIL=      # comma-separated list of recipient emails
DASHBOARD_URL=             # link included in the daily email — currently localhost
```

## Known issues / things to update

- **Dashboard link only works locally.** `DASHBOARD_URL` currently points to `http://localhost:3000`, so the link in the daily email only opens on the machine running the dev server. **Needs deployment to a public host** (Vercel, AWS, or existing TiaMeds infrastructure — pending decision) before it works for other recipients.
- **Email scheduler only runs while the dev server is running.** Once deployed, the email-sending should move to run from the hosted server (e.g. Vercel Cron) instead of depending on a local machine being on at 8 PM.
- **Avast Antivirus (Mail Shield) can block SMTP.** If you see a `"self-signed certificate in certificate chain"` error when sending email, check Avast → Protection → Core Shields → Mail Shield, and disable it (this was the root cause during development — Avast intercepts SMTP traffic for scanning, which breaks Nodemailer's TLS handshake with Gmail).
- **Non-Gmail recipients may not receive the email** — suspected spam filtering, since the sender is a personal Gmail account with a business-sounding display name. Ask recipients to check spam/junk. A more permanent fix would be sending through a verified domain (e.g. via Resend or Brevo with `tiameds.ai` domain verification), which needs DNS access from whoever manages the company domain.
- **Header whitespace matters.** The Google Sheet's column headers must exactly match what `route.js` expects (`Resource Name`, `Project Name`, etc.) — the Apps Script normalizes whitespace automatically, so this should self-correct, but worth knowing if data ever looks misgrouped.
- **Non-date tabs are automatically skipped.** Any sheet tab whose name doesn't parse as a date (e.g. a leftover "Sheet1") is filtered out and ignored.

## Setup for a new environment

1. `npm install`
2. Create `.env.local` with the variables listed above
3. Make sure the Google Apps Script is deployed (Deploy → Manage deployments in the Apps Script editor attached to the sheet) and `APPS_SCRIPT_URL` matches its `/exec` URL
4. `npm run dev`
