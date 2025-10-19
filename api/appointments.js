import { handleGet, handlePut, handleDelete } from "../handlers/routeHandlers"
import { sendResponse } from "../utils/sendResponse"

export default async function handler(req, res) {

            if (req.method === 'GET') {
                return await handleGet(req, res)
            } else if (req.method === 'PUT') {
                return await handlePut(req, res)
            } else if (req.method === 'DELETE') {
                return await handleDelete(req, res)
            }  else {
            sendResponse(res, 404, ({ error: 'Method not allowed'}))
            }
}