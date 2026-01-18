import http from 'node:http'
import url from 'url'

//database
import { connectDB, closeDB } from './config/database.js';

//handlers
import { handleGet } from './handlers/routeGet.js';
import { handlePost } from './handlers/routePost.js';
import { handlePut } from './handlers/routePut.js';
import { handleDelete } from './handlers/routeDelete.js';

//special utils
import { sendResponse } from './utils/sendResponse.js';
import { getBookedEquipment } from './utils/getBookedEquipment.js';

// auth handlers
import handleLogout from './handlers/logoutHandler.js';
import { handleLogin } from './handlers/loginHandler.js';

//notifications
import sendEmail from './api/send-email.js';
import { checkAuth } from './middleware/checkAuth.js';
import { meHandler } from './handlers/meHandler.js';
import { equipmentHandler } from './handlers/equipmentHandler.js';
import { semesterHandler } from './handlers/semesterHandler.js';
import { blockoutDateHandler } from './handlers/blockoutDateHandler.js';
import { availabilityHandler } from './handlers/availabilityHandler.js';

const PORT = process.env.PORT || 3001;

await connectDB();

const server = http.createServer(async (req, res) => {

    //CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    //const url = new URL(req.url, "http://localhost");
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    console.log(`Request URL: ${req.url}`)
    console.log(`Path: ${path}`)

    if (path === '/api/check-auth' && req.method === 'GET') {
        return await checkAuth(req, res);
    }
    if (path.startsWith('/api/login')) {
        return await handleLogin(req, res);
    }
    if (path === '/api/logout' && req.method === 'POST') {
        return await handleLogout(res);
    }
    if (path.startsWith('/api/me')) {
        return await meHandler(req, res, path)
    }
    if (path.startsWith('/api/equipment')) {
        return await equipmentHandler(req, res, path)
    }
    if (path.startsWith('/api/semester')) {
        return await semesterHandler(req, res, path)
    } 
    if (path.startsWith('/api/blockout-date')) {
        return await blockoutDateHandler(req, res, path)
    }
    if (path.startsWith('/api/availability')) {
        const query = parsedUrl.query;
        return await availabilityHandler(req, res, path, query)
    }



    //OTHER APOOINTMENT METHODS
    if (path.startsWith('/api/appointments')) {
        if (req.method === 'PUT') {
            return await handlePut(req, res, 'bookings')
        } else if (req.method === 'DELETE') {
            return await handleDelete(req, res, 'bookings')
        }
    
    //AVAILABILITY
    } if (path.startsWith('/api/availability')) {
        if (path.startsWith('/api/availability/date')) {
            return await getBookedEquipment(req, res)
        }
        }
    //USERS
    
    
    if (path.startsWith('/api/users') && req.method === 'PUT') {
        return await handlePut(req, res, 'users')
    } else {
        sendResponse(res, 404, ({ error: 'Not Found'}))
    }
    
    //EMAIL NOTIFICATIONS 
    if (path === '/api/send-email' && req.method === 'POST') {
        return await sendEmail(req, res)
    }
    }
)

server.listen(PORT, () => {
    console.log(`API server running on port:${PORT}`);
})

//signal interrupted - close DB connection
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await closeDB();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

//signal terminated - close DB connection
process.on('SIGTERM', async () => {
    await closeDB();
    server.close(() => process.exit(0));
});


// Auth/session

// GET /api/check-auth

// POST /api/logout (optional but recommended)


// General user

// GET /api/me

// GET /api/me/appointments

// POST /api/me/appointments

// GET /api/me/appointments/:id

// PUT /api/me/appointments/:id

// DELETE /api/me/appointments/:id

// Shared data

// GET /api/availability/slots

// Admin

// GET /api/admin/appointments (optional)

// GET/POST/PUT/DELETE /api/equipment (+ /:id)

// GET/POST/PUT/DELETE /api/semesters (+ /:id)

// GET/POST/PUT/DELETE /api/blockout-dates (+ /:id)

// Notifications (only if needed)

// Prefer: no direct endpoint; send emails on business actions

// If needed: intent-based endpoints (invitations/support), not /send-email