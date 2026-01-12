import { sendResponse } from '../utils/sendResponse.js'
import { connectDB } from "../utils/connectDB.js"

import { ObjectId } from "bson"

import { authenticateUser, isDemoUser } from '../utils/checkAuthentication.js';

export async function handleGet(req, res) {
        
        const auth = await authenticateUser(req);
        
        if (!auth.authenticated) {
            return sendResponse(res, 401, { error: auth.error });
        }
    
        try {
            
            const { client, db } = await connectDB();

            if (req.url.startsWith('/api/appointments')) {

                let collection;
                    if (isDemoUser(auth.user.email)) {
                        collection = db.collection('demo-bookings')
                    } else {
                        collection = db.collection('bookings')
                    }

                const id = req.query?.id || new URLSearchParams(req.url?.split('?')[1]).get('id');

                if (id) {
                    const appointment = await collection.findOne( { _id: new ObjectId(id)})

                    await client.close()

                    if (appointment) {
                        return sendResponse(res, 200, ({ success: true, appointment: appointment }))
                    } else {
                        return sendResponse(res, 200, ({ success: true, appointment: 'No Appointment Found' }))
                    }
                }

                const userId = req.query?.userId || new URLSearchParams(req.url?.split('?')[1]).get('userId')

                if (userId) {
                    
                    const appointments = await collection.find( { userId: userId }).toArray()
                    
                    await client.close()

                    if (appointments) {
                        return sendResponse(res, 200, ({ success: true, appointments: appointments }))
                    } else {
                        return sendResponse(res, 200, ({ success: true, appointments: 'No Appointments Found' }))
                    }
                }

                //Get all appointments (only for admins)
                const role = req.query?.role || new URLSearchParams(req.url?.split('?')[1]).get('role');
                const labsParam = req.query?.labs || new URLSearchParams(req.url?.split('?')[1]).get('labs');

                if (role) {
                
                    if (role === 'admin') {
                        
                        let assignedLabs = labsParam.split(',');

                        const appointments = await collection.find({ location: { $in: assignedLabs }}).toArray()

                        await client.close()
                        return sendResponse(res, 200, ({success: true, appointments: appointments}))
                    } else if (role === 'demo-admin') {

                        const appointments = await collection.find({}).toArray()

                        await client.close()
                        return sendResponse(res, 200, ({success: true, appointments: appointments}))
                    }   
                    
                }

        } else if (req.url.startsWith('/api/equipment')) {

            const role = req.query?.role || new URLSearchParams(req.url?.split('?')[1]).get('role');
            const labsParam = req.query?.labs || new URLSearchParams(req.url?.split('?')[1]).get('labs');

            if (role && role === 'admin') {
                let assignedLabs = labsParam.split(',');
                
                const collection = db.collection('equipment');
                const equipment = await collection.find({ location: { $in: assignedLabs }}).toArray()

                await client.close()
                return sendResponse(res, 200, ({success: true, equipment: equipment}))
            } 
            const id = req.query?.id || new URLSearchParams(req.url?.split('?')[1]).get('id');
            if (id) {
                const collection = db.collection('equipment')
                const equipment = await collection.findOne( { _id: new ObjectId(id)})

                await client.close()

                if (equipment) {
                    return sendResponse(res, 200, ({ success: true, equipment: equipment }))
                } else {
                    return sendResponse(res, 400, ({ success: false, equipment: "No equipment found" }))
                }
            }
            
            //return all for users
                const collection = db.collection('equipment')
                const equipment = await collection.find({}).toArray()
                await client.close()

                if (equipment) {
                    return sendResponse(res, 200, ({ success: true, equipment: equipment }))
                } else {
                    return sendResponse(res, 400, ({ success: false, equipment: "No equipment found" }))
                }
        }
    } catch (err) {
        console.log(`Error in routeHandlers, handleGet: ${err}`)
        return sendResponse(res, 500, ({ error: err.message }))
    }
}