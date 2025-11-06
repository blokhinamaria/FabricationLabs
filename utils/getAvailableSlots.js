import { connectDB } from './connectDB.js'
import { sendResponse } from './sendResponse.js'
import { ObjectId } from "bson"

export async function getAvailableSlots(req, res) {
    
    const equipmentId = req.query?.equipmentId || new URLSearchParams(req.url?.split('?')[1]).get('equipmentId');
    const date = req.query?.date || new URLSearchParams(req.url?.split('?')[1]).get('date');
    const appointmentId = req.query?.appointmentId || new URLSearchParams(req.url?.split('?')[1]).get('appointmentId') || null;

    console.log(appointmentId)

    // 1. Get the day of week from the date
    const selectedDate = new Date(date);
    const selectedDayOfWeek = selectedDate.getDay();

    // 2. Fetch availability rules for this day
    const { client, db } = await connectDB();
    const availabilityCollection = db.collection('availability');
    const availability = await availabilityCollection.findOne( { dayOfWeek: selectedDayOfWeek });

    if (!availability || !availability.isOpen ) {
        await client.close();
        return sendResponse(res, 400, ({ available: false, slots: []}));
    }

     // 3. Fetch equipment details (for capacity and exceptions)
    const equipmentCollection = db.collection('equipment');
    const equipment = await equipmentCollection.findOne( {_id: new ObjectId(equipmentId)} );

    // 4. Check equipment availability exceptions
    const hasException = equipment.availabilityExceptions.some(exception => {
        const exceptionDate = new Date(exception.date);
        return ( exceptionDate.toDateString() === selectedDate.toDateString() && exception.allDay);
    })

    if (hasException) {
        await client.close();
        return sendResponse(res, 200, ({ available: false, slots: [], reason: "Equipment unavailable"}));
    }

    // 5. Get existing bookings for this equipment and date
    const startOfDay = new Date(selectedDate)
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setUTCHours(23, 59, 59, 999)

    const bookingCollection = db.collection('bookings');
    const existingBookings = await bookingCollection.find({
        _id: { $ne: new ObjectId(appointmentId) },
        equipmentId: equipmentId,
        date: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString()},
        status: { $in: ['pending', 'scheduled', 'confirmed'] }
    }).toArray();
    await client.close();

    console.log(existingBookings)

    // 5. Generate all possible time slots
    const daySlots = generateTimeSlots(availability.openTime, availability.closeTime, availability.slotDuration);

    // 7. Filter out booked slots (respecting capacity)
    const availableSlots = daySlots.filter(slot => {
        const bookingsAtThisTime = existingBookings.filter(booking => 
            booking.startTime === slot.startTime);
        return bookingsAtThisTime.length < equipment.capacity
    })

    return sendResponse(res, 200, ({ available: true, slots: availableSlots}))
}

function generateTimeSlots(openTime, closeTime, duration, breaks = []) {
    const slots = [];
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);

    let currentTime = openHour * 60 + openMin;
    const endTime = closeHour * 60 + closeMin;

    while (currentTime + duration <= endTime) {
        const hour = Math.floor(currentTime / 60);
        const minutes = currentTime % 60;
        const timeString = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

        // Check if this slot falls within a break 
        const isDuringBreak = breaks.some(breakPeriod => {
            const [breakStartH, breakStartM] = breakPeriod.startTime.split(':').map(Number);
            const [breakEndH, breakEndM] = breakPeriod.endTime.split(':').map(Number);
            const breakStart = breakStartH * 60 + breakStartM;
            const breakEnd = breakEndH * 60 + breakEndM;

            return currentTime >= breakStart && currentTime < breakEnd; 
        })

        if (!isDuringBreak) {
            slots.push({
                startTime: timeString,
                endTime: formatTime(currentTime + duration),
                // label: `${timeString}`
            })
        }

        currentTime += duration;
    }
    return slots;
}

function formatTime(time) {
    const hour = Math.floor(time / 60);
    const minutes = time % 60;
    return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}