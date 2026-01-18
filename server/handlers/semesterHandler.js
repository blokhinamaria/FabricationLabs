import { getSemesters } from "../controllers/semesterControllers.js";
import { requireAuth } from "../middleware/requireAuth.js"
import { sendResponse } from "../utils/sendResponse.js";

export async function semesterHandler(req, res, path) {
    
    const isAuthenticated = await requireAuth(req, res);

    if (!isAuthenticated) {
        return
    }

    // if (req.user.role === 'admin' || req.user.role === 'demo-admin') {
    //     return sendResponse(res, 405, {error: 'The account does not have required permissions'})
    // }

    if (path === '/api/semester') {
        if (req.method === 'GET') {
            return await getSemesters(res)
        // } else if (req.methos === 'POST') {
        //     return await updateEquipment(req, res)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    } else {
        return sendResponse(res, 404, {error: 'Endpoint not found'})
    }

}