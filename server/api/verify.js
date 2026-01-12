import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { sendResponse } from '../utils/sendResponse.js';
import { connectDB } from '../utils/connectDB.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendResponse(res, 405, { error: 'Method not allowed' })
  }

  const baseUrl = process.env.APP_URL || `https://${req.headers.host}`;

  try {
    // Extract token from query params
    const token = req.query?.token || new URLSearchParams(req.url?.split('?')[1]).get('token');
    
    if (!token) {
      // For Vercel, use redirect() or status + setHeader
      if (typeof res.redirect === 'function') {
        return res.redirect(307, baseUrl || '/');
      }
      res.writeHead(307, { Location: baseUrl || '/' });
      return res.end();
    }

    // Verify the token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Verified user:', payload.email);

    //Check if the user exist in the database
    const { client, db } = await connectDB()
    const collection = db.collection('users');
    
    let user = await collection.findOne( { email: payload.email })
    
    if (!user) {

      let role = 'student';
    if (payload.email.endsWith('@spartan.ut.edu')) {
          role = 'student'
        } else if (payload.email.endsWith('@ut.edu')) {
          role = 'faculty'
        }
        const result = await collection.insertOne({
          email: payload.email,
          role: role,
          fullName: null,
          classes: [],
          createdAt: new Date(),
          isActive: true,
        });
              
              // Fetch the newly created user
      user = await db.collection('users').findOne({
        _id: result.insertedId
      });
      console.log('Created new user:', user.email);
    }
    
    await client.close()

    const sessionToken = jwt.sign({ email: payload.email }, process.env.JWT_SECRET, { expiresIn: '30m' });

    // Set session cookie
    res.setHeader('Set-Cookie', cookie.serialize('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    }));

    // Redirect to dashboard
    const dashboardUrl = `${baseUrl}/dashboard`;
    if (typeof res.redirect === 'function') {
      return res.redirect(307, dashboardUrl);
    }
    res.writeHead(307, { Location: dashboardUrl });
    return res.end();
  } catch (err) {
    console.error('Verification error:', err);
    // Redirect to home with error (you can show an error message in React)
    res.writeHead(302, { Location: `${baseUrl}?error=invalid-link` });
    return res.end();
  }
}
