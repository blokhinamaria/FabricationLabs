import { getAppointmentById, getAppointmentsByLabs, cancelAppointment } from "../controllers/appointmentControllers.js";
import { getEquipmentByLab } from "../controllers/equipmentControllers.js";
import { adminContactUser } from "../controllers/userControllers.js";
import { requireAuth } from "../middleware/requireAuth.js"
import { sendResponse } from "../utils/sendResponse.js";

export async function adminHandler(req, res, path, query) {
    const isAuthenticated = await requireAuth(req, res);

    if (!isAuthenticated) {
        return
    }

    if (req.user.role !== 'admin' && req.user.role !== 'demo-admin') {
        return sendResponse(res, 405, {error: 'The account does not have required permissions'})
    }

    if (path === '/api/admin/equipment') {
        if (req.method === 'GET') {
            return await getEquipmentByLab(req, res)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    }

    if (path === '/api/admin/appointment') {
        if (req.method === 'GET') {
            return await getAppointmentsByLabs(req, res)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    }

    //api/admin/appointment/:id
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 4 && segments[2] === 'appointment') {   
        const appointmentId = segments[3];
        if (!appointmentId) {
            return sendResponse(res, 400, {error: 'Appointment ID required'}) 
        }
        if (req.method === 'GET') {
            return await getAppointmentById(req, res, appointmentId)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    }

    //ADMIN ONLY
    if (req.user.role !== 'admin') {
        return sendResponse(res, 405, {error: 'The account does not have required permissions'})
    }

    //api/admin/appointment/:id/cancel
    if (segments.length === 5 && segments[2] === 'appointment' && segments[4] === 'cancel') {
        const appointmentId = segments[3];
        if (!appointmentId) {
            return sendResponse(res, 400, {error: 'Appointment ID required'}) 
        }
        if (req.method === 'PUT') {
            return await cancelAppointment(req, res, appointmentId)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    }

    //api/admin/user/:id/contact
    if (segments.length === 5 && segments[2] === 'user' && segments[4] === 'contact') {
        const userId = segments[3];
        if (!userId) {
            return sendResponse(res, 400, {error: 'User ID required'}) 
        }
        if (req.method === 'POST') {
            return await adminContactUser(req, res, userId)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    }
    
    return sendResponse(res, 404, {error: 'Endpoint Not found'})
}