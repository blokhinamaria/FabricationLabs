import { getSemesters } from "../utils/getSemesters.js"
import { handlePost } from "../handlers/routePost.js";
import { handlePut } from "../handlers/routePut.js";
import { handleDelete } from "../handlers/routeDelete.js";
import { sendResponse } from "../utils/sendResponse.js"

export default async function handler(req, res) {
    //CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.url.startsWith('/api/semesters')) {
                if (req.method === 'GET') {
                    return await getSemesters(req, res)
                } else if (req.method === 'POST') {
                    return await handlePost(req, res, 'semesterPeriods')
                } else if (req.method === 'PUT') {
                    return await handlePut(req, res, 'semesterPeriods')
                } else if (req.method === 'DELETE') {
                    return await handleDelete(req, res, 'semesterPeriods')
                }
            } else {
            sendResponse(res, 404, ({ error: 'Method not allowed'}))
            }
}