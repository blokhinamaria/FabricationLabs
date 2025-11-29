import sanitizeHtml from "sanitize-html";

export function sanitizeInput(data) {
    const sanitizedData = {}

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            sanitizedData[key] = sanitizeHtml(value, {
            allowedTags: ['br', 'p', 'div', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i'],
            allowedAttributes: {}
        })
        } else {
            sanitizedData[key] = value
        }
        
    }
    return sanitizedData
}