import { connectDB } from './connectDB.js'
import { sendResponse } from './sendResponse.js'

export async function getBookedEquipment(req, res) {
    const date = req.query?.date || new URLSearchParams(req.url?.split('?')[1]).get('date');

    // 1. Get the day of week from the date
    const selectedDate = new Date(date);

    // 2. Fetch availability rules for this day
    const { client, db } = await connectDB();

    const bookingCollection = db.collection('bookings');
    const existingBookings = await bookingCollection.find({
        date: selectedDate.toISOString(),
        status: { $in: ['pending', 'scheduled', 'confirmed'] }
    }).toArray();
    await client.close();

    const bookedEquipmentIds = existingBookings.map(booking => booking.equipmentId)

    return sendResponse(res, 200, ({ bookedEquipmentIds: bookedEquipmentIds}))
}