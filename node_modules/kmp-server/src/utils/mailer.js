import nodemailer from "nodemailer";

let transporterPromise;

const hasMailConfig = () =>
  Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM
  );

const createTransporter = async () => {
  if (!hasMailConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export const sendMail = async ({ to, subject, text, html }) => {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }

  const transporter = await transporterPromise;
  if (!transporter) {
    return { skipped: true };
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html
  });

  return { skipped: false };
};
