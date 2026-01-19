import { createNewSemester, deleteSemester, getSemesters, updateSemester } from "../controllers/semesterControllers.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { sendResponse } from "../utils/sendResponse.js";

export async function semesterHandler(req, res, path) {
    
    const isAuthenticated = await requireAuth(req, res);

    if (!isAuthenticated) {
        return
    }

    if (path === '/api/semester' && req.method === 'GET') {
        return await getSemesters(res)
    }

    if (req.user.role !== 'admin') {
        return sendResponse(res, 405, {error: 'The account does not have required permissions'})
    }
    
    if (path === '/api/semester' && req.method === 'POST') {
        return await createNewSemester(req, res);
    }

    //api/semester/:id
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 3 && segments[1] === 'semester') {
        const semesterId = segments[2];
        if (!semesterId) {
            return sendResponse(res, 400, {error: 'Semester ID required'}) 
        }
        if (req.method === 'PUT') {
            return await updateSemester(req, res, semesterId)
        } else if (req.method === 'DELETE') {
            return await deleteSemester(res, semesterId)
        } else {
            return sendResponse(res, 405, {error: 'Method not allowed'})
        }
    }

    return sendResponse(res, 404, {error: 'Endpoint not found'})

}