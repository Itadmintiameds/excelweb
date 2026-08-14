export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startDailyEmailScheduler } = await import("./lib/scheduler");
    startDailyEmailScheduler();
  }
}