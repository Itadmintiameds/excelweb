export async function register() {
  // On Vercel the daily email is driven by Vercel Cron (see vercel.json), which
  // makes a GET to /api/send-daily-email. Serverless functions don't stay alive
  // between requests, so an in-process node-cron scheduler would never fire —
  // it's only used when running a long-lived server locally or self-hosted.
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.VERCEL) {
    const { startDailyEmailScheduler } = await import("./lib/scheduler");
    startDailyEmailScheduler();
  }
}
