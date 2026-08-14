import nodemailer from "nodemailer";

const RECIPIENTS = process.env.TEST_RECIPIENT_EMAIL
  ? process.env.TEST_RECIPIENT_EMAIL.split(",").map((email) => email.trim())
  : [];

export async function sendDailyReportEmail() {
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