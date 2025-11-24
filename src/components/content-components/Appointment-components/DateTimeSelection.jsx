import { useState, useEffect} from 'react'
import { convertTime } from '../../../func/convertTime.js';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'; 
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useAvailability } from '../../../AvailabilityContext.jsx';
import dayjs from 'dayjs';

import './DateTimeSelection.css'

export default function DateTimeSelection({equipmentId, lab, submitDateTime, mode}) {

    const today = dayjs();
    const minDate = today.hour() >= 16 ? today.add(1, 'day') : today

    const { shouldDisableDate, loading } = useAvailability();

    const [selectedDate, setSelectedDate] = useState(mode?.prevDate ? dayjs(mode.prevDate) : null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);
    const [ availabilityExceptions, setAvailabilityExceptions ] = useState([]);

    //Allow shouldDisableDate to handle dayjs objects from the calendar
    function handleDisableDate (dayjsDate) {

        const generallyDisabled = shouldDisableDate(dayjsDate.toDate(), lab);
        if (generallyDisabled) {
            return true;
        }

        if (availabilityExceptions.length > 0) {
            const isUnavailable = availabilityExceptions.some(date => {
            // Single day
            if (date.date) {
                return date.date === dayjsDate.format('YYYY-MM-DD');
            }

            // Date range blackout
            if (date.startDate && date.endDate) {
                const dateStart = dayjs(date.startDate, 'YYYY-MM-DD');
                const dateEnd = dayjs(date.endDate, 'YYYY-MM-DD');
                return dayjsDate >= dateStart && dayjsDate <= dateEnd;
            }
            return false;
        });
        return isUnavailable;
        }

        return false;
    };  

    const appointmentId = mode?.appointmentId || null;

    useEffect(() => {
        if (selectedDate) {
            fetchAvailableSlots()
        }
    }, [selectedDate] )


    useEffect(() => {
        async function fetchEquipment(id) {
        try {
            const response = await fetch(`/api/equipment?id=${id}`)
            const data = await response.json()
                if (response.ok) {
                    setAvailabilityExceptions(data.equipment.availabilityExceptions)
                }
            } catch (err) {
                console.log(`Failed to fetch equipment: ${err}`)
            }
        }
        fetchEquipment(equipmentId)
    }, [equipmentId])

    async function fetchAvailableSlots() {
            try {
                const url = appointmentId ?
                    (`/api/availability/slots?equipmentId=${equipmentId}&date=${selectedDate.format('YYYY-MM-DD')}&appointmentId=${appointmentId}`
                ) : (
                    `/api/availability/slots?equipmentId=${equipmentId}&date=${selectedDate.format('YYYY-MM-DD')}`
                    )
                const response = await fetch(url)
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
                if (mode?.status === 'edit') {
                    const selectedDateObject = new Date(selectedDate)
                    const prevDateObject = new Date(mode.prevDate)
                if (selectedDateObject.getTime() === prevDateObject.getTime()) {
                    const matchSlot = data.slots.find(slot => slot.startTime === mode.prevTime)
                    setSelectedSlot(matchSlot)
                    console.log(`matchSlot: ${matchSlot.startTime}`)
            }
            }

            } catch (err) {
                console.log(`Error fetching slots: ${err}`)
            }
    }

    const maxDate = minDate.add(30, 'day');

    function handleDateSelect(value) {
        setSelectedDate(value);
        setSelectedSlot(null);
    }

    const [ isNewSlotSelected, setIsNewSlotSelected ] = useState(false);

    function handleSlotSelect(e) {
        e.preventDefault()
        setSelectedSlot(availableSlots.find((slot) => slot.startTime === e.target.value))
        setIsNewSlotSelected(true)
    }

    function handleSubmit(e) {
        e.preventDefault()
        if (!selectedSlot) return;

        const bookingDate = selectedDate.toDate();
        const [hours, minutes] = selectedSlot.startTime.split(':').map(Number);
        bookingDate.setHours(hours, minutes, 0, 0)

        // bookingDate.setUTCHours(hours, minutes, 0, 0)
        submitDateTime(bookingDate, selectedSlot)
    }

    return (
            <form className='date-time-form' onSubmit={handleSubmit}>
                <div className='calendar-form'>
                    <h2>Choose a day</h2>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar
                            className='date-picker'
                            value={selectedDate} // This should be a dayjs object
                            onChange={(newValue) => handleDateSelect(newValue)} // newValue is already a dayjs object
                            minDate={minDate}
                            maxDate={maxDate}
                            views={['day']}
                            showDaysOutsideCurrentMonth 
                            shouldDisableDate={handleDisableDate}
                            fixedWeekNumber={6}
                            sx={{
                                width: '100%',
                                minWidth: '310px',
                                '& .MuiDayCalendar-root': {
                                    width: '100%',
                                },

                                '& .MuiDayCalendar-header': {
                                    justifyContent: 'space-around',
                                },
                                '& .MuiDayCalendar-weekContainer': {
                                    justifyContent: 'space-between',
                                },
                                '& .MuiPickersDay-root': {
                                    flex: '1 0 auto',
                                }
                            }}
                        />
                    </LocalizationProvider>
                    {/* <button className='small' onClick={() => setSelectedDate(null)}>Clear</button> */}
                </div>
                
                {selectedDate ?
                    (<div className='time-form'>
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
                                        <div className='time-grid'>
                                            {availableSlots.map((slot, index) => (
                                                    <button
                                                        onClick={(e) => handleSlotSelect(e)}
                                                        key={index}
                                                        value={slot.startTime}
                                                        className={selectedSlot?.startTime === slot.startTime ? 'button-selected' : 'time-picker'}>
                                                        {convertTime(slot.startTime)}
                                                    </button>
                                            ))}
                                        </div>
                                    )
                                )
                            )
                        }
                        {isNewSlotSelected && <button className='date-time-confirm' onClick={handleSubmit}>Confirm</button>}
                    </div>) : (<div className='time-form empty'></div>)
                }
                
            </form>
            
    )
}


                                                    {/*                                                     
                                                    <input
                                                        id={slot.startTime}
                                                        value={slot.startTime}
                                                        checked={selectedSlot?.startTime === slot?.startTime}
                                                        type='radio'
                                                        className={`slot-button ${selectedSlot?.startTime === slot?.startTime ? 'selected' : ''}`}
                                                        onChange={handleSlotSelect}
                                                    />
                                                    <label key={index} htmlFor={slot.startTime}>
                                                    {convertTime(slot.startTime)}</label> */}