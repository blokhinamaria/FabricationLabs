import { getDB } from "../config/database.js";
import { sendResponse } from "./sendResponse.js";

export async function getSemesters(req, res) {
    try {
        const db = await getDB();
        const collection = db.collection('semesterPeriods');
        const semesters = await collection.find({}).sort({startDay: -1}).toArray();
        if (semesters) {
            return sendResponse(res, 200, ({ success: true, semesters: semesters }))
        } else {
            return sendResponse(res, 200, ({ success: true, semesters: [] }))
        }
    } catch (err) {
        console.log(`Error in routeSemesterHandlers, handleSemesterGet: ${err}`)
        return sendResponse(res, 500, ({ error: err.message }))
    }
}
