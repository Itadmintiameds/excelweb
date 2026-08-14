import { sendDailyReportEmail } from "@/lib/sendDailyEmail";

export async function GET() {
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