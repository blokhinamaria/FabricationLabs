import { getEquipment, getEquipmentById, updateEquipment } from "../controllers/equipmentControllers.js";
import { requireAuth } from "../middleware/requireAuth.js"
import { sendResponse } from "../utils/sendResponse.js";

export async function equipmentHandler(req, res, path) {
    
    const isAuthenticated = await requireAuth(req, res);

    if (!isAuthenticated) {
        return
    }

    // if (req.user.role === 'admin' || req.user.role === 'demo-admin') {
    //     return sendResponse(res, 405, {error: 'The account does not have required permissions'})
    // }



    if (path === '/api/equipment') {
        if (req.method === 'GET') {
            return await getEquipment(res)
        // } else if (req.methos === 'POST') {
        //     return await updateEquipment(req, res)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    } 
    
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 3 && segments[1] === 'equipment') {
        const equipmentId = segments[2];
        if (!equipmentId) {
            return sendResponse(res, 400, {error: 'Equipment ID required'}) 
        }
        if (req.method === 'GET') {
            return await getEquipmentById(res, equipmentId)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    }
    

    return sendResponse(res, 404, {error: 'Endpoint not found'})
}