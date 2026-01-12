import { sendResponse } from '../utils/sendResponse.js'
import { connectDB } from "../utils/connectDB.js"

import { ObjectId } from "bson"

import { authenticateUser, isDemoUser } from '../utils/checkAuthentication.js';

export async function handleDelete(req, res, collectionName) {

    const auth = await authenticateUser(req);
        if (!auth.authenticated) {
            return sendResponse(res, 401, { error: auth.error });
        }
    
        if (auth.permissions === 'demo-admin') {
            return sendResponse(res, 403, { error: 'Insufficient permissions' });
        }

    try {
        const id = req.query?.id || new URLSearchParams(req.url?.split('?')[1]).get('id');
        const { client, db } = await connectDB();
        let collection;
        if (isDemoUser(auth.user.email)) {
                collection = db.collection(`demo-${collectionName}`);
            } else {
                collection = db.collection(collectionName);
            }

        const result = await collection.deleteOne({ _id: new ObjectId(id)})

        await client.close()

        sendResponse(res, 200, ({ success: true, deleted: result.deletedCount }))

    } catch (err) {
        console.log(`Error in routeHandlers, handleDelete: ${err}`)
        return sendResponse(res, 500, ({ error: err.message }))
    }
}