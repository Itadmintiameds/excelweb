import cron from "node-cron";
import { sendDailyReportEmail } from "./sendDailyEmail";

let started = false;

export function startDailyEmailScheduler() {
  if (started) return; // avoid double-scheduling on hot reloads
  started = true;

  // 8:00 PM IST = 2:30 PM UTC. Since node-cron uses the server's local
  // timezone by default, we pass timezone explicitly to stay correct
  // regardless of where this eventually runs.
  cron.schedule(
    "0 20 * * *",
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

  console.log("Daily email scheduler started — runs at 8:00 PM IST");
}