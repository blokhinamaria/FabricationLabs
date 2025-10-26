import { useState, useEffect} from 'react'

import './DateTimeSelection.css'

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
        setSelectedSlot(availableSlots.find((slot) => slot.startTime === e.target.value))
    }

    function handleSubmit(e) {
        e.preventDefault()
        if (!selectedSlot) return;
        submitDateTime(selectedDate, selectedSlot)
    }

    return (
        <article>
            <form className='date-time-form' onSubmit={handleSubmit}>
                <div>
                    <h2>Choose a day</h2>
                    <input
                        type='date'
                        id='date'
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={today}
                        max={maxDateString}
                        aria-label='Appointment date'
                        required
                    />
                </div>
                
                {selectedDate &&
                    <div>
                        <h2>Choose a time</h2>
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
                                            <div className='input-group-wrapper'>
                                            <input
                                                id={slot.startTime}
                                                value={slot.startTime}
                                                checked={selectedSlot?.startTime === slot?.startTime}
                                                type='radio'
                                                className={`slot-button ${selectedSlot?.startTime === slot?.startTime ? 'selected' : ''}`}
                                                onChange={handleSlotSelect}
                                            />
                                            <label key={index} htmlFor={slot.startTime}>
                                            {slot.startTime}</label>
                                            </div>
                                        ))
                                    )
                                )
                            )
                        }
                        {selectedSlot && <button onClick={handleSubmit}>Confirm</button>}
                    </div>
                }
            </form>
        </article>
    )
}