import { ObjectId } from "bson";
import { getDB } from '../config/database.js';
import { sendResponse } from '../utils/sendResponse.js';
import { parseJSONBody } from "../utils/parseJSONBody.js";
import { sanitizeInput } from "../utils/sanitizeInput.js";


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

export async function getEquipmentByLab(req, res) {
    try {
        const db = getDB()
        const collection = db.collection('equipment')

        const assignedLabs = req.user.assignedLabs;
                
        const equipment = await collection.find({ location: { $in: assignedLabs }}).toArray()

        if (!equipment) {
            return sendResponse(res, 400, { error: 'No equipment found' })
        }

        return sendResponse(res, 200, { equipment: equipment })

    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Error fetching equipment' })
    }
}

export async function updateEquipment(req, res, id) {
    try {
        let parsedData = await parseJSONBody(req)

        if (!parsedData) {
            return sendResponse(res, 400, { error: 'Failed to receive new data' })
        }

        const sanitizedData = sanitizeInput(parsedData)

        const db = getDB();
        let collection = db.collection('equipment');

        const result = await collection.updateOne(
            {_id: new ObjectId(id)},
            { $set: {...sanitizedData, updatedAt: new Date()}} 
        )

        return sendResponse(res, 200, { modified: result.modifiedCount, message: `Equipment updated` })
    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Failed to update the appointment. Please try again later' })
    }
}