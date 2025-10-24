import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/sendResponse.js";
import { parseJSONBody } from "../utils/parseJSONBody.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Method not allowed' })
  }

  try {
    // Handle both Vercel (req.body) and local server
    let email;
    if (req.body) {
      email = req.body.email;
    } else {
      const data = await parseJSONBody(req)
      email = data.email
    }

    if (!email) {
      return sendResponse(res, 400, { error: 'Email is required' })
    }

    // Create JWT token for magic link
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '360m' });
    const link = `${process.env.APP_URL}/api/verify?token=${token}`;

    // Send email via Resend
    await resend.emails.send({
      from: 'FabLab <no-reply@sadaveena.com>',
      to: email,
      subject: "Sign in to University of Tampa FabLab",
      html: `
        <p>Hi there,</p>
        <p>Click the button below to verify your UT email and sign in:</p>
        <a href="${link}" target="_self" style="background:#900;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Verify Email</a>
        <p>This link expires in 10 minutes.</p>
        <p>If you didn't request this, you can ignore this email.</p>
        <p>– The FabLab Team</p>
      `,
    });
    return sendResponse(res, 200, { ok: true, message: 'Check your email for the sign-in link' })
  } catch (err) {
    console.error('Error in request-link:', err);
    return sendResponse(res, 500, { error: 'Failed to send email' })
  }
}