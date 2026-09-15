import cron from "node-cron";
import { sendDailyReportEmail } from "./sendDailyEmail";
import { nonWorkingDayReason } from "./holidays";

let started = false;

export function startDailyEmailScheduler() {
  if (started) return; // avoid double-scheduling on hot reloads
  started = true;

  // 7:00 PM IST. node-cron uses the server's local timezone by default, so we
  // pass the timezone explicitly to stay correct regardless of where this runs.
  // Kept in sync with the Vercel Cron schedule in vercel.json (30 13 * * 1-5 UTC).
  // Weekends/holidays are filtered in the callback rather than in the cron
  // expression, since the holiday calendar can't be expressed as a schedule.
  cron.schedule(
    "0 19 * * *",
    async () => {
      // Skip weekends and company holidays — see lib/holidays.js.
      const skipReason = nonWorkingDayReason();
      if (skipReason) {
        console.log(`Daily report email skipped — ${skipReason}`);
        return;
      }

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

  console.log("Daily email scheduler started — runs at 7:00 PM IST");
}