import { useState, useEffect} from 'react'

export default function DateTimeSelection({equipmentId}) {

    const today = new Date().toISOString().split('T')[0]

    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);

    const [loading, setLoading] = useState(false);

    // useEffect(() => {
    //     
    //     fetchAvailableSlots()
    // },[] )

    async function fetchAvailableSlots() {
            setLoading(true);
            try {
                const response = await fetch(`/api/availability/slots?equipmentId=${equipmentId}&date=${selectedDate}`)
                const data = response.json()

                if (data.available) {
                    setIsAvailable(data.available)
                    setAvailableSlots(data.slots)
                    setSelectedSlot(null)
                }
            } catch (err) {
                console.log(`Error fetching slots: ${err}`)
            } finally {
                setLoading(false);
            } //stoped here
    }

    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30) //30 days from now
    const maxDateString = maxDate.toISOString().split('T')[0]

    return (
        <section>
            <form>
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
                        <p>Select a time</p>

                        <label htmlFor="timeSlot">Choose a time</label>

                    </div>
                }
            </form>
            


            <button>Confirm</button>
        </section>
    )
}