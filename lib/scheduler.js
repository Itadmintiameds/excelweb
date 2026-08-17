import cron from "node-cron";
import { sendDailyReportEmail } from "./sendDailyEmail";

let started = false;

export function startDailyEmailScheduler() {
  if (started) return; // avoid double-scheduling on hot reloads
  started = true;

  // node-cron uses the server's local timezone by default, so we pass the
  // timezone explicitly to stay correct regardless of where this runs.
  // Kept in sync with the Vercel Cron schedule in vercel.json.
  //
  // TESTING: temporarily running at 11:00 AM IST instead of the intended
  // 6:00 PM IST. To restore, swap the schedule below back to "0 18 * * *"
  // and set vercel.json back to "30 12 * * *".
  //   "0 18 * * *"   // 6:00 PM IST — production schedule
  cron.schedule(
    "0 11 * * *",
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

  console.log("Daily email scheduler started — runs at 11:00 AM IST (testing)");
}