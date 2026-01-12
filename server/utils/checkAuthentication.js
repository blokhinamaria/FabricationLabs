import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { connectDB } from './connectDB.js';

export async function authenticateUser(req) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.session;

    if (!token) {
        return { authenticated: false, error: 'No token provided' };
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const { client, db } = await connectDB()
        const collection = db.collection('users');

        let user = await collection.findOne( { email: payload.email })
        
        if (!user) {
            await client.close();
            return { authenticated: false, error: 'User not found' };
        }

        await client.close()

        return { authenticated: true, permissions: user.role, user };
    } catch (err) {
        return { authenticated: false, error: err };
    }
}

export function isDemoUser(email) {
    const demoRegex = /^demo-(student|faculty|admin)@fabricationlabs\.com$/;
    return demoRegex.test(email);
}