import { sendResponse } from '../utils/sendResponse.js'
import { connectDB } from "../utils/connectDB.js"

import { ObjectId } from "bson"

export async function handleDelete(req, res, collectionName) {
    try {
        const id = req.query?.id || new URLSearchParams(req.url?.split('?')[1]).get('id');

        const { client, db} = await connectDB()
        const collection = db.collection(collectionName)

        const result = await collection.deleteOne({ _id: new ObjectId(id)})

        await client.close()

        sendResponse(res, 200, ({ success: true, deleted: result.deletedCount }))

    } catch (err) {
        console.log(`Error in routeHandlers, handleDelete: ${err}`)
        return sendResponse(res, 500, ({ error: err.message }))
    }
}