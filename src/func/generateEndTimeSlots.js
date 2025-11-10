export function generateEndTimeSlots(startTime) {
        const slots = [];
        const closeTime = 17 * 60;
        
        const duration = 30;
        const [startHour, startMin] = startTime.split(':').map(Number);
        // const [endHour, endMin] = closeTime.split(':').map(Number);
        

        let currentTime = startHour * 60 + startMin + duration;
        const maxTime = 3 * 60 + currentTime;

        while (currentTime + duration <= maxTime && currentTime + duration <= closeTime) {
            const hour = Math.floor(currentTime / 60);
            const minutes = currentTime % 60;
            const timeString = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
            slots.push(timeString);
            currentTime += duration;
        }
        return slots;
}