import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/sendResponse.js";
import { parseJSONBody } from "../utils/parseJSONBody.js";

import bcrypt from "bcryptjs";
import { getDB } from "../config/database.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Method not allowed' })
  }

  try {
    // Handle both Vercel (req.body) and local server
    let email;
    let password;
    if (req.body) {
      email = req.body.email;
      password = req.body.password;
    } else {
      const data = await parseJSONBody(req);
      email = data.email;
      password = data.password;
    }

    if (!email) {
      return sendResponse(res, 400, { error: 'Email is required' })
    }

    if (password) {
      const demoRegex = /^demo-(student|faculty|admin)@fabricationlabs\.com$/
      const result = demoRegex.test(email)
      if (result) {
        const db = await getDB();
        const collection = db.collection('users');
        const existingUser = await collection.findOne({ email });
        if (existingUser) {
          const isPasswordValid = await bcrypt.compare(password, existingUser.password);
          if (!isPasswordValid) {
            return sendResponse(res, 401, { error: 'Invalid credentials' });
          }
        // Redirect to verify for demo users
        const baseUrl = process.env.APP_URL || `https://${req.headers.host}`;
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '30m' });
        const verifyURL = `${baseUrl}/api/verify?token=${token}`;
        // if (typeof res.redirect === 'function') {
        //   return res.redirect(302, verifyURL);
        // }
        // res.writeHead(200, { 'Content-Type': 'application/json' });
        // return res.end(JSON.stringify({ 
        //   success: true, 
        //   redirect: verifyURL 
        // }));
        return sendResponse(res, 200, { 
          success: true, 
          redirect: verifyURL 
        });
      }
      }
    }
    // Check for valid UTampa email
    const regex = /^[A-Za-z0-9._%+-]+@(ut\.edu|spartans\.ut\.edu)$/;
    const result = regex.test(email);
        if(!result) {
          console.log('Invalid Utampa email')
            return sendResponse(res, 400, { error: 'UTampa Email is required' })
        }

    // Create JWT token for magic link
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '30m' });
    const link = `${process.env.CLIENT_URL}/api/verify?token=${token}`;

    // Send email via Resend
    await resend.emails.send({
      from: 'UTampa Fabrication Labs <no-reply@mariablokhina.com>',
      to: email,
      subject: "Sign in to UTampa Fabrication Labs",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 16px 0;">Hi there,</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">Click the button below to verify your UT email and sign in:</p>
          
          <div style="margin: 32px 0;">
            <a href="${link}" target="_self" style="display: inline-block; background: #6dff60; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 16px;">Verify Email</a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0 0 12px 0;">This link expires in 10 minutes.</p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">If you didn't request this, you can ignore this email.</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0;">– The FabLab Team</p>
        </div>
      `,
    });
    return sendResponse(res, 200, { ok: true, message: 'Check your email for the sign-in link' })
  } catch (err) {
    console.error('Error in request-link:', err);
    return sendResponse(res, 500, { error: 'Failed to send email' })
  }
}