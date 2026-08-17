import cron from "node-cron";
import { sendDailyReportEmail } from "./sendDailyEmail";

let started = false;

export function startDailyEmailScheduler() {
  if (started) return; // avoid double-scheduling on hot reloads
  started = true;

  // 6:00 PM IST. node-cron uses the server's local timezone by default, so we
  // pass the timezone explicitly to stay correct regardless of where this runs.
  // Kept in sync with the Vercel Cron schedule in vercel.json (30 12 * * * UTC).
  cron.schedule(
    "0 18 * * *",
    async () => {
      try {
        await sendDailyReportEmail();
        console.log("Daily report email sent at", new Date().toISOString());
      } catch (err) {
        console.error("Failed to send daily email:", err);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("Daily email scheduler started — runs at 6:00 PM IST");
}