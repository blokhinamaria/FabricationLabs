import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/sendResponse.js';
import { getDB } from '../config/database.js';

export async function checkAuth(req, res) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.session;
    console.log(cookies);

    if (!token) {
        return sendResponse(res, 200, {
            authenticated: false,
            reason: "missing",
            redirect: '/'
        });
    }
    
    try {
        //verify JWT
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256']
        });

        if (!verifiedToken?.email) {
            clearSessionCookie(res);
            return sendResponse(res, 200, {
                authenticated: false,
                reason: 'invalid',
                redirect: '/'
            });
        }

        const db = getDB()
        const collection = db.collection('users');

        let user = await collection.findOne({ email: verifiedToken.email })
        
        if (!user) {
            clearSessionCookie(res);
            return sendResponse(res, 200, {
                authenticated: false,
                reason: "no user found",
                redirect: '/'
            });
        }

        const redirect = (
            user.role === 'admin' || user.role === 'demo-admin'
                ) ? 
                '/admin-dashboard' 
                : 
                '/dashboard'

        return sendResponse(res, 200, {
                authenticated: true,
                redirect: redirect,
                role: user.role,
                user: {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                    assignedLabs: user.assignedLabs
                }
            });
    } catch (err) {

        if (err?.name === 'TokenExpiredError') {
            clearSessionCookie(res);
            return sendResponse(res, 200, {
                authenticated: false,
                reason: "expired",
                redirect: '/'
            });
        }

        if (err?.name === "JsonWebTokenError" || err?.name === "NotBeforeError") {
            clearSessionCookie(res);
            return sendResponse(res, 200, {
                authenticated: false,
                reason: "invalid",
                redirect: '/'
            });
        }

        console.error('Auth verification error:', err);
        return sendResponse(res, 200, {
                authenticated: false,
                reason: "unknown",
                redirect: '/'
            });
    }
}

export function clearSessionCookie(res) {
    res.setHeader('Set-Cookie', cookie.serialize('session', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 0 
    }))
}