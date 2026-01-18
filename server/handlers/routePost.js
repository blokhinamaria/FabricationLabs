import { parseJSONBody } from "../utils/parseJSONBody.js"
import { sanitizeInput } from "../utils/sanitizeInput.js"
import { sendResponse } from '../utils/sendResponse.js'
import { isDemoUser } from '../utils/checkDemoUsers.js';
import { getDB } from "../config/database.js";

export async function handlePost(req, res, collectionName) {
        // Verify the user's session
        const auth = await authenticateUser(req);
        if (!auth.authenticated) {
            return sendResponse(res, 401, { error: auth.error });
        }

        if (auth.permissions === 'demo-admin') {
            return sendResponse(res, 403, { error: 'Insufficient permissions' });
        }

        try {

            let parsedData 
            if (req.body) {
                parsedData = req.body
            } else {
                parsedData = await parseJSONBody(req)
            }
            const sanitizedData = sanitizeInput(parsedData)

            const db = await getDB()
            let collection = db.collection(collectionName);
                if (isDemoUser(auth.user.email)) {
                    collection = db.collection(`demo-${collectionName}`);
                } else {
                    collection = db.collection(collectionName);
                }

            const result = await collection.insertOne({
                    ...sanitizedData,
                    createdAt: new Date()
            });

            sendResponse(res, 200, ({ success: true, appointmentId: result.insertedId, message: `New entry added to ${collectionName}` }))
            console.log(result)
        
    } catch (err) {
        console.log(`Eroor in routeHandlers, handlePost: ${err}`)
        return sendResponse(res, 500, ({ error: err.message }))
    }
}