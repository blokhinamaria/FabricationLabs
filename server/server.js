import http from 'node:http'
import url from 'url'

//database
import { connectDB, closeDB } from './config/database.js';

// auth handlers
import { handleLogout } from './handlers/logoutHandler.js';

//handlers
import { checkAuth } from './middleware/checkAuth.js';
import { handleLogin } from './handlers/loginHandler.js';
import { meHandler } from './handlers/meHandler.js';
import { equipmentHandler } from './handlers/equipmentHandler.js';
import { semesterHandler } from './handlers/semesterHandler.js';
import { blockoutDateHandler } from './handlers/blockoutDateHandler.js';
import { availabilityHandler } from './handlers/availabilityHandler.js';
import { adminHandler } from './handlers/adminHandler.js';

//utils
import { sendResponse } from './utils/sendResponse.js';

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

    if (path === '/api/check-auth' && req.method === 'GET') {
        return await checkAuth(req, res);
    }
    if (path.startsWith('/api/login')) {
        return await handleLogin(req, res, path);
    }
    if (path === '/api/logout' && req.method === 'POST') {
        return await handleLogout(res);
    }
    if (path.startsWith('/api/me')) {
        return await meHandler(req, res, path)
    }
    if (path.startsWith('/api/admin')) {
        const query = parsedUrl.query;
        return await adminHandler(req, res, path, query)
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
    return sendResponse(res, 404, {error: 'Endpoint not found'})
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