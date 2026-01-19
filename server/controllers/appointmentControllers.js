import { ObjectId } from "bson";
import { getDB } from '../config/database.js';
import { sendResponse } from '../utils/sendResponse.js';
import { parseJSONBody } from "../utils/parseJSONBody.js";
import { sanitizeInput } from "../utils/sanitizeInput.js";
import { isDemoUser } from '../utils/checkDemoUsers.js';
import { sendEmail } from '../utils/services/emailService.js';

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

export async function getAppointmentsByLabs(req, res) {
    try {
        const db = getDB()
        let collection;
        if (isDemoUser(req.user.email)) {
            collection = db.collection('demo-bookings')
        } else {
            collection = db.collection('bookings')
        }

        let assignedLabs = req.user.assignedLabs;

        const appointments = await collection.find({ location: { $in: assignedLabs }}).toArray()

        if (!appointments) {
            return sendResponse(res, 400, { error: 'No appointments found' })
        }

        return sendResponse(res, 200, { appointments: appointments })

    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Error fetching appointment' })
    }
}

export async function createNewAppointment(req, res) {
    try {
        let parsedData = await parseJSONBody(req)

        if (!parsedData) {
            return sendResponse(res, 400, { error: 'Failed to receive new data' })
        }
        
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

export async function updateAppointment(req, res, id) {
    try {
        let parsedData = await parseJSONBody(req)
        
        if (!parsedData) {
            return sendResponse(res, 400, { error: 'Failed to receive new data' })
        }

        const sanitizedData = sanitizeInput(parsedData)

        const db = getDB();
        let collection = db.collection(isDemoUser(req.user.email) ? 'demo-bookings' : 'bookings');

        const result = await collection.updateOne(
            {_id: new ObjectId(id)},
            { $set: {...sanitizedData, updatedAt: new Date()}} 
        )

        return sendResponse(res, 200, { modified: result.modifiedCount, message: `Appointment updated` })
    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Failed to update appointment. Please try again later' })
    }
}

export async function cancelAppointment(req, res, id) {
    try {

        const db = getDB();
        const appointments = db.collection("bookings");
        const users = db.collection("users");

        const appt = await appointments.findOne({ _id: new ObjectId(id) });
        if (!appt) {
            return sendResponse(res, 404, { error: "Appointment not found" })
        }

        const apptUser = await users.findOne({ _id: new ObjectId(appt.userId) });
        if (!apptUser) {
            return sendResponse(res, 404, { error: "User not found" })
        }

        const result = await appointments.updateOne(
            {_id: new ObjectId(id)},
            { $set: {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancelledBy: req.user._id,
                updatedAt: new Date(),
                }
            } 
        )

        const apptType = appt.type === 'class-reservation' ? 'Class Reservation' : 'Appointment'
        const equipment = appt.equipmentName
        const date = new Date(appt.date).toDateString();
        const time = new Date(appt.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        const link = process.env.CLIENT_URL
        let parsedData = await parseJSONBody(req)
        const sanitizedData = sanitizeInput(parsedData)
        const { cancellationReason } = sanitizedData;

        try {
            await sendEmail({
                to: apptUser.email,
                subject: "Your appointment was cancelled",
                html: `
                    <p>Hi there,</p>
                    <p>Your ${apptType} for ${equipment} 
                    on <b>${date}</b> at ${time} was cancelled by an admin.</p>
                    ${
                        cancellationReason ?
                        `<p>Reason for cancellation: ${cancellationReason}</p>`
                        : ''
                    }
                    <div style="margin: 32px 0;">
                        <p>Log back in to reschedule</p>
                        <a href="${link}" target="_self" style="display: inline-block; background: #6dff60; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 16px;">Fabrication Labs</a>
                    </div>
                    <p>– The FabLab Team</p>
                `,
            });
        } catch (error) {
            console.error(`Cancellation email failed: ${error}`);
        }

        return sendResponse(res, 200, { modified: result.modifiedCount, message: `Appointment updated` })
    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Failed to update appointment. Please try again later' })
    }
}

export async function deleteAppointment(req, res, id) {
    try {
        const db = getDB();
        let collection = db.collection(isDemoUser(req.user.email) ? 'demo-bookings' : 'bookings');

        const result = await collection.deleteOne({ _id: new ObjectId(id)})

        sendResponse(res, 200, ({ success: true, deleted: result.deletedCount }))

    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, ({ error: 'Failed to delete the appointment. Please try again later' }))
    }
}