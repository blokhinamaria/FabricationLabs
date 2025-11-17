import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/sendResponse.js";
import { parseJSONBody } from "../utils/parseJSONBody.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendCancelNotice(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Method not allowed' })
  }

  try {
    // Handle both Vercel (req.body) and local server
    let data;
    if (req.body) {
      data = req.body.email;
    } else {
      data = await parseJSONBody(req);
    }

    const { email, html } = data;

    if (!email) {
      return sendResponse(res, 400, { error: 'Email is required to send the cancellation notice' })
    }

    if (!html) {
      return sendResponse(res, 400, { error: 'Email body is required to send the cancellation notice' })
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '360m' });
    let link = `${process.env.APP_URL}/api/verify?token=${token}`

    const finalHtml = html.replace('{{VERIFY_LINK}}', link);

    // Send email via Resend
    await resend.emails.send({
      from: 'UTampa Fabrication Labs <no-reply@mariablokhina.com>',
      to: email,
      subject: `Appointment Cancellation`,
      html: finalHtml,
    });
    return sendResponse(res, 200, { ok: true, message: 'Email notice sent' })
  } catch (err) {
    console.error('Error in request-link:', err);
    return sendResponse(res, 500, { error: 'Failed to send email' })
  }
}