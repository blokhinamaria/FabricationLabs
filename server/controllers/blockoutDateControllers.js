import { ObjectId } from "bson";
import { getDB } from '../config/database.js';
import { parseJSONBody } from '../utils/parseJSONBody.js';
import { sanitizeInput } from '../utils/sanitizeInput.js';
import { sendResponse } from '../utils/sendResponse.js';

export async function getBlockoutDates(res) {
    try {
        const db = getDB()
        const collection = db.collection('blockout-dates');

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

export async function createNewBlockoutDate(req, res) {
    try {
        let parsedData = await parseJSONBody(req)

        if (!parsedData) {
            return sendResponse(res, 400, { error: 'Failed to receive new data' })
        }
        
        const sanitizedData = sanitizeInput(parsedData)

        const db = getDB();
        const collection = db.collection('blockout-dates');

        const result = await collection.insertOne({
            ...sanitizedData,
            createdAt: new Date()
        });

        return sendResponse(res, 200, { semesterId: result.insertedId, message: `New entry added to ${collection}` })
    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Failed to create new blockout date. Please try again later' })
    }
}

export async function updateBlockoutDate(req, res, id) {
    try {
        let parsedData = await parseJSONBody(req)
        
        if (!parsedData) {
            return sendResponse(res, 400, { error: 'Failed to receive new data' })
        }

        const sanitizedData = sanitizeInput(parsedData)

        const db = getDB();
        const collection = db.collection('blockout-dates');

        const result = await collection.updateOne(
            {_id: new ObjectId(id)},
            { $set: {...sanitizedData, updatedAt: new Date()}} 
        )

        return sendResponse(res, 200, { modified: result.modifiedCount, message: `Semester updated` })
    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Failed to update blockout date. Please try again later' })
    }
}

export async function deleteBlockoutDate(res, id) {
    try {
        const db = getDB();
        const collection = db.collection('blockout-dates');

        const result = await collection.deleteOne({ _id: new ObjectId(id)})

        sendResponse(res, 200, ({ deleted: result.deletedCount }))

    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, ({ error: 'Failed to delete blockout date. Please try again later' }))
    }
}