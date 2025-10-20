import cookie from 'cookie';
import { sendResponse } from '../utils/sendResponse.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return sendResponse(res, 405, { error: 'Method not allowed' })
    }

    // Clear session cookie
    res.setHeader('Set-Cookie', cookie.serialize('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0 // Expire immediately
    }));

    return sendResponse(res, 200, { ok: true })

}