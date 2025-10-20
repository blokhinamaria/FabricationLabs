import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { sendResponse } from '../utils/sendResponse.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendResponse(res, 405, { error: 'Method not allowed' })
  }

  try {
    // Extract token from query params
    const token = req.query?.token || new URLSearchParams(req.url?.split('?')[1]).get('token');
    
    if (!token) {
      // Redirect to home if no token
      res.writeHead(302, { Location: process.env.APP_URL || '/' });
      return res.end();
    }

    // Verify the token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Verified user:', payload.email);

    // Set session cookie
    res.setHeader('Set-Cookie', cookie.serialize('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    }));

    // Redirect to dashboard
    res.writeHead(302, { Location: `${process.env.APP_URL}/dashboard` });
    return res.end();
  } catch (err) {
    console.error('Verification error:', err);
    // Redirect to home with error (you can show an error message in React)
    res.writeHead(302, { Location: `${process.env.APP_URL}?error=invalid-link` });
    return res.end();
  }
}