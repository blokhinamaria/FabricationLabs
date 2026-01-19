import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { ObjectId } from "bson"
import { sendResponse } from '../utils/sendResponse.js';
import { getDB } from '../config/database.js';
import { clearSessionCookie } from './checkAuth.js';

export async function requireAuth(req, res) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.session;

    if (!token) {
        sendResponse(res, 401, {error: 'Login Required'});
        return false
    }
    
    try {
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256']
        });
        console.log(`Verified Token:`)
        console.log(verifiedToken)

        if (!verifiedToken?.email || !verifiedToken?.sub) {
            sendResponse(res, 401, {error: 'Login Required'});
            return false;
        }

        const db = getDB()
        const collection = db.collection('users');

        let user = await collection.findOne({ _id: new ObjectId(verifiedToken.sub)})
        
        if (!user) {
            clearSessionCookie(res);
            sendResponse(res, 401, { error: 'User not found' });
            return false;
        }

        req.user = {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                    assignedLabs: user.assignedLabs
                }
        return true;

    } catch (error) {
        if ( error?.name === "TokenExpiredError" || error?.name === "JsonWebTokenError" || error?.name === "NotBeforeError") {
            clearSessionCookie(res);
            }
            sendResponse(res, 401, {error: "Login Required" });
            return false;
        }
}