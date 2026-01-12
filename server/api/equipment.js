import { handleGet } from '../handlers/routeGet.js';
import { handlePut } from '../handlers/routePut.js';
import { handleDelete } from "../handlers/routeDelete.js"
import { sendResponse } from "../utils/sendResponse.js"

export default async function handler(req, res) {
    //CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'GET') {
                return await handleGet(req, res)
            } else if (req.method === 'PUT') {
                return await handlePut(req, res, 'equipment')
            } else if (req.method === 'DELETE') {
                return await handleDelete(req, res, 'equipment')
            }  else {
            sendResponse(res, 404, ({ error: 'Method not allowed'}))
            }
}