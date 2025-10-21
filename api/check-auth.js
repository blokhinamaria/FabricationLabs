import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { sendResponse } from '../utils/sendResponse.js';

export default async function handler(req, res) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.session;
    
    if (!token) {
        return sendResponse(res, 401, { authenticated: false });
    }
    
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return sendResponse(res, 200, { 
        authenticated: true, 
        user: { email: payload.email }
        });
    } catch (err) {
        return sendResponse(res, 401, { authenticated: false });
    }
}