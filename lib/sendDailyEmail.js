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
  "amitkhosmani@tiameds.ai",
  "dev@tiameds.ai",
  "harshithgowda@tiameds.ai",
  "ashikjoshi@tiameds.ai",
  "chiranjeevisr@tiameds.ai",
  "dipakdagadu@tiameds.ai",
  "mosesjakkam@tiameds.ai",
  "nisargagiri@tiameds.ai",
  "roshnimohan@tiameds.ai",
  "somilm@tiameds.ai",
  "gowtham@tiameds.ai",

];
	
// Abhinandan S Rao <abhinandan@tiameds.ai>,
// Senior Vice President <svp@sudhanandgroup.com>,
// Amitkumar Hosmani <amitkhosmani@tiameds.ai>,
// Sunny kumar <dev@tiameds.ai>,
// Harshith Gowda <harshithgowda@tiameds.ai>,
// Ashik Joshi <  ashikjoshi@tiameds.ai>,
// Basavaraju NN <basavarajunn@tiameds.ai>,
// Chiranjeevi Santhosh Raju <chiranjeevisr@tiameds.ai>,
// Ade Dipak Dagadu <dipakdagadu@tiameds.ai>,
// Moses K Jakkam <mosesjakkam@tiameds.ai>,
// Nisarga Giri <nisargagiri@tiameds.ai>,
// Prabhas K S <prabhas@tiameds.ai>,
// Rajani IR <rajani@tiameds.ai>,
// Roshni Mohan <roshnimohan@tiameds.ai>,
// Shreeraksha Rao <shreeraksha@tiameds.ai>,
// somil merugawar <somilm@tiameds.ai>,
// S J Yasshraj Vijayan <yasshrajv@tiameds.ai>,
// Gowtham Thangaraj <gowtham@tiameds.ai

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
    from: `"TiaMeds Daily Report " <${process.env.SMTP_EMAIL}>`,
    to: RECIPIENTS.join(", "),
    subject: `Daily Report Dashboard — ${today}`,
    html: `
      <p>Here's today's report dashboard:</p>
      <p><a href="${dashboardUrl}">${dashboardUrl}</a></p>
    `,
  });
}