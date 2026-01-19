import { getBlockoutDates, createNewBlockoutDate, updateBlockoutDate, deleteBlockoutDate} from '../controllers/blockoutDateControllers.js'
import { requireAuth } from "../middleware/requireAuth.js"
import { sendResponse } from "../utils/sendResponse.js";

export async function blockoutDateHandler(req, res, path) {
    
    const isAuthenticated = await requireAuth(req, res);

    if (!isAuthenticated) {
        return
    }

    if (path === '/api/blockout-date' && req.method === 'GET') {
        return await getBlockoutDates(res)
    }

    if (req.user.role !== 'admin') {
        return sendResponse(res, 405, {error: 'The account does not have required permissions'})
    }
    
    if (path === '/api/blockout-date' && req.method === 'POST') {
        return await createNewBlockoutDate(req, res);
    }

    //api/blockout-dates/:id
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 3 && segments[1] === 'blockout-date') {
        const dateId = segments[2];
        if (!dateId) {
            return sendResponse(res, 400, {error: 'Blockout date ID required'}) 
        }
        if (req.method === 'PUT') {
            return await updateBlockoutDate(req, res, dateId)
        } else if (req.method === 'DELETE') {
            return await deleteBlockoutDate(res, dateId)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    }

    return sendResponse(res, 404, {error: 'Endpoint not found'})

}