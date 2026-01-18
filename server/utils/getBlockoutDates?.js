import { getDB } from "../config/database.js";
import { sendResponse } from "./sendResponse.js";

export async function getBlockoutDates(req, res) {
    try {
        const db = await getDB();
        const collection = db.collection('blockoutDates');
        const blockouts = await collection.find({}).toArray();
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