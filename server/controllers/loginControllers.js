import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { ReturnDocument } from 'mongodb';
import { getDB } from '../config/database.js';
import { sendResponse } from '../utils/sendResponse.js';
import { parseJSONBody } from '../utils/parseJSONBody.js';
import { sendMagicLink } from '../utils/authentication/sendMagicLink.js';
import { createOrGetUser } from '../utils/authentication/createOrGetUser.js';

export async function requestLink(req, res) {
    if (req.method !== 'POST') {
        return sendResponse(res, 405, { error: 'Method not allowed' })
    }

    try {
        const data = await parseJSONBody(req);
        const email = data.email;
        const password = data.password;

        if (!email || !email.includes('@')) {
            return sendResponse(res, 400, { error: 'Invalid email address' })
        }

        if (password) {
            const demoRegex = /^demo-(student|faculty|admin)@fabricationlabs\.com$/
            const demoTestResult = demoRegex.test(email)
            if (demoTestResult) {
                const db = await getDB();
                const collection = db.collection('users');
                const existingUser = await collection.findOne({ email });
                if (existingUser) {
                    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
                if (!isPasswordValid) {
                    return sendResponse(res, 401, { error: 'Invalid credentials' });
                }
                // Redirect to verify for demo users
                const baseUrl = process.env.CLIENT_URL;  
                const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '30m' });
                const verifyURL = `${baseUrl}/api/login/verify?token=${token}`;
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
        const orgEmailRegex = /^[A-Za-z0-9._%+-]+@(ut\.edu|spartans\.ut\.edu)$/;
        const orgEmailTestResult = orgEmailRegex.test(email);
        
        if (!orgEmailTestResult) {
            console.error('Invalid Utampa email')
            return sendResponse(res, 400, { error: 'UTampa Email is required' })
        }

            // Create JWT token for magic link
        const token = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: '30m' });

        const result = await sendMagicLink(email, token);
        return sendResponse(res, 200, result);

    } catch (error) {
        console.error('Request link error:', error);
        return sendResponse(res, 500, { error: 'Failed to send magic link' })
    }
}

export async function verifyEmailLink(req, res) {
    if (req.method !== 'GET') {
        return sendResponse(res, 405, { error: 'Method not allowed' })
    }

    const baseUrl = process.env.CLIENT_URL;  
    if (!baseUrl) {
        return sendResponse(res, 500, { error: "Server misconfigured: CLIENT_URL missing" });
        }
    
    try {
        const token = new URLSearchParams(req.url?.split('?')[1]).get('token');
        
        if (!token) {
            return sendResponse(res, 400, { error: 'Token required' })
        }

        if (!process.env.JWT_SECRET) {
            return sendResponse(res, 400, { error: 'JWT_SECRET is missing' })
        }

        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        let user = await createOrGetUser(verifiedToken.email)
        
        const sessionToken = jwt.sign(
            {
                sub: String(user._id),
                email: user.email,
            }, process.env.JWT_SECRET, { expiresIn: '30m' });
    
        // Set session cookie
        res.setHeader('Set-Cookie', cookie.serialize('session', sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 60 * 30  
        }));

        const dashboard = (
            user.role === 'admin' || user.role === 'demo-admin'
                ) ? 
                '/admin-dashboard' 
                : 
                '/dashboard'
    
        res.writeHead(302, { Location: `${baseUrl}${dashboard}` });
        return res.end();

    } catch (err) {
        console.error('Verification error:', err);
        res.writeHead(302, { Location: `${baseUrl}?error=invalid-link` });
        return res.end();
    }
}