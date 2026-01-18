import { sendResponse } from '../utils/sendResponse.js'
import { isDemoUser } from '../utils/checkDemoUsers.js';
import { getDB } from '../config/database.js';
import { parseJSONBody } from "../utils/parseJSONBody.js";
import { sanitizeInput } from "../utils/sanitizeInput.js";
import { ObjectId } from "bson";

export async function getUserAppointments(req, res) {
    try {
        const db = getDB()        
        let collection;
            if (isDemoUser(req.user.email)) {
                collection = db.collection('demo-bookings')
            } else {
                collection = db.collection('bookings')
            }

        const userId = req.user._id.toString();
        console.log('req.user')
        console.log(req.user)
        console.log(userId)

        if (!userId) {
            return sendResponse(res, 401, { error: 'User not found' })
        }
        
        const appointments = await collection.find( { userId: userId }).toArray()
        
        if (!appointments) {
            return sendResponse(res, 200, { appointments: [] })
        }

        return sendResponse(res, 200, { appointments: appointments })

    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Error fetching appointments' })
    }
}

export async function getAppointmentById(req, res, id) {
    try {
        const db = getDB()
        let collection;
        if (isDemoUser(req.user.email)) {
            collection = db.collection('demo-bookings')
        } else {
            collection = db.collection('bookings')
        }

        const appointment = await collection.findOne( { _id: new ObjectId(id)})

        if (!appointment) {
            return sendResponse(res, 400, { error: 'No appointment found' })
        }

        return sendResponse(res, 200, { appointment: appointment })

    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Error fetching appointment' })
    }
}

export async function createNewAppointment(req, res) {
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