import { parseJSONBody } from "../utils/parseJSONBody.js"
import { sanitizeInput } from "../utils/sanitizeInput.js"
import { sendResponse } from '../utils/sendResponse.js'
import { connectDB } from "../utils/connectDB.js"

import { ObjectId } from "bson"

export async function handlePut(req, res, collectionName) {
    try {
        
        const id = req.query?.id || new URLSearchParams(req.url?.split('?')[1]).get('id');
            
        let updateData
            if (req.body) {
                updateData = req.body;
            } else {
                updateData = await parseJSONBody(req)
            }
        const sanitizedData = sanitizeInput(updateData)

        const { client, db } = await connectDB()
        const collection = db.collection(collectionName)

        const result = await collection.updateOne(
            {_id: new ObjectId(id)},
            { $set: sanitizedData } 
        )

        await client.close()

        return sendResponse(res, 200, ({ success: true, modified: result.modifiedCount }))
        
    } catch (err) {
        console.log(`Error in routeHandlers, handlePut: ${err}`)
        return sendResponse(res, 500, ({error: err.message}))
    }
}