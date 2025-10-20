import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { sendResponse } from '../utils/sendResponse.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
    // Parse cookies
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.session;

    if (!token) {
        return sendResponse(res, 401, { authenticated: false })
    }

    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    return sendResponse(res, 200, { authenticated: true, email: payload.email })

    } catch (err) {
        return sendResponse(res, 401, { authenticated: false, error: err })
    }
}