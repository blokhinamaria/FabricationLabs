import { sendResponse } from '../utils/sendResponse.js';

import { authenticateUser } from '../utils/checkDemoUsers.js';

export default async function handler(req, res) {
    const auth = await authenticateUser(req);
    
    if (!auth.authenticated) {
        return sendResponse(res, 401, { authenticated: false });
    }

    const redirect = (auth.permissions === 'admin' || auth.permissions === 'demo-admin') ? '/admin-dashboard' : '/dashboard'
    
    return sendResponse(res, 200, { 
        authenticated: true, 
        redirect: redirect,
        user: auth.user 
    });
}