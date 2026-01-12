export function sendResponse(res, statusCode, payload) {
    // Check if res.status exists (Vercel/Express-like)
    if (typeof res.status === 'function') {
        return res.status(statusCode).json(payload);
    }
    
    // Fallback for pure Node.js http module
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
}