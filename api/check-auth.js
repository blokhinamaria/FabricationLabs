import { sendResponse } from '../utils/sendResponse.js';

import { authenticateUser } from '../utils/checkAuthentication.js';

export default async function handler(req, res) {
    const auth = await authenticateUser(req);
    console.log(auth);
    
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