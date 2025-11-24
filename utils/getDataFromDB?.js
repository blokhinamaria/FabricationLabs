import path from 'node:path'
import fs from 'fs/promises'

export async function getDataFromDB(requestedData) {
    try {
        const pathJSON = path.join('public', 'data', requestedData) 
        const data = await fs.readFile(pathJSON)
        const parsedData = data ? JSON.parse(data) : []
        return parsedData
    } catch (err) {
        console.log(`Error in getDataFromDB. Error: ${err}`)
        return []
    }
}
    