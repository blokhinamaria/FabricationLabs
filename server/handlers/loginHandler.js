import url from 'url'
import cookie from 'cookie';
import { requestLink, verifyEmailLink } from '../controllers/loginControllers.js'
import { clearSessionCookie } from '../middleware/checkAuth.js';

export async function handleLogin(req, res) {

    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.session;

    if (token) {
        clearSessionCookie(res);
    }

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    if (path === '/api/login/request-link') {
        return await requestLink(req, res);
    }

    if (path.startsWith('/api/login/verify')) {
        return await verifyEmailLink(req, res);
    }
}
