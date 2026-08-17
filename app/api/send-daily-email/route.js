import { sendDailyReportEmail } from "@/lib/sendDailyEmail";

// Sending over SMTP can take a while; the Vercel default is 10s.
// 60s is the ceiling on the Hobby plan.
export const maxDuration = 60;

export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;

  // Vercel Cron automatically sends `Authorization: Bearer $CRON_SECRET`
  // when CRON_SECRET is set on the project. Locally there's no secret and no
  // cron, so allow manual triggering in development only.
  if (process.env.NODE_ENV === "production") {
    const authHeader = request.headers.get("authorization");

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    await sendDailyReportEmail();
    return Response.json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Manual "Send Email Now" button on the dashboard. The dashboard is public, so
// this is gated behind a shared passcode rather than the cron secret (which must
// never reach the browser).
export async function POST(request) {
  const passcode = process.env.MANUAL_SEND_PASSCODE;

  // Without a configured passcode this would be an open mail trigger — refuse
  // rather than fall back to sending.
  if (!passcode) {
    return Response.json(
      { success: false, error: "Manual sending is not configured." },
      { status: 503 }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    // Malformed or empty body — falls through to the passcode check below.
  }

  if (body?.passcode !== passcode) {
    return Response.json(
      { success: false, error: "Incorrect passcode." },
      { status: 401 }
    );
  }

  try {
    await sendDailyReportEmail();
    return Response.json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
