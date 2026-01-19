import { getDB } from '../config/database.js';
import { sendResponse } from '../utils/sendResponse.js';
import { isDemoUser } from '../utils/checkDemoUsers.js';

export async function getBookedEquipmentForDate(req, res, date) {

    const selectedDate = new Date(date);

    const db = getDB()

    let collection;
        if (isDemoUser(req.user.email)) {
            collection = db.collection('demo-bookings')
        } else {
            collection = db.collection('bookings')
        }

    const existingBookings = await collection.find({
        date: selectedDate.toISOString(),
        status: { $in: ['pending', 'scheduled', 'confirmed'] }
    }).toArray();

    const bookedEquipmentIds = existingBookings.map(booking => booking.equipmentId)

    return sendResponse(res, 200, ({ bookedEquipmentIds: bookedEquipmentIds}))
}