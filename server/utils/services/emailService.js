import { Resend } from "resend";

export async function sendEmail({to, subject, html}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.RESEND_FROM;
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");
  if (!FROM) throw new Error("RESEND_FROM missing");

  if (!to || !subject || !html) throw new Error("Email, Subject and Body Required");
  try {
    await resend.emails.send({
      from: `UTampa Fabrication Labs ${FROM}`,
      to: to,
      subject: subject,
      html: html,
    });
  } catch (error) {
    throw new Error(`Resend error: ${error}`)
  }
}