import url from 'url'
import cookie from 'cookie';
import { demoLogin, requestLink, verifyEmailLink } from '../controllers/loginControllers.js'
import { clearSessionCookie } from '../middleware/checkAuth.js';

export async function handleLogin(req, res, path) {

    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.session;

    if (token) {
        clearSessionCookie(res);
    }

    if (path === '/api/login/demo') {
        return await demoLogin(req, res);
    }

    if (path === '/api/login/request-link') {
        return await requestLink(req, res);
    }

    if (path.startsWith('/api/login/verify')) {
        return await verifyEmailLink(req, res);
    }
}
