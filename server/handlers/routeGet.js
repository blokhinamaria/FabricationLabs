import { sendResponse } from '../utils/sendResponse.js'

import { ObjectId } from "bson"

import { isDemoUser } from '../utils/checkDemoUsers.js';
import { getDB } from '../config/database.js';

export async function handleGet(req, res) {
        
        const auth = await handleCheckAuth(req);
        
        if (!auth.authenticated) {
            return sendResponse(res, 401, { error: auth.error });
        }
    
        try {
            
            const db  = await getDB()

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

                    if (appointment) {
                        return sendResponse(res, 200, ({ success: true, appointment: appointment }))
                    } else {
                        return sendResponse(res, 200, ({ success: true, appointment: 'No Appointment Found' }))
                    }
                }

                //Get all appointments (only for admins)
                const role = req.query?.role || new URLSearchParams(req.url?.split('?')[1]).get('role');
                const labsParam = req.query?.labs || new URLSearchParams(req.url?.split('?')[1]).get('labs');

                if (role) {
                
                    if (role === 'admin') {
                        
                        let assignedLabs = labsParam.split(',');

                        const appointments = await collection.find({ location: { $in: assignedLabs }}).toArray()

                        return sendResponse(res, 200, ({success: true, appointments: appointments}))
                    } else if (role === 'demo-admin') {

                        const appointments = await collection.find({}).toArray()

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

                return sendResponse(res, 200, ({success: true, equipment: equipment}))
            } 
        
        }
    } catch (err) {
        console.log(`Error in routeHandlers, handleGet: ${err}`)
        return sendResponse(res, 500, ({ error: err.message }))
    }
}