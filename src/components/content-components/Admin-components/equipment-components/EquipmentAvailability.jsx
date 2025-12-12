import { Tooltip } from "@mui/material";
import {useState } from "react"
import { DeleteIcon } from "../../../Icons.jsx";

export default function EquipmentAvailability({equipment, onUpdate}) {
    const [ available, setAvailable ] = useState(equipment?.available)
    
    const [ unavailableDates, setUnavailableDates ] = useState(equipment?.availabilityExceptions ? sortDates(equipment?.availabilityExceptions) : [])

    function sortDates(datesArray) {
        return datesArray.sort((dateA, dateB) => {
            const dateAStart = dateA.date 
                ? new Date(dateA.date).getTime() 
                : new Date(dateA.startDate).getTime();
            const dateBStart = dateB.date 
                ? new Date(dateB.date).getTime() 
                : new Date(dateB.startDate).getTime();
            
            return dateAStart - dateBStart; // ← Return a number, not boolean
        });
    }

    const [ unavailableDateType, setUnavailableDateType ] = useState('single')

    const [ formError, setFormError ] = useState('');
    const [ loading, setLoading ] = useState(false)

    const today = new Date()
    const minDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`

    const [ newUnavailableDate, setNewUnavailableDate ] = useState(`${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`)
    const [ newUnavailableStartDate, setNewUnavailableStartDate ] = useState(`${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`)
    const [ newUnavailableEndDate, setNewUnavailableEndDate ] = useState('')
    const [ newlyAddedDates, setNewlyAddedDates ] = useState([]);

    //AVAILABILITY
    async function handleSubmitAvailability(e) {
        e.preventDefault();
        setFormError('')
        const equipmentUpdates = {}

        const availabilityChanged = available !== equipment.available;
        if (!availabilityChanged) {
            setFormError('Availability has not changed')
            return
        }

        equipmentUpdates.available = available;
        setLoading(true)
        try {
            await onUpdate(equipmentUpdates)
            
        } catch (err) {
            console.log(err) 
            setFormError('Something went wrong. Please try again')
        } finally {
            setLoading(false)
        }
        return;
    }

    const [datesUpdated, setDatesUpdated] = useState(false)

    //BLOCKOUT DATES
    function handleAddDate() {
        setFormError('')
        if (unavailableDateType === 'single') {
            if (!newUnavailableDate) {
                setFormError('Must provide the date')
                return
            }
            const alreadySet = unavailableDates.some(date => 
                date.date === newUnavailableDate
            )
            if (alreadySet) {
                setFormError('The provided date is already set as unavailable')
                return
            }

            const fallsInRange = unavailableDates.some(date => {
            if (date.startDate && date.endDate) {
                const checkDate = new Date(newUnavailableDate);
                const startDate = new Date(date.startDate);
                const endDate = new Date(date.endDate);
                return checkDate >= startDate && checkDate <= endDate;
                }
                return false;
            });

            if (fallsInRange) {
                setFormError('The provided date falls within an existing date range');
                return;
            }

            setUnavailableDates(prev => [...prev, {date: newUnavailableDate}])
            setNewlyAddedDates(prev => [...prev, {date: newUnavailableDate}]);
            setNewUnavailableDate('')
            setDatesUpdated(true)
            
        } else if (unavailableDateType === 'range') {
            if (!newUnavailableStartDate || !newUnavailableEndDate) {
                setFormError('Must provide both dates')
                return
            }

            const order = new Date(newUnavailableStartDate).getTime() < new Date(newUnavailableEndDate).getTime()
            if (!order) {
                setFormError('End date must be after the start date')
                return
            }

            const exactRangeMatch = unavailableDates.some(date => 
                date.startDate === newUnavailableStartDate && 
                date.endDate === newUnavailableEndDate
            );

            if (exactRangeMatch) {
                setFormError('This date range is already set as unavailable');
                return;
            }

            const containsSingleDate = unavailableDates.some(date => {
                if (date.date) {
                    const checkDate = new Date(date.date);
                    const newStart = new Date(newUnavailableStartDate);
                    const newEnd = new Date(newUnavailableEndDate);
                    return checkDate >= newStart && checkDate <= newEnd;
                }
                return false;
                });

            if (containsSingleDate) {
                setFormError('This range includes dates already marked as unavailable');
                return;
            }

            const overlapsRange = unavailableDates.some(date => {
                if (date.startDate && date.endDate) {
                    const existingStart = new Date(date.startDate);
                    const existingEnd = new Date(date.endDate);
                    const newStart = new Date(newUnavailableStartDate);
                    const newEnd = new Date(newUnavailableEndDate);
                    
                    return (
                        (newStart <= existingEnd && newEnd >= existingStart)
                    );
                }
                return false;
            });

            if (overlapsRange) {
                setFormError('This range overlaps with an existing date range');
                return;
            }
            const newDate = {startDate: newUnavailableStartDate, endDate: newUnavailableEndDate}
            setUnavailableDates(prev => [...prev, newDate])
            setNewlyAddedDates(prev => [...prev, newDate]);
            setNewUnavailableStartDate('')
            setNewUnavailableEndDate('')
            setDatesUpdated(true)
        }
    }

    function handleDelete(dateToDelete) {
        if (dateToDelete.startDate) {
            setUnavailableDates((prev) => prev.filter(date => date.startDate !== dateToDelete.startDate))
        } else {
            setUnavailableDates((prev) => prev.filter(date => date.date !== dateToDelete.date))
        }
        setDatesUpdated(true)
    }

    async function handleSubmitDates(e) {
        e.preventDefault();
        setFormError('');

        const equipmentUpdates = {};
        
        // Check if lengths are different
        if (unavailableDates.length !== equipment.availabilityExceptions.length) {
            equipmentUpdates.availabilityExceptions = unavailableDates;
            setLoading(true);
            try {
                await onUpdate(equipmentUpdates);
                setUnavailableDates(sortDates(equipmentUpdates.availabilityExceptions) || [])
                setNewlyAddedDates([])
            } catch (err) {
                console.log(err);
                setFormError('Something went wrong. Please try again');
            } finally {
                setLoading(false);
            }
            return;
        }
            
        // Check if dates content changed
        const currentDates = unavailableDates.map(date => 
            date.date ? date.date : `${date.startDate}-${date.endDate}`
        ).sort().join(',');
        
        const previousDates = equipment.availabilityExceptions.map(date => 
            date.date ? date.date : `${date.startDate}-${date.endDate}`
        ).sort().join(',');
        
        const datesChanged = currentDates !== previousDates;

        if (!datesChanged) {
            setFormError('Unavailable Dates were not changed');
            return;
        }

        // Dates changed - update
        equipmentUpdates.availabilityExceptions = unavailableDates;
        setLoading(true);
        try {
            await onUpdate(equipmentUpdates);
            setUnavailableDates(sortDates(equipmentUpdates.availabilityExceptions) || [])
            setNewlyAddedDates([])
        } catch (err) {
            console.log(err);
            setFormError('Something went wrong. Please try again');
        } finally {
            setLoading(false);
        }
    }

    //Display functions
    function isDatePassed (date) {
        today.setHours(0, 0, 0, 0);
        
        if (date.date) {
            const checkDate = new Date(date.date + 'T00:00:00');
            return checkDate < today;
        } else {
            const endDate = new Date(date.endDate + 'T00:00:00');
            return endDate < today;
        }
    };

    function isNewlyAdded (date) {
        return newlyAddedDates.some(newDate => 
            (date.date && newDate.date === date.date) ||
            (date.startDate && (newDate.startDate === date.startDate && newDate.endDate === date.endDate))
        );
    };

    function handleRestore() {
        setUnavailableDates(equipment?.availabilityExceptions ? sortDates(equipment?.availabilityExceptions) : [])
        setDatesUpdated(false)
        setFormError('')
    }
    return (
        <section className="equipment-availability-group">
            <form onSubmit={handleSubmitAvailability}>
                <h2>Availability</h2>
                        <div className='input-group-wrapper'>
                            <input
                                type='radio'
                                id='available'
                                name='availability'
                                value='available'
                                checked={available}
                                onChange={() => setAvailable(true)}/>
                            <label htmlFor='available'>Available</label>
                        </div>
                        <div className='input-group-wrapper'>
                            <input
                                type='radio'
                                id='unavailable'
                                name='availability'
                                value='unavailable'
                                checked={!available}
                                onChange={() => setAvailable(false)}/>
                            <label htmlFor='unavailable'>Temporarily Unavailable</label>
                        </div>
                    <button type="submit" disabled={available === equipment.available}>{loading? "Saving" : 'Save'}</button>
            </form>
            <hr></hr>
            <form onSubmit={handleSubmitDates}>  
                <h2>Unavailable Dates</h2>
                        {unavailableDates.length > 0 ? (
                            unavailableDates.map(date => (
                                <div className={`input-group-wrapper ${isDatePassed(date) ? 'date-passed' : ''} ${isNewlyAdded(date) ? 'date-new' : ''}`} key={date.date || date.startDate}>
                                    {date.date ? (
                                        <p>{new Date(date.date + 'T00:00:00').toDateString()}</p>
                                    ) : (
                                        <>
                                            <p>{new Date((date.date || date.startDate) + 'T00:00:00').toDateString()}</p>
                                            –
                                            <p>{new Date(date.endDate + 'T00:00:00').toDateString()}</p>
                                        </>
                                    )}
                                    <Tooltip title="Delete Date" arrow placement="right">
                                        <DeleteIcon onClick={() => handleDelete(date)} />
                                    </Tooltip>
                                </div>
                            ))
                            ) : (
                                <p>No Dates</p>
                            )
                        }
                        <h4>+ Add unavailable dates</h4>
                            <div className='input-group-wrapper'>
                                <input
                                    type="radio"
                                    id="single"
                                    value="single"
                                    checked={unavailableDateType === 'single'}
                                    onChange={(e) => setUnavailableDateType(e.target.value)}
                                />
                                <label htmlFor="single">
                                Single Day
                                </label>
                            </div>
                            <div className='input-group-wrapper'>
                                <input
                                    type="radio"
                                    value="range"
                                    id="range"
                                    checked={unavailableDateType === 'range'}
                                    onChange={(e) => setUnavailableDateType(e.target.value)}
                                />
                                <label htmlFor="range">
                                    Date Range
                                </label>
                            </div>                            
                            {
                                unavailableDateType === 'single' ? (
                                    <div>
                                        <label htmlFor="startDate">Choose Date</label>
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            min={minDate}
                                            value={newUnavailableDate}
                                            onChange={e => setNewUnavailableDate(e.target.value)}
                                            />
                                    </div>
                                ) : (
                                    <>
                                        <div className='input-group-wrapper column'>
                                            <label htmlFor='start-date'>Start Date</label>
                                            <input
                                                type='date'
                                                id='start-date'
                                                name='date'
                                                min={minDate}
                                                value={newUnavailableStartDate}
                                                onChange={e => setNewUnavailableStartDate(e.target.value)}/>
                                            
                                        </div>
                                        <div className='input-group-wrapper column'>
                                            <label htmlFor='start-date'>End Date</label>
                                            <input
                                                type='date'
                                                id='end-date'
                                                name='date'
                                                min={newUnavailableStartDate || minDate}
                                                value={newUnavailableEndDate}
                                                onChange={e => setNewUnavailableEndDate(e.target.value)}/>
                                        </div>
                                    </>
                                )
                            }
                            <button type="button" onClick={handleAddDate}>+ Add Date</button>
                        {formError ? <p className='error-message'>{formError}</p> : null}
                    <button disabled={!datesUpdated} type="submit">{loading ? "Saving" : 'Save'}</button>
                    <button  disabled={!datesUpdated} type='button' onClick={handleRestore}>Restore</button>
                </form>
        </section>
        
    )
}