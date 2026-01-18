import { sendResponse } from '../utils/sendResponse.js'
import { isDemoUser } from '../utils/checkDemoUsers.js';
import { getDB } from '../config/database.js';
import { parseJSONBody } from "../utils/parseJSONBody.js"
import { sanitizeInput } from "../utils/sanitizeInput.js"
import { ObjectId } from "bson"

export async function getEquipment(res) {
    try {
        const db = getDB()
        const collection = db.collection('equipment')
        
        const equipment = await collection.find({}).toArray()
        
        if (!equipment) {
            return sendResponse(res, 400, { error: 'No equipment found' })
        }

        return sendResponse(res, 200, { equipment: equipment })

    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Error fetching equipment' })
    }
}

export async function getEquipmentById(res, id) {
    try {
        const db = getDB()
        const collection = db.collection('equipment')

        const equipment = await collection.findOne( { _id: new ObjectId(id)})

        if (!equipment) {
            return sendResponse(res, 400, { error: 'No equipment found' })
        }

        return sendResponse(res, 200, { equipment: equipment })

    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Error fetching equipment' })
    }
}

export async function updateEquipment(req, res) {
    try {
        let parsedData = await parseJSONBody(req)
        const sanitizedData = sanitizeInput(parsedData)

        const db = getDB();
        let collection = db.collection(isDemoUser(req.user.email) ? 'demo-bookings' : 'bookings');

        const result = await collection.insertOne({
            ...sanitizedData,
            createdAt: new Date()
        });

        return sendResponse(res, 200, { appointmentId: result.insertedId, message: `New entry added to ${collection}` })
    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Failed to create new appointment. Please try again later' })
    }
}