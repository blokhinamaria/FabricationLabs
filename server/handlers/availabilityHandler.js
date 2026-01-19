import { getBookedEquipmentForDate } from "../controllers/bookedEquipmentControllers.js";
import { getAvailableSlots } from "../controllers/slotsControllers.js";
import { requireAuth } from "../middleware/requireAuth.js"
import { sendResponse } from "../utils/sendResponse.js";

export async function availabilityHandler(req, res, path, query) {
    
    const isAuthenticated = await requireAuth(req, res);

    if (!isAuthenticated) {
        return
    }

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
    } else if (path.startsWith('/api/availability/equipment')) {
        if (req.method === 'GET') {
            const { date } = query;
            if (!date) {
                return sendResponse(res, 400, {error: 'Insufficient data provided'})
            }
            return await getBookedEquipmentForDate(req, res, date)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    } else {
        return sendResponse(res, 404, {error: 'Endpoint not found'})
    }
}