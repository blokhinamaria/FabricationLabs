import { connectDB } from "./connectDB.js";
import { sendResponse } from "./sendResponse.js";

export async function getBlockoutDates(req, res) {
    try {
        const {client, db} = await connectDB();
        const collection = db.collection('blockoutDates');
        const blockouts = await collection.find({}).toArray();
        await client.close()
        if (blockouts) {
            return sendResponse(res, 200, ({ success: true, blockouts: blockouts }))
        } else {
            return sendResponse(res, 200, ({ success: true, blockouts: [] }))
        }
    } catch (err) {
        console.log(`Error in getBlockoutDates: ${err}`)
        return sendResponse(res, 500, ({ error: err.message }))
    }
}