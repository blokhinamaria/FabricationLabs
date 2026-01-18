import { createNewAppointment, getAppointmentById, getUserAppointments } from "../controllers/appointmentControllers.js";
import { requireAuth } from "../middleware/requireAuth.js"
import { sendResponse } from "../utils/sendResponse.js";

export async function meHandler(req, res, path) {
    const isAuthenticated = await requireAuth(req, res);

    if (!isAuthenticated) {
        return
    }

    if (req.user.role === 'admin' || req.user.role === 'demo-admin') {
        return sendResponse(res, 405, {error: 'The account does not have required permissions'})
    }
    console.log(path)
    console.log(req.method)

    if (path === '/api/me/appointment') {
        if (req.method === 'GET') {
            return await getUserAppointments(req, res)
        } else if (req.method === 'POST') {
            return await createNewAppointment(req, res)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    }

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
    
    else {
        return sendResponse(res, 404, {error: 'Endpoint Not found'})
    }

}