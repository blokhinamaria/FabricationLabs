import http from 'node:http'

//handlers
import { handleGet } from './handlers/routeGet.js';
import { handlePost } from './handlers/routePost.js';
import { handlePut } from './handlers/routePut.js';
import { handleDelete } from './handlers/routeDelete.js';

//special utils
import { getSemesters} from './utils/getSemesters.js';
import { sendResponse } from './utils/sendResponse.js';
import { getAvailableSlots } from './utils/getAvailableSlots.js'
import { getBookedEquipment } from './utils/getBookedEquipment.js';
import { getBlockoutDates } from './utils/getBlockoutDates.js';

// auth handlers
import requestLinkHandler from './api/request-link.js';
import verifyHandler from './api/verify.js';
import checkAuthHandler from './api/check-auth.js';
import logoutHandler from './api/logout.js';

//notifications
import sendEmail from './api/send-email.js';

const PORT = 3001;

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

    //EMAIL NOTIFICATIONS 
    if (req.url === '/api/send-email' && req.method === 'POST') {
        return await sendEmail(req, res)
    }

    //APPOINTMENTS
    //POST — Create new appointment 
    // else if (req.url === '/api/new-appointment' && req.method === 'POST') {
    //     return await handlePost(req, res, 'bookings')
    // } 

    //OTHER APOOINTMENT METHODS
    else if (req.url.startsWith('/api/appointments')) {
        if (req.method === 'GET') {
            return await handleGet(req, res)
        } else if (req.method === 'POST') {
            return await handlePost(req, res, 'bookings')
        } else if (req.method === 'PUT') {
            return await handlePut(req, res, 'bookings')
        } else if (req.method === 'DELETE') {
            return await handleDelete(req, res, 'bookings')
        }

    //EQUIPMENT 
    } else if (req.url.startsWith('/api/equipment') && req.method === 'GET') {
        return await handleGet(req, res)
    } else if (req.url.startsWith('/api/equipment') && req.method === 'PUT') {
        return await handlePut(req, res, 'equipment')
    
    //AVAILABILITY
    } else if (req.url.startsWith('/api/availability')) {
        if (req.url.startsWith('/api/availability/slots')) {
            return await getAvailableSlots(req, res)
        } else if (req.url.startsWith('/api/availability/date')) {
            return await getBookedEquipment(req, res)
        }
    //SEMESTERS
        } else if (req.url.startsWith('/api/semesters')) {
            if (req.method === 'GET') {
                return await getSemesters(res, res)
            } else if (req.method === 'POST') {
                return await handlePost(req, res, 'semesterPeriods')
            } else if (req.method === 'PUT') {
                return await handlePut(req, res, 'semesterPeriods')
            } else if (req.method === 'DELETE') {
                return await handleDelete(req, res, 'semesterPeriods')
            }

        } else if (req.url.startsWith('/api/blockoutdates')) {
            if (req.method === 'GET') {
                return await getBlockoutDates(req, res)
            } else if (req.method === 'POST') {
                return await handlePost(req, res, 'blockoutDates')
            } else if (req.method === 'PUT') {
                return await handlePut(req, res, 'blockoutDates')
            } else if (req.method === 'DELETE') {
                return await handleDelete(req, res, 'blockoutDates')
            }
    //USERS
    } else if (req.url.startsWith('/api/users') && req.method === 'PUT') {
        return await handlePut(req, res, 'users')
    } else {
        sendResponse(res, 404, ({ error: 'Not Found', url: req.url}))
    }
})

server.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
})