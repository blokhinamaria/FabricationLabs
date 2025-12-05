import { getBlockoutDates } from "../utils/getBlockoutDates.js"
import { handlePost } from "../handlers/routePost.js";
import { handlePut } from "../handlers/routePut.js";
import { handleDelete } from "../handlers/routeDelete.js";
import { sendResponse } from "../utils/sendResponse.js"

export default async function handler(req, res) {
    //CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.url.startsWith('/api/blockoutdates')) {
            if (req.method === 'GET') {
                return await getBlockoutDates(req, res)
            } else if (req.method === 'POST') {
                return await handlePost(req, res, 'blockoutDates')
            } else if (req.method === 'PUT') {
                return await handlePut(req, res, 'blockoutDates')
            } else if (req.method === 'DELETE') {
                return await handleDelete(req, res, 'blockoutDates')
            }
            } else {
            sendResponse(res, 404, ({ error: 'Method not allowed'}))
            }
}