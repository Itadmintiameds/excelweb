import nodemailer from "nodemailer";

// The daily report is sent to exactly these addresses. This list is the single
// source of truth — TEST_RECIPIENT_EMAIL still exists in .env but is no longer
// read, so editing it has no effect on who receives the mail.
const RECIPIENTS = [
  "shreeraksha@tiameds.ai",
  "prabhas@tiameds.ai",
  "rajani@tiameds.ai",
  "basavarajunn@tiameds.ai",
  "yasshrajv@tiameds.ai",
  "archanajagadish@tiameds.ai",
  "amitkhosmani@tiameds.ai"
];

export async function sendDailyReportEmail() {
  if (RECIPIENTS.length === 0) {
    throw new Error("No recipients configured in RECIPIENTS.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_APP_PASSWORD,
    },
  });

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const dashboardUrl = process.env.DASHBOARD_URL;

  await transporter.sendMail({
    from: `"TiaMeds Report Analyzer" <${process.env.SMTP_EMAIL}>`,
    to: RECIPIENTS.join(", "),
    subject: `Daily Report Dashboard — ${today}`,
    html: `
      <p>Here's today's report dashboard:</p>
      <p><a href="${dashboardUrl}">${dashboardUrl}</a></p>
    `,
  });
}