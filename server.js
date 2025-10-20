import http from 'node:http'

import { handlePost, handleGet, handlePut, handleDelete } from './handlers/routeHandlers.js';
import { sendResponse } from './utils/sendResponse.js';


// Import your new auth handlers
import requestLinkHandler from './api/request-link.js';
import verifyHandler from './api/verify.js';
import checkAuthHandler from './api/check-auth.js';
import logoutHandler from './api/logout.js';

const PORT = 3001;

// async function connectDB() {
//     const client = await MongoClient.connect(MONGODB_URI);
//     console.log("✅ Successfully connected to MongoDB!");
//     const db = client.db('fabrication-labs');
//     return { client, db };
// }

const server = http.createServer(async (req, res) => {

    //CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // AUTH ROUTES
    if (req.url === '/api/request-link' && req.method === 'POST') {
        return await requestLinkHandler(req, res);
    }
    else if (req.url.startsWith('/api/verify')) {
        return await verifyHandler(req, res);
    }
    else if (req.url === '/api/check-auth' && req.method === 'GET') {
        return await checkAuthHandler(req, res);
    }
    else if (req.url === '/api/logout' && req.method === 'POST') {
        return await logoutHandler(req, res);
    }

    //POST — Create new appointment 
    else if (req.url === '/api/new-appointment' && req.method === 'POST') {
        return await handlePost(req, res)
    } 
    //Fetch all or individual appointments 
    else if (req.url.startsWith('/api/appointments')) {
        if (req.method === 'GET') {
            return await handleGet(req, res)
        } else if (req.method === 'PUT') {
            return await handlePut(req, res)
        } else if (req.method === 'DELETE') {
            return await handleDelete(req, res)
        }  
    } else {
        sendResponse(res, 404, ({ error: 'Not Found', url: req.url}))
    }
})

server.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
})