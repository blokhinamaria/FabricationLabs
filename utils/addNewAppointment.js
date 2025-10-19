import path from 'node:path'
import fs from 'node:fs/promises'
import { getDataFromDB } from './getDataFromDB.js'

export async function addNewAppointment(newData) {
    try {

        const existingData = await getDataFromDB('bookings.json')
        const updatedData = [...existingData, newData]
        const pathJSON = path.join('public', 'data', 'bookings.json')
        await fs.writeFile(pathJSON, JSON.stringify(updatedData, null, 2))
    } catch (err) {
        console.log(`Error in addNewAppointment. Error: ${err}`)
    }   
}