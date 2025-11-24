import { parseJSONBody } from "../utils/parseJSONBody.js"
import { sanitizeInput } from "../utils/sanitizeInput.js"
import { sendResponse } from '../utils/sendResponse.js'
import { connectDB } from "../utils/connectDB.js"

export async function handlePost(req, res, collectionName) {

    try {
        let parsedData 
        if (req.body) {
            parsedData = req.body
        } else {
            parsedData = await parseJSONBody(req)
        }
        const sanitizedData = sanitizeInput(parsedData)

        const { client, db } = await connectDB();
        const collection = db.collection(collectionName);
            
        const result = await collection.insertOne({
                ...sanitizedData,
                createdAt: new Date()
        });

        await client.close();

        sendResponse(res, 200, ({ success: true, appointmentId: result.insertedId, message: `New entry added to ${collectionName}` }))
        console.log(result)
        
    } catch (err) {
        console.log(`Eroor in routeHandlers, handlePost: ${err}`)
        return sendResponse(res, 500, ({ error: err.message }))
    }
}