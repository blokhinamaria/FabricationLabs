import { ObjectId } from "bson";
import { getDB } from '../config/database.js';
import { sendResponse } from '../utils/sendResponse.js';
import { parseJSONBody } from '../utils/parseJSONBody.js';
import { sanitizeInput } from '../utils/sanitizeInput.js';

export async function getSemesters(res) {
    try {
        const db = getDB()
        const collection = db.collection('semesters');

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

export async function createNewSemester(req, res) {
    try {
        let parsedData = await parseJSONBody(req)

        if (!parsedData) {
            return sendResponse(res, 400, { error: 'Failed to receive new data' })
        }
        
        const sanitizedData = sanitizeInput(parsedData)

        const db = getDB();
        const collection = db.collection('semesters');

        const result = await collection.insertOne({
            ...sanitizedData,
            createdAt: new Date()
        });

        return sendResponse(res, 200, { semesterId: result.insertedId, message: `New entry added to ${collection}` })
    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Failed to create new semester. Please try again later' })
    }
}

export async function updateSemester(req, res, id) {
    try {
        let parsedData = await parseJSONBody(req)
        
        if (!parsedData) {
            return sendResponse(res, 400, { error: 'Failed to receive new data' })
        }

        const sanitizedData = sanitizeInput(parsedData)

        const db = getDB();
        const collection = db.collection('semesters');

        const result = await collection.updateOne(
            {_id: new ObjectId(id)},
            { $set: {...sanitizedData, updatedAt: new Date()}} 
        )

        return sendResponse(res, 200, { modified: result.modifiedCount, message: `Semester updated` })
    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Failed to update semester. Please try again later' })
    }
}

export async function deleteSemester(res, id) {
    try {
        const db = getDB();
        const collection = db.collection('semesters');

        const result = await collection.deleteOne({ _id: new ObjectId(id)})

        sendResponse(res, 200, ({ deleted: result.deletedCount }))

    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, ({ error: 'Failed to delete semester. Please try again later' }))
    }
}