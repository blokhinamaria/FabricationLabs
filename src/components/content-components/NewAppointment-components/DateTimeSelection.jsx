import { useState, useEffect} from 'react'

export default function DateTimeSelection({equipmentId, submitDateTime}) {

    const today = new Date().toISOString().split('T')[0]

    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedDate && equipmentId) {
            fetchAvailableSlots()
        }
    }, [selectedDate, equipmentId] )

    async function fetchAvailableSlots() {
            setLoading(true);
            try {
                const response = await fetch(`/api/availability/slots?equipmentId=${equipmentId}&date=${selectedDate}`)
                const data = await response.json()
                console.log(data)

                if (data.available) {
                    setIsAvailable(data.available)
                    setAvailableSlots(data.slots)
                    setSelectedSlot(null)
                } else {
                    setIsAvailable(data.available)
                    setAvailableSlots([])
                    setSelectedSlot(null)
                }
            } catch (err) {
                console.log(`Error fetching slots: ${err}`)
            } finally {
                setLoading(false);
            }
    }

    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30) //30 days from now
    const maxDateString = maxDate.toISOString().split('T')[0]

    function handleSlotSelect(e) {
        setSelectedSlot(e.target.value)
    }

    function handleSubmit(e) {
        e.preventDafault()
        submitDateTime(selectedDate, selectedSlot)
    }

    console.log(selectedSlot)

    return (
        <section>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='date'>Select a day</label>
                    <input
                        type='date'
                        id='date'
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={today}
                        max={maxDateString}
                        required
                    />
                </div>
                
                {selectedDate &&
                    <div>
                        <p>Select Time Slot:</p>
                        {loading ? 
                            <p>Loading available slots...</p>
                            : (
                                !isAvailable ? (
                                    <p>Lab is closed on this day</p>
                                ) : (
                                    availableSlots.length === 0 ? (
                                        <p>No slots available for this date</p>
                                    ) : (
                                        availableSlots.map((slot, index) => (
                                            <label key={index} htmlFor={slot.startTime}>
                                            <input
                                                id={slot.startTime}
                                                value={slot.startTime}
                                                checked={selectedSlot === slot.startTime}
                                                type='radio'
                                                className={`slot-button ${selectedSlot === slot.startTime ? 'selected' : ''}`}
                                                onClick={handleSlotSelect}
                                            />
                                        {slot.startTime}</label>
                                    
                                ))
                                    )
                                )
                            )
                        }
                    </div>
                }
                {selectedSlot && <button>Confirm</button>}
            </form>
            


            
        </section>
    )
}