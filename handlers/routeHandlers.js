import { parseJSONBody } from "../utils/parseJSONBody.js"
import { sanitizeInput } from "../utils/sanitizeInput.js"
import { sendResponse } from '../utils/sendResponse.js'
import { connectDB } from "../utils/connectDB.js"
// import { data } from "react-router-dom"

import { ObjectId } from "bson"

export async function handlePost(req, res) {
    try {
        let parsedData 
        if (req.body) {
            parsedData = req.body
        } else {
            parsedData = await parseJSONBody(req)
        }
        const sanitizedData = sanitizeInput(parsedData)

        const { client, db } = await connectDB();
        const collection = db.collection('bookings');

        //Instead of ... (fs.writeFile....)
        // await addNewAppointment(sanitizedData)
            
        const result = await collection.insertOne({
                ...sanitizedData,
                createdAt: new Date()
        });

        await client.close();

        sendResponse(res, 200, ({ success: true, data: result.insertedId, message: 'Appointment created' }))
        console.log(result)
        
    } catch (err) {
        console.log(`Eroor in routeHandlers, handlePost: ${err}`)
    }
}

export async function handleGet(req, res) {
    try {
        const { client, db } = await connectDB();

        const id = req.query?.id || new URLSearchParams(req.url?.split('?')[1]).get('id');
        const userId = req.query?.userId || new URLSearchParams(req.url?.split('?')[1]).get('userId')
        console.log(userId)

        if (id) {
            const collection = db.collection('bookings')
            const appointment = await collection.findOne( { _id: new ObjectId(id)})

            await client.close()

            if (appointment) {
                return sendResponse(res, 200, ({ success: true, appointment: appointment }))
            } else {
                return sendResponse(res, 200, ({ success: true, appointment: 'No Appointment Found' }))
            }
        }

        if (userId) {
            const collection = db.collection('bookings')
            const appointments = await collection.find( { userId: userId }).toArray()
            await client.close()

            if (appointments) {
                return sendResponse(res, 200, ({ success: true, appointments: appointments }))
            } else {
                return sendResponse(res, 200, ({ success: true, appointments: 'No Appointments Found' }))
            }
        }

        //Get all appointments
        const collection = db.collection('bookings');
        const appointments = await collection.find({}).toArray()
            
        await client.close()
        return sendResponse(res, 200, ({success: true, data: appointments}))
    } catch (err) {
        console.log(`Error in routeHandlers, handleGet: ${err}`)
        return sendResponse(res, 500, ({ error: err.message }))
    }    
}

export async function handlePut(req, res) {

    try {
        const id = req.query?.id || new URLSearchParams(req.url?.split('?')[1]).get('id');

        let updateData
        if (req.body) {
            updateData = req.body;
        } else {
            updateData = await parseJSONBody(req)
        }
        const sanitizedData = sanitizeInput(updateData)

        const { client, db } = await connectDB()
        const collection = db.collection('bookings')

        const result = await collection.updateOne(
            {_id: new ObjectId(id), },
            { $set: sanitizedData} 
        )

        await client.close()

        sendResponse(res, 200, ({ success: true, modified: result.modifiedCount }))

    } catch (err) {
        console.log(`Error in routeHandlers, handlePut: ${err}`)
        sendResponse(res, 500, ({error: err.message}))
    }
}

export async function handleDelete(req, res) {
    try {
        const id = req.query?.id || new URLSearchParams(req.url?.split('?')[1]).get('id');

        const { client, db} = await connectDB()
        const collection = db.collection('bookings')

        const result = await collection.deleteOne({ _id: new ObjectId(id)})

        await client.close()

        sendResponse(res, 200, ({ success: true, deleted: result.deletedCount }))

    } catch (err) {
        console.log(`Error in routeHandlers, handleDelete: ${err}`)
    }
}