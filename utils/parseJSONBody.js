export async function parseJSONBody(req) {
    let body = ''
    for await (let chunk of req) {
        body += chunk
    }

    try {
        return JSON.parse(body)
    } catch (err) {
        throw new Error(`Error in parseJSONBody. Invalid JSON format: ${err}`)
    }
} 