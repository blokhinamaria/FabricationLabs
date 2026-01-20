import cookie from 'cookie';
import { sendResponse } from '../utils/sendResponse.js';

export async function handleLogout(res) {

    try {
    // Clear the session cookie
        res.setHeader('Set-Cookie', cookie.serialize('session', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 0
        }));

    return sendResponse(res, 200, { success: true, message: 'Logged out successfully' });
    
    } catch (err) {
        console.error('Logout error:', err);
        return sendResponse(res, 500, { error: 'Logout failed' });
    }
}