import { getBlockoutDates } from "../controllers/blockoutDateControllers.js";
import { getSemesters } from "../controllers/semesterControllers.js";
import { requireAuth } from "../middleware/requireAuth.js"
import { sendResponse } from "../utils/sendResponse.js";

export async function blockoutDateHandler(req, res, path) {
    
    const isAuthenticated = await requireAuth(req, res);

    if (!isAuthenticated) {
        return
    }

    // if (req.user.role === 'admin' || req.user.role === 'demo-admin') {
    //     return sendResponse(res, 405, {error: 'The account does not have required permissions'})
    // }

    if (path === '/api/blockout-date') {
        if (req.method === 'GET') {
            return await getBlockoutDates(res)
        // } else if (req.methos === 'POST') {
        //     return await updateEquipment(req, res)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    } else {
        return sendResponse(res, 404, {error: 'Endpoint not found'})
    }

}