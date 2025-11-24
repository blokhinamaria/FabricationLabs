import { handlePost } from '../handlers/routePost.js';
import { sendResponse } from '../utils/sendResponse.js';

export default async function handler(req, res) {
    //CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
        //POST — Create new appointment 
        if (req.url === '/api/new-appointment' && req.method === 'POST') {
            return await handlePost(req, res, 'bookings')
        } else {
            return sendResponse(res, 405, ({ error: 'Method not allowed' }))
        }
}
