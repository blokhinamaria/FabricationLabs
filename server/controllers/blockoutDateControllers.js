import { sendResponse } from '../utils/sendResponse.js'
import { isDemoUser } from '../utils/checkDemoUsers.js';
import { getDB } from '../config/database.js';
import { parseJSONBody } from "../utils/parseJSONBody.js"
import { sanitizeInput } from "../utils/sanitizeInput.js"

export async function getBlockoutDates(res) {
    try {
        const db = getDB()
        const collection = db.collection('blockoutDates');

        const blockouts = await collection.find({}).toArray();
        
        if (!blockouts) {
            return sendResponse(res, 400, { error: 'No blockout date data found' })
        }

        return sendResponse(res, 200, { blockouts: blockouts })

    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Error fetching blockout date data' })
    }
}