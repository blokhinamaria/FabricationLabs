import { useState, useEffect, useLayoutEffect } from 'react'
import { convertTime } from '../../../func/convertTime.js';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'; 
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { generateEndTimeSlots } from '../../../func/generateEndTimeSlots.js';
import { useAvailability } from '../../../AvailabilityContext.jsx';
import dayjs from 'dayjs';

import './DateTimeSelection.css'

export default function DateTimeSelectionReservation({equipmentId, lab, submitDateTime, mode}) {

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, []);

    const today = dayjs();
    const minDate = today.hour() >= 16 ? today.add(1, 'day') : today

    const { shouldDisableDate } = useAvailability();

    const [ selectedDate, setSelectedDate] = useState(mode?.prevDate ? dayjs(mode.prevDate) : null);
    const [ availableSlots, setAvailableSlots] = useState([]);
    const [ selectedStartSlot, setSelectedStartSlot] = useState(null);
    const [ endTimeSlots, setEndTimeSlots ] = useState(null);
    const [ selectedEndSlot, setSelectedEndSlot ] = useState('')
    const [ isAvailable, setIsAvailable] = useState(true);
    const [ availabilityExceptions, setAvailabilityExceptions ] = useState([]);
    const [ formError, setFormError] = useState('')

    const appointmentId = mode?.appointmentId || null;

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
                    console.log(dateStart)
                    console.log(dateEnd)
                    console.log(dayjsDate)
                    return dayjsDate >= dateStart && dayjsDate <= dateEnd;
                }
                return false;
            });
            return isUnavailable;
            }
    
            return false;
        };

    

    useEffect(() => {
        if (selectedDate) {
            fetchAvailableSlots()
        }
    }, [selectedDate] )

    const [ loadingSlots, setLoadingSlots] = useState(false)
    
    async function fetchAvailableSlots() {
        setLoadingSlots(true)
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
                    setSelectedStartSlot(null)
                } else {
                    setIsAvailable(data.available)
                    setAvailableSlots([])
                    setSelectedStartSlot(null)
                }
                if (mode?.status === 'edit') {
                    const selectedDateObject = new Date(selectedDate)
                    const prevDateObject = new Date(mode.prevDate)
                if (selectedDateObject.getTime() === prevDateObject.getTime()) {
                    const matchSlot = data.slots.find(slot => slot.startTime === mode.prevTime)
                    console.log(`matchSlot: ${matchSlot}`)
                    setSelectedStartSlot(matchSlot)
            }
            }

            } catch (err) {
                console.log(`Error fetching slots: ${err}`)
            } finally {
                setLoadingSlots(false)
            }
    }

    const maxDate = minDate.add(60, 'day');

    const [ isNewSlotSelected, setIsNewSlotSelected ] = useState(false);

    function handleDateSelect(value) {
        setFormError('')
        setSelectedDate(value);
        setSelectedStartSlot(null);
        setSelectedEndSlot('');
        setIsNewSlotSelected(false);
    }

    function handleStartSlotSelect(e) {
        e.preventDefault()
        setSelectedStartSlot(availableSlots.find((slot) => slot.startTime === e.target.value));
        setIsNewSlotSelected(true);
        const generatedEndSlots = generateEndTimeSlots(e.target.value);
        setEndTimeSlots(generatedEndSlots)
        if(!selectedEndSlot) {
            setSelectedEndSlot(generatedEndSlots[0]);
        }
    }

    function handleEndSlotSelect(e) {
        e.preventDefault();
        setSelectedEndSlot(e.target.value);
    }

    function handleSubmit(e) {
        e.preventDefault()
        if (!selectedStartSlot || !selectedEndSlot) {
            setFormError('Both Start and End time must be set')
            return;
        } 

        const bookingDate = selectedDate.toDate();
        const [hours, minutes] = selectedStartSlot.startTime.split(':').map(Number);
        bookingDate.setHours(hours, minutes, 0, 0)

        const endTime = selectedDate.toDate();
        const [endHour, endMinutes] = selectedEndSlot.split(':').map(Number);
        endTime.setHours(endHour, endMinutes);

        // bookingDate.setUTCHours(hours, minutes, 0, 0)
        submitDateTime(bookingDate, selectedStartSlot.startTime, endTime)
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
                            shouldDisableDate={handleDisableDate}
                            showDaysOutsideCurrentMonth 
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
                </div>
                
                {selectedDate ?
                    (<div className='time-form'>
                        <h2>Choose a time</h2>
                        {loadingSlots ? 
                            <p>Loading available slots...</p>
                            : (
                                !isAvailable ? (
                                    <p>Lab is closed on this day</p>
                                ) : (
                                    availableSlots.length === 0 ? (
                                        <p>No slots available for this date</p>
                                    ) : (
                                        <div className='reservation-time-form'>
                                            <div className='input-group-wrapper column'>
                                                <label htmlFor='slot-start'>Select the Start Time</label>
                                                <select
                                                    id='slot-start'
                                                    value={selectedStartSlot?.startTime || ''}
                                                    onChange={handleStartSlotSelect}>
                                                        <option
                                                            value=''
                                                            disabled
                                                        >
                                                            Select start time
                                                        </option>
                                                    {availableSlots.map((slot, index) => (
                                                        <option
                                                            key={index}
                                                            value={slot.startTime}>
                                                            {convertTime(slot.startTime)}
                                                        </option>
                                                ))}
                                                </select>
                                            </div>
                                            {selectedStartSlot?.startTime && 
                                            
                                            <div className='input-group-wrapper column'>
                                                <label htmlFor='slot-end'>Select the End Time</label>
                                                <select
                                                    id='slot-end'
                                                    onChange={(e) => handleEndSlotSelect(e)}
                                                    value={selectedEndSlot}
                                                >
                                                    {endTimeSlots?.map((slot, index) => (
                                                        <option
                                                            key={index}
                                                            value={slot}>
                                                            {convertTime(slot)}
                                                        </option>
                                                ))}
                                                </select>
                                                <p>Max allowed reservations are 3 hours</p>
                                            </div>
}
                                            
                                            {formError && <p className='error-message'>{formError}</p>}
                                        </div>
                                    )
                                )
                            )
                        }
                        {isNewSlotSelected && 
                        <div className='date-time-confirm'>
                            <button onClick={handleSubmit}>Confirm</button>
                            <p className='error-message'>Please carefully verify your reservation date and time. Once you submit your reservation, any other students’ bookings for this equipment at that same date and time will be automatically cancelled.</p>
                        </div>
                        }
                    </div>) : (<div className='time-form empty'></div>)
                }
            </form>
            
    )
}