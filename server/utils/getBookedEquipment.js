import { connectDB } from './connectDB.js'
import { sendResponse } from './sendResponse.js'
import { authenticateUser, isDemoUser } from '../utils/checkAuthentication.js';

export async function getBookedEquipment(req, res) {

    const auth = await authenticateUser(req);
        
        if (!auth.authenticated) {
            return sendResponse(res, 401, { error: auth.error });
        }

    const date = req.query?.date || new URLSearchParams(req.url?.split('?')[1]).get('date');

    const selectedDate = new Date(date);

    const { client, db } = await connectDB();

    let collection;
        if (isDemoUser(auth.user.email)) {
            collection = db.collection('demo-bookings')
        } else {
            collection = db.collection('bookings')
        }

    const existingBookings = await collection.find({
        date: selectedDate.toISOString(),
        status: { $in: ['pending', 'scheduled', 'confirmed'] }
    }).toArray();
    await client.close();

    const bookedEquipmentIds = existingBookings.map(booking => booking.equipmentId)

    return sendResponse(res, 200, ({ bookedEquipmentIds: bookedEquipmentIds}))
}