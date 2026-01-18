import { sendResponse } from '../utils/sendResponse.js'
import { isDemoUser } from '../utils/checkDemoUsers.js';
import { getDB } from '../config/database.js';
import { parseJSONBody } from "../utils/parseJSONBody.js"
import { sanitizeInput } from "../utils/sanitizeInput.js"

export async function getSemesters(res) {
    try {
        const db = getDB()
        const collection = db.collection('semesterPeriods');

        const semesters = await collection.find({}).sort({startDay: -1}).toArray();
        
        if (!semesters) {
            return sendResponse(res, 400, { error: 'No semester data found' })
        }

        return sendResponse(res, 200, { semesters: semesters })

    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Error fetching semester data' })
    }
}