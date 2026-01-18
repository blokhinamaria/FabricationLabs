import { getSemesters } from "../controllers/semesterControllers.js";
import { getAvailableSlots } from "../controllers/slotsControllers.js";
import { requireAuth } from "../middleware/requireAuth.js"
import { sendResponse } from "../utils/sendResponse.js";

export async function availabilityHandler(req, res, path, query) {
    
    const isAuthenticated = await requireAuth(req, res);

    if (!isAuthenticated) {
        return
    }

    // if (req.user.role === 'admin' || req.user.role === 'demo-admin') {
    //     return sendResponse(res, 405, {error: 'The account does not have required permissions'})
    // }

    if (path.startsWith('/api/availability/slot')) {
        if (req.method === 'GET') {
            const { equipmentId, date, appointmentId } = query;
            if (!equipmentId || !date) {
                return sendResponse(res, 400, {error: 'Insufficient data provided'})
            }
            return await getAvailableSlots(req, res, equipmentId, date, appointmentId);
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    } else if (path.startsWith('/api/availability/date')) {
        console.log('In progress...')
    } else {
        return sendResponse(res, 404, {error: 'Endpoint not found'})
    }
}