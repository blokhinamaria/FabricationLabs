import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { sendResponse } from '../utils/sendResponse.js';
import { connectDB } from '../utils/connectDB.js';

export default async function handler(req, res) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.session;
    
    if (!token) {
        return sendResponse(res, 401, { authenticated: false });
    }
    
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        //Check if the user exist in the database
        const { client, db } = await connectDB()
        const collection = db.collection('users');

        let user = await collection.findOne( { email: payload.email })

        let role = 'student';
        if (user.email.endsWith('@spartan.ut.edu')) {
            role = 'student'
        } else if (user.email.endsWith('@ut.edu')) {
            role = 'faculty'
        }

        if (!user) {
            user = await collection.insertOne({
                email: payload.email,
                role: role,
                firstName: null,
                lastName: null,
                classes: [],
                createdAt: new Date(),
                isActive: true
        });
        console.log('Created new user:', user.email);
        }

        await client.close()

        return sendResponse(res, 200, { 
            authenticated: true, 
            user: {...user}
        });
    } catch (err) {
        return sendResponse(res, 401, { authenticated: false, error: err });
    }
}